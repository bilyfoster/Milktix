package com.milktix.controller;

import com.milktix.dto.TicketResponse;
import com.milktix.entity.Ticket;
import com.milktix.entity.User;
import com.milktix.repository.TicketRepository;
import com.milktix.security.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/tickets")
@CrossOrigin(origins = "*", maxAge = 3600)
public class TicketController {

    @Autowired
    private TicketRepository ticketRepository;

    // Get my tickets
    @GetMapping("/my")
    public ResponseEntity<List<TicketResponse>> getMyTickets(
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        
        List<Ticket> tickets = ticketRepository.findByAttendeeId(userDetails.getId());
        
        return ResponseEntity.ok(tickets.stream()
                .map(this::mapToTicketResponse)
                .collect(Collectors.toList()));
    }

    // Check in ticket (Organizer/Admin only)
    @PostMapping("/{ticketNumber}/checkin")
    @PreAuthorize("hasRole('ORGANIZER') or hasRole('ADMIN')")
    public ResponseEntity<?> checkInTicket(@PathVariable String ticketNumber) {
        Ticket ticket = ticketRepository.findByTicketNumber(ticketNumber)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));
        
        if (!ticket.isValid()) {
            return ResponseEntity.badRequest().body("Ticket is not valid for check-in");
        }
        
        ticket.checkIn();
        ticketRepository.save(ticket);
        
        return ResponseEntity.ok(mapToTicketResponse(ticket));
    }

    // Verify ticket (public endpoint for scanning)
    @GetMapping("/{ticketNumber}/verify")
    public ResponseEntity<?> verifyTicket(@PathVariable String ticketNumber) {
        Ticket ticket = ticketRepository.findByTicketNumber(ticketNumber)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));
        
        return ResponseEntity.ok(new TicketVerificationResponse(
                ticket.getTicketNumber(),
                ticket.getTicketType().getEvent().getTitle(),
                ticket.getTicketType().getName(),
                ticket.getStatus().name(),
                ticket.isValid()
        ));
    }

    private TicketResponse mapToTicketResponse(Ticket ticket) {
        return new TicketResponse(
                ticket.getId(),
                ticket.getTicketNumber(),
                new com.milktix.dto.TicketTypeSummary(
                        ticket.getTicketType().getId(),
                        ticket.getTicketType().getName(),
                        ticket.getTicketType().getPrice()
                ),
                ticket.getAttendeeName(),
                ticket.getAttendeeEmail(),
                ticket.getStatus().name(),
                ticket.getQrCodeData(),
                ticket.getCheckedInAt() != null ? ticket.getCheckedInAt().toString() : null
        );
    }

    public record TicketVerificationResponse(
            String ticketNumber,
            String eventTitle,
            String ticketType,
            String status,
            boolean isValid
    ) {}
}