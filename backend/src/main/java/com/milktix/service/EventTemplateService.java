package com.milktix.service;

import com.milktix.entity.*;
import com.milktix.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class EventTemplateService {

    @Autowired
    private EventTemplateRepository templateRepository;

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private TicketTypeRepository ticketTypeRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private HostRepository hostRepository;

    @Autowired
    private LocationRepository locationRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Transactional
    public EventTemplate createTemplate(EventTemplate template, EventRecurrence recurrence, UUID organizerId) {
        User organizer = userRepository.findById(organizerId)
                .orElseThrow(() -> new RuntimeException("Organizer not found"));
        
        template.setOrganizer(organizer);
        
        if (recurrence != null) {
            recurrence.setTemplate(template);
            template.setRecurrence(recurrence);
        }
        
        return templateRepository.save(template);
    }

    @Transactional
    public List<Event> generateEventsFromTemplate(UUID templateId, LocalDate generateUpTo) {
        EventTemplate template = templateRepository.findById(templateId)
                .orElseThrow(() -> new RuntimeException("Template not found"));

        EventRecurrence recurrence = template.getRecurrence();
        if (recurrence == null) {
            throw new RuntimeException("Template has no recurrence rules");
        }

        List<Event> generatedEvents = new ArrayList<>();
        List<LocalDate> dates = calculateRecurrenceDates(recurrence, generateUpTo);
        
        UUID seriesId = UUID.randomUUID();
        int instanceNumber = 1;

        for (LocalDate date : dates) {
            Event event = createEventFromTemplate(template, date, recurrence.getStartTime(), recurrence.getEndTime());
            event.setTemplate(template);
            event.setSeriesId(seriesId);
            event.setSeriesInstanceNumber(instanceNumber++);
            event.setIsRecurringInstance(true);
            
            Event savedEvent = eventRepository.save(event);
            
            // Create ticket types
            for (TemplateTicketType templateTicket : template.getTicketTypes()) {
                TicketType ticket = new TicketType();
                ticket.setName(templateTicket.getName());
                ticket.setDescription(templateTicket.getDescription());
                ticket.setPrice(templateTicket.getPrice());
                ticket.setQuantityAvailable(templateTicket.getQuantityAvailable());
                ticket.setQuantitySold(0);
                ticket.setMinPerOrder(templateTicket.getMinPerOrder());
                ticket.setMaxPerOrder(templateTicket.getMaxPerOrder());
                ticket.setEvent(savedEvent);
                ticketTypeRepository.save(ticket);
            }
            
            generatedEvents.add(savedEvent);
        }

        return generatedEvents;
    }

    private List<LocalDate> calculateRecurrenceDates(EventRecurrence recurrence, LocalDate generateUpTo) {
        List<LocalDate> dates = new ArrayList<>();
        LocalDate current = recurrence.getStartDate();
        LocalDate endDate = recurrence.getEndDate() != null ? 
                recurrence.getEndDate().isBefore(generateUpTo) ? recurrence.getEndDate() : generateUpTo
                : generateUpTo;
        int maxOccurrences = recurrence.getMaxOccurrences() != null ? recurrence.getMaxOccurrences() : Integer.MAX_VALUE;
        int count = 0;

        while (!current.isAfter(endDate) && count < maxOccurrences) {
            switch (recurrence.getRecurrenceType()) {
                case DAILY:
                    dates.add(current);
                    current = current.plusDays(recurrence.getInterval());
                    break;
                    
                case WEEKLY:
                    // Handle multiple days per week
                    for (DayOfWeek dayOfWeek : recurrence.getDaysOfWeek()) {
                        LocalDate weekDate = current.with(TemporalAdjusters.nextOrSame(dayOfWeek));
                        if (!weekDate.isAfter(endDate) && count < maxOccurrences) {
                            dates.add(weekDate);
                            count++;
                        }
                    }
                    current = current.plusWeeks(recurrence.getInterval());
                    break;
                    
                case BIWEEKLY:
                    for (DayOfWeek dayOfWeek : recurrence.getDaysOfWeek()) {
                        LocalDate weekDate = current.with(TemporalAdjusters.nextOrSame(dayOfWeek));
                        if (!weekDate.isAfter(endDate) && count < maxOccurrences) {
                            dates.add(weekDate);
                            count++;
                        }
                    }
                    current = current.plusWeeks(2 * recurrence.getInterval());
                    break;
                    
                case MONTHLY:
                    dates.add(current);
                    current = current.plusMonths(recurrence.getInterval());
                    break;
                    
                case MONTHLY_WEEKDAY:
                    // e.g., "4th Wednesday of the month"
                    LocalDate monthDate = calculateMonthlyWeekday(current, recurrence);
                    if (monthDate != null && !monthDate.isAfter(endDate)) {
                        dates.add(monthDate);
                        current = current.plusMonths(recurrence.getInterval());
                    } else {
                        current = current.plusMonths(recurrence.getInterval());
                    }
                    break;
                    
                case CUSTOM:
                    dates.add(current);
                    // Custom logic based on interval
                    break;
            }
            count++;
        }

        return dates;
    }

    private LocalDate calculateMonthlyWeekday(LocalDate month, EventRecurrence recurrence) {
        DayOfWeek targetDay = recurrence.getDayOfWeek();
        Integer weekOfMonth = recurrence.getWeekOfMonth();
        
        if (targetDay == null || weekOfMonth == null) return null;
        
        LocalDate firstDayOfMonth = month.withDayOfMonth(1);
        LocalDate firstTargetDay = firstDayOfMonth.with(TemporalAdjusters.nextOrSame(targetDay));
        
        if (weekOfMonth == -1) {
            // Last occurrence
            return firstDayOfMonth.with(TemporalAdjusters.lastInMonth(targetDay));
        } else {
            // Nth occurrence (1-4)
            return firstTargetDay.plusWeeks(weekOfMonth - 1);
        }
    }

    private Event createEventFromTemplate(EventTemplate template, LocalDate date, LocalTime startTime, LocalTime endTime) {
        Event event = new Event();
        event.setTitle(template.getTitle());
        event.setDescription(template.getDescription());
        event.setImageUrl(template.getImageUrl());
        event.setOrganizer(template.getOrganizer());
        event.setHost(template.getHost());
        event.setLocation(template.getLocation());
        event.setCategories(new java.util.HashSet<>(template.getCategories()));
        event.setStatus(Event.Status.PUBLISHED);
        event.setEventType(Event.EventType.PUBLIC);
        
        // Set date/time
        LocalDateTime startDateTime = LocalDateTime.of(date, startTime);
        event.setStartDateTime(startDateTime);
        
        if (endTime != null) {
            LocalDateTime endDateTime = LocalDateTime.of(date, endTime);
            event.setEndDateTime(endDateTime);
        }
        
        // Set venue details from location
        if (template.getLocation() != null) {
            Location loc = template.getLocation();
            event.setVenueName(loc.getName());
            event.setVenueAddress(loc.getAddress());
            event.setVenueCity(loc.getCity());
            event.setVenueState(loc.getState());
            event.setVenueZip(loc.getZipCode());
        } else {
            event.setVenueName("TBD");
        }
        
        return event;
    }

    public List<EventTemplate> getMyTemplates(UUID organizerId) {
        return templateRepository.findByOrganizerIdOrderByCreatedAtDesc(organizerId);
    }
}
