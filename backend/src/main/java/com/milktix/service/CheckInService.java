package com.milktix.service;

import com.milktix.dto.CheckInRequest;
import com.milktix.dto.CheckInResponse;
import com.milktix.entity.*;
import com.milktix.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class CheckInService {

    @Autowired
    private CheckInRepository checkInRepository;

    @Autowired
    private TicketRepository ticketRepository;

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EventCheckInStatsRepository statsRepository;

    @Transactional
    public CheckInResponse checkInTicket(CheckInRequest request, UUID staffUserId) {
        Ticket ticket = ticketRepository.findByTicketNumber(request.ticketNumber())
            .orElseThrow(() -> new RuntimeException("Ticket not found"));

        // Validate ticket status
        if (ticket.getStatus() == Ticket.Status.CANCELLED) {
            return CheckInResponse.error("Ticket has been cancelled");
        }
        if (ticket.getStatus() == Ticket.Status.REFUNDED) {
            return CheckInResponse.error("Ticket has been refunded");
        }
        if (ticket.getStatus() == Ticket.Status.USED) {
            return CheckInResponse.error("Ticket already checked in");
        }

        // Check if already checked in today (prevent double check-in)
        Optional<CheckIn> existingCheckIn = checkInRepository.findByTicketIdAndRevertedAtIsNull(ticket.getId());
        if (existingCheckIn.isPresent()) {
            return CheckInResponse.error("Ticket already checked in at " + existingCheckIn.get().getCheckedInAt());
        }

        // Mark ticket as used
        ticket.setStatus(Ticket.Status.USED);
        ticketRepository.save(ticket);

        // Record check-in
        CheckIn checkIn = new CheckIn();
        checkIn.setTicket(ticket);
        checkIn.setEvent(ticket.getTicketType().getEvent());
        
        User staff = new User();
        staff.setId(staffUserId);
        checkIn.setCheckedInBy(staff);
        
        checkIn.setCheckInMethod(CheckIn.CheckInMethod.valueOf(request.method()));
        checkIn.setCheckInStation(request.stationId());
        checkIn.setLatitude(request.latitude());
        checkIn.setLongitude(request.longitude());
        checkIn.setNotes(request.notes());
        
        checkInRepository.save(checkIn);

        // Update stats
        updateCheckInStats(checkIn.getEvent().getId());

        return CheckInResponse.success(
            ticket.getTicketNumber(),
            ticket.getAttendeeName(),
            ticket.getTicketType().getName(),
            checkIn.getCheckedInAt()
        );
    }

    @Transactional
    public CheckInResponse revertCheckIn(UUID ticketId, UUID staffUserId, String reason) {
        CheckIn checkIn = checkInRepository.findByTicketIdAndRevertedAtIsNull(ticketId)
            .orElseThrow(() -> new RuntimeException("Active check-in not found"));

        Ticket ticket = checkIn.getTicket();
        
        // Revert ticket status
        ticket.setStatus(Ticket.Status.VALID);
        ticketRepository.save(ticket);

        // Mark check-in as reverted
        checkIn.setRevertedAt(LocalDateTime.now());
        User staff = new User();
        staff.setId(staffUserId);
        checkIn.setRevertedBy(staff);
        checkIn.setRevertReason(reason);
        checkInRepository.save(checkIn);

        // Update stats
        updateCheckInStats(checkIn.getEvent().getId());

        return CheckInResponse.success(
            ticket.getTicketNumber(),
            ticket.getAttendeeName(),
            ticket.getTicketType().getName(),
            null
        );
    }

    @Transactional(readOnly = true)
    public List<CheckInResponse> getAttendeeList(UUID eventId, String search) {
        List<Ticket> tickets = ticketRepository.findByTicketType_EventId(eventId);
        
        List<CheckInResponse> attendees = new ArrayList<>();
        for (Ticket ticket : tickets) {
            if (search != null && !search.isEmpty()) {
                String searchLower = search.toLowerCase();
                String attendeeName = ticket.getAttendeeName() != null ? ticket.getAttendeeName().toLowerCase() : "";
                String ticketNumber = ticket.getTicketNumber().toLowerCase();
                String email = ticket.getOrder() != null && ticket.getOrder().getBillingEmail() != null 
                    ? ticket.getOrder().getBillingEmail().toLowerCase() : "";
                
                if (!attendeeName.contains(searchLower) && 
                    !ticketNumber.contains(searchLower) && 
                    !email.contains(searchLower)) {
                    continue;
                }
            }

            Optional<CheckIn> checkIn = checkInRepository.findByTicketIdAndRevertedAtIsNull(ticket.getId());
            
            attendees.add(new CheckInResponse(
                true,
                null,
                ticket.getTicketNumber(),
                ticket.getAttendeeName(),
                ticket.getTicketType().getName(),
                ticket.getOrder() != null ? ticket.getOrder().getBillingEmail() : null,
                ticket.getStatus().toString(),
                checkIn.map(CheckIn::getCheckedInAt).orElse(null),
                checkIn.map(c -> c.getCheckedInBy() != null ? c.getCheckedInBy().getFullName() : null).orElse(null),
                null
            ));
        }
        
        return attendees;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getCheckInStats(UUID eventId) {
        EventCheckInStats stats = statsRepository.findById(eventId)
            .orElseGet(() -> {
                updateCheckInStats(eventId);
                return statsRepository.findById(eventId).orElse(new EventCheckInStats());
            });

        Map<String, Object> result = new HashMap<>();
        result.put("totalTickets", stats.getTotalTickets());
        result.put("checkedIn", stats.getCheckedIn());
        result.put("noShow", stats.getNoShow());
        result.put("checkInRate", stats.getCheckInRate());
        
        // Add hourly breakdown
        List<Map<String, Object>> hourlyBreakdown = checkInRepository.getHourlyCheckIns(eventId);
        result.put("hourlyBreakdown", hourlyBreakdown);
        
        return result;
    }

    @Transactional
    protected void updateCheckInStats(UUID eventId) {
        Event event = eventRepository.findById(eventId).orElseThrow();
        
        int totalTickets = (int) ticketRepository.countByTicketType_EventIdAndStatusNotIn(event.getId(), 
            java.util.List.of(Ticket.Status.CANCELLED, Ticket.Status.REFUNDED));
        int checkedIn = checkInRepository.countByEventIdAndRevertedAtIsNull(eventId);
        int noShow = totalTickets - checkedIn;
        double checkInRate = totalTickets > 0 ? (double) checkedIn / totalTickets * 100 : 0;

        EventCheckInStats stats = statsRepository.findById(eventId).orElse(new EventCheckInStats());
        stats.setEvent(event);
        stats.setTotalTickets(totalTickets);
        stats.setCheckedIn(checkedIn);
        stats.setNoShow(noShow);
        stats.setCheckInRate(BigDecimal.valueOf(checkInRate).setScale(2, BigDecimal.ROUND_HALF_UP).doubleValue());
        stats.setLastUpdated(LocalDateTime.now());
        
        statsRepository.save(stats);
    }
}
