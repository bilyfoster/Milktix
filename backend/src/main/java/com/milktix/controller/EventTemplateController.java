package com.milktix.controller;

import com.milktix.dto.*;
import com.milktix.entity.*;
import com.milktix.security.UserDetailsImpl;
import com.milktix.service.EventTemplateService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/templates")
@CrossOrigin(origins = "*", maxAge = 3600)
public class EventTemplateController {

    @Autowired
    private EventTemplateService templateService;

    @GetMapping
    @PreAuthorize("hasRole('ORGANIZER') or hasRole('ADMIN')")
    public ResponseEntity<List<TemplateResponse>> getMyTemplates(
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        
        List<EventTemplate> templates = templateService.getMyTemplates(userDetails.getId());
        return ResponseEntity.ok(templates.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList()));
    }

    @PostMapping
    @PreAuthorize("hasRole('ORGANIZER') or hasRole('ADMIN')")
    public ResponseEntity<?> createTemplate(
            @Valid @RequestBody CreateTemplateRequest request,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        
        try {
            EventTemplate template = new EventTemplate();
            template.setName(request.name());
            template.setTitle(request.title());
            template.setDescription(request.description());
            template.setImageUrl(request.imageUrl());
            
            // Set host if provided
            if (request.hostId() != null) {
                Host host = new Host();
                host.setId(request.hostId());
                template.setHost(host);
            }
            
            // Set location if provided
            if (request.locationId() != null) {
                Location location = new Location();
                location.setId(request.locationId());
                template.setLocation(location);
            }
            
            // Set categories
            if (request.categoryIds() != null) {
                for (UUID catId : request.categoryIds()) {
                    Category cat = new Category();
                    cat.setId(catId);
                    template.getCategories().add(cat);
                }
            }
            
            // Set ticket types
            if (request.ticketTypes() != null) {
                for (TicketTypeRequest ttReq : request.ticketTypes()) {
                    TemplateTicketType tt = new TemplateTicketType();
                    tt.setName(ttReq.name());
                    tt.setDescription(ttReq.description());
                    tt.setPrice(ttReq.price());
                    tt.setQuantityAvailable(ttReq.quantityAvailable());
                    tt.setMinPerOrder(ttReq.minPerOrder());
                    tt.setMaxPerOrder(ttReq.maxPerOrder());
                    tt.setTemplate(template);
                    template.getTicketTypes().add(tt);
                }
            }
            
            // Create recurrence if provided
            EventRecurrence recurrence = null;
            if (request.recurrence() != null) {
                RecurrenceRequest recReq = request.recurrence();
                recurrence = new EventRecurrence();
                recurrence.setRecurrenceType(EventRecurrence.RecurrenceType.valueOf(recReq.recurrenceType()));
                recurrence.setStartDate(recReq.startDate());
                recurrence.setEndDate(recReq.endDate());
                recurrence.setMaxOccurrences(recReq.maxOccurrences());
                recurrence.setStartTime(recReq.startTime());
                recurrence.setEndTime(recReq.endTime());
                recurrence.setInterval(recReq.interval() != null ? recReq.interval() : 1);
                
                // Handle days of week
                if (recReq.daysOfWeek() != null) {
                    recurrence.setDaysOfWeek(recReq.daysOfWeek().stream()
                            .map(DayOfWeek::valueOf)
                            .collect(Collectors.toList()));
                }
                
                // Handle monthly weekday pattern
                if (recReq.weekOfMonth() != null) {
                    recurrence.setWeekOfMonth(recReq.weekOfMonth());
                }
                if (recReq.dayOfWeek() != null) {
                    recurrence.setDayOfWeek(DayOfWeek.valueOf(recReq.dayOfWeek()));
                }
            }
            
            EventTemplate saved = templateService.createTemplate(template, recurrence, userDetails.getId());
            return ResponseEntity.ok(mapToResponse(saved));
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to create template: " + e.getMessage());
        }
    }

    @PostMapping("/{templateId}/generate")
    @PreAuthorize("hasRole('ORGANIZER') or hasRole('ADMIN')")
    public ResponseEntity<?> generateEvents(
            @PathVariable UUID templateId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate generateUpTo) {
        
        try {
            List<Event> events = templateService.generateEventsFromTemplate(templateId, generateUpTo);
            return ResponseEntity.ok(events.stream()
                    .map(this::mapToEventResponse)
                    .collect(Collectors.toList()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to generate events: " + e.getMessage());
        }
    }

    private TemplateResponse mapToResponse(EventTemplate template) {
        return new TemplateResponse(
                template.getId(),
                template.getName(),
                template.getTitle(),
                template.getDescription(),
                template.getImageUrl(),
                template.getHost() != null ? template.getHost().getId() : null,
                template.getHost() != null ? template.getHost().getName() : null,
                template.getLocation() != null ? template.getLocation().getId() : null,
                template.getLocation() != null ? template.getLocation().getName() : null,
                template.getRecurrence() != null ? mapToRecurrenceResponse(template.getRecurrence()) : null,
                template.getTicketTypes().stream()
                        .map(tt -> new TemplateTicketTypeResponse(
                                tt.getId(), tt.getName(), tt.getDescription(),
                                tt.getPrice(), tt.getQuantityAvailable(),
                                tt.getMinPerOrder(), tt.getMaxPerOrder()))
                        .collect(Collectors.toList()),
                template.getCategories().stream()
                        .map(c -> c.getId())
                        .collect(Collectors.toList()),
                template.getCreatedAt()
        );
    }

    private RecurrenceResponse mapToRecurrenceResponse(EventRecurrence rec) {
        return new RecurrenceResponse(
                rec.getId(),
                rec.getRecurrenceType().name(),
                rec.getDaysOfWeek() != null ? rec.getDaysOfWeek().stream().map(DayOfWeek::name).collect(Collectors.toList()) : null,
                rec.getWeekOfMonth(),
                rec.getDayOfWeek() != null ? rec.getDayOfWeek().name() : null,
                rec.getInterval(),
                rec.getStartDate(),
                rec.getEndDate(),
                rec.getMaxOccurrences(),
                rec.getStartTime(),
                rec.getEndTime()
        );
    }

    private EventSummary mapToEventResponse(Event event) {
        return new EventSummary(
                event.getId(),
                event.getTitle(),
                event.getStartDateTime().toString(),
                event.getVenueName()
        );
    }

    // DTO Records
    public record CreateTemplateRequest(
            String name,
            String title,
            String description,
            String imageUrl,
            UUID hostId,
            UUID locationId,
            List<UUID> categoryIds,
            List<TicketTypeRequest> ticketTypes,
            RecurrenceRequest recurrence
    ) {}

    public record RecurrenceRequest(
            String recurrenceType,
            List<String> daysOfWeek,
            Integer weekOfMonth,
            String dayOfWeek,
            Integer interval,
            LocalDate startDate,
            LocalDate endDate,
            Integer maxOccurrences,
            LocalTime startTime,
            LocalTime endTime
    ) {}

    public record TicketTypeRequest(
            String name,
            String description,
            BigDecimal price,
            Integer quantityAvailable,
            Integer minPerOrder,
            Integer maxPerOrder
    ) {}

    public record TemplateResponse(
            UUID id,
            String name,
            String title,
            String description,
            String imageUrl,
            UUID hostId,
            String hostName,
            UUID locationId,
            String locationName,
            RecurrenceResponse recurrence,
            List<TemplateTicketTypeResponse> ticketTypes,
            List<UUID> categoryIds,
            java.time.LocalDateTime createdAt
    ) {}

    public record RecurrenceResponse(
            UUID id,
            String recurrenceType,
            List<String> daysOfWeek,
            Integer weekOfMonth,
            String dayOfWeek,
            Integer interval,
            LocalDate startDate,
            LocalDate endDate,
            Integer maxOccurrences,
            LocalTime startTime,
            LocalTime endTime
    ) {}

    public record TemplateTicketTypeResponse(
            UUID id,
            String name,
            String description,
            BigDecimal price,
            Integer quantityAvailable,
            Integer minPerOrder,
            Integer maxPerOrder
    ) {}
}
