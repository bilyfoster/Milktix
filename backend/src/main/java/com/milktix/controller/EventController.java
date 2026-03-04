package com.milktix.controller;

import com.milktix.dto.*;
import com.milktix.entity.*;
import com.milktix.repository.*;
import com.milktix.security.UserDetailsImpl;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/events")
@CrossOrigin(origins = "*", maxAge = 3600)
public class EventController {

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private TicketTypeRepository ticketTypeRepository;

    @Autowired
    private UserRepository userRepository;

    // Get all published upcoming events
    @GetMapping
    public ResponseEntity<List<EventResponse>> getAllEvents() {
        List<Event> events = eventRepository
                .findByStatusAndStartDateTimeAfterOrderByStartDateTimeAsc(
                        Event.Status.PUBLISHED, LocalDateTime.now());
        
        return ResponseEntity.ok(events.stream()
                .map(this::mapToEventResponse)
                .collect(Collectors.toList()));
    }

    // Get events created by the current organizer
    @GetMapping("/my-events")
    @PreAuthorize("hasRole('ORGANIZER') or hasRole('ADMIN')")
    public ResponseEntity<List<EventResponse>> getMyEvents(
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        
        User organizer = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        List<Event> events = eventRepository.findByOrganizerOrderByStartDateTimeDesc(organizer);
        
        return ResponseEntity.ok(events.stream()
                .map(this::mapToEventResponse)
                .collect(Collectors.toList()));
    }

    // Get event by ID
    @GetMapping("/{id}")
    public ResponseEntity<EventResponse> getEventById(@PathVariable UUID id) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Event not found"));
        
        return ResponseEntity.ok(mapToEventResponse(event));
    }

    // Create new event (Organizer or Admin only)
    @PostMapping
    @PreAuthorize("hasRole('ORGANIZER') or hasRole('ADMIN')")
    public ResponseEntity<?> createEvent(
            @Valid @RequestBody EventCreateRequest request,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        
        User organizer = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Event event = new Event();
        event.setTitle(request.title());
        event.setDescription(request.description());
        event.setStartDateTime(request.startDateTime());
        event.setEndDateTime(request.endDateTime());
        event.setVenueName(request.venueName());
        event.setVenueAddress(request.venueAddress());
        event.setVenueCity(request.venueCity());
        event.setVenueState(request.venueState());
        event.setVenueZip(request.venueZip());
        event.setImageUrl(request.imageUrl());
        event.setOrganizer(organizer);
        event.setStatus(Event.Status.PUBLISHED);

        // Add categories
        if (request.categoryIds() != null) {
            for (UUID categoryId : request.categoryIds()) {
                categoryRepository.findById(categoryId)
                        .ifPresent(event.getCategories()::add);
            }
        }

        Event savedEvent = eventRepository.save(event);

        // Create ticket types
        if (request.ticketTypes() != null) {
            for (TicketTypeRequest ttReq : request.ticketTypes()) {
                TicketType ticketType = new TicketType();
                ticketType.setName(ttReq.name());
                ticketType.setDescription(ttReq.description());
                ticketType.setPrice(ttReq.price());
                ticketType.setQuantityAvailable(ttReq.quantityAvailable());
                ticketType.setMinPerOrder(ttReq.minPerOrder() != null ? ttReq.minPerOrder() : 1);
                ticketType.setMaxPerOrder(ttReq.maxPerOrder() != null ? ttReq.maxPerOrder() : 10);
                ticketType.setSalesStart(ttReq.salesStart());
                ticketType.setSalesEnd(ttReq.salesEnd());
                ticketType.setEvent(savedEvent);
                ticketTypeRepository.save(ticketType);
            }
        }

        return ResponseEntity.ok(mapToEventResponse(savedEvent));
    }

    // Create a new ticket type for an event
    @PostMapping("/{id}/ticket-types")
    @PreAuthorize("hasRole('ORGANIZER') or hasRole('ADMIN')")
    public ResponseEntity<?> createTicketType(
            @PathVariable UUID id,
            @Valid @RequestBody TicketTypeRequest request,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Event not found"));
        
        // Verify the current user is the organizer
        if (!event.getOrganizer().getId().equals(userDetails.getId()) && 
            !userDetails.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
            return ResponseEntity.status(403).body("Not authorized to modify this event");
        }
        
        TicketType ticketType = new TicketType();
        ticketType.setName(request.name());
        ticketType.setDescription(request.description());
        ticketType.setPrice(request.price());
        ticketType.setQuantityAvailable(request.quantityAvailable());
        ticketType.setMinPerOrder(request.minPerOrder() != null ? request.minPerOrder() : 1);
        ticketType.setMaxPerOrder(request.maxPerOrder() != null ? request.maxPerOrder() : 10);
        ticketType.setSalesStart(request.salesStart());
        ticketType.setSalesEnd(request.salesEnd());
        ticketType.setEvent(event);
        
        TicketType savedTicketType = ticketTypeRepository.save(ticketType);
        
        return ResponseEntity.ok(mapToTicketTypeResponse(savedTicketType));
    }
    
    // Update a ticket type
    @PutMapping("/{eventId}/ticket-types/{ticketTypeId}")
    @PreAuthorize("hasRole('ORGANIZER') or hasRole('ADMIN')")
    public ResponseEntity<?> updateTicketType(
            @PathVariable UUID eventId,
            @PathVariable UUID ticketTypeId,
            @Valid @RequestBody TicketTypeRequest request,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));
        
        // Verify the current user is the organizer
        if (!event.getOrganizer().getId().equals(userDetails.getId()) && 
            !userDetails.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
            return ResponseEntity.status(403).body("Not authorized to modify this event");
        }
        
        TicketType ticketType = ticketTypeRepository.findById(ticketTypeId)
                .orElseThrow(() -> new RuntimeException("Ticket type not found"));
        
        ticketType.setName(request.name());
        ticketType.setDescription(request.description());
        ticketType.setPrice(request.price());
        ticketType.setQuantityAvailable(request.quantityAvailable());
        if (request.minPerOrder() != null) ticketType.setMinPerOrder(request.minPerOrder());
        if (request.maxPerOrder() != null) ticketType.setMaxPerOrder(request.maxPerOrder());
        if (request.salesStart() != null) ticketType.setSalesStart(request.salesStart());
        if (request.salesEnd() != null) ticketType.setSalesEnd(request.salesEnd());
        
        TicketType updatedTicketType = ticketTypeRepository.save(ticketType);
        
        return ResponseEntity.ok(mapToTicketTypeResponse(updatedTicketType));
    }
    
    // Delete a ticket type
    @DeleteMapping("/{eventId}/ticket-types/{ticketTypeId}")
    @PreAuthorize("hasRole('ORGANIZER') or hasRole('ADMIN')")
    public ResponseEntity<?> deleteTicketType(
            @PathVariable UUID eventId,
            @PathVariable UUID ticketTypeId,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));
        
        // Verify the current user is the organizer
        if (!event.getOrganizer().getId().equals(userDetails.getId()) && 
            !userDetails.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
            return ResponseEntity.status(403).body("Not authorized to modify this event");
        }
        
        TicketType ticketType = ticketTypeRepository.findById(ticketTypeId)
                .orElseThrow(() -> new RuntimeException("Ticket type not found"));
        
        ticketTypeRepository.delete(ticketType);
        
        return ResponseEntity.ok().build();
    }

    // Helper method to map Event to EventResponse
    private EventResponse mapToEventResponse(Event event) {
        return new EventResponse(
                event.getId(),
                event.getTitle(),
                event.getDescription(),
                event.getStartDateTime(),
                event.getEndDateTime(),
                event.getVenueName(),
                event.getVenueAddress(),
                event.getVenueCity(),
                event.getVenueState(),
                event.getVenueZip(),
                event.getStatus().name(),
                event.getEventType().name(),
                event.getImageUrl(),
                event.getOrganizer() != null ? 
                        new UserSummary(event.getOrganizer().getId(), event.getOrganizer().getFullName()) : null,
                event.getTicketTypes().stream()
                        .map(this::mapToTicketTypeResponse)
                        .collect(Collectors.toList()),
                event.getCategories().stream()
                        .map(c -> new CategoryResponse(c.getId(), c.getName(), c.getDescription(), c.getColor()))
                        .collect(Collectors.toList()),
                event.isUpcoming(),
                event.isPast()
        );
    }

    private TicketTypeResponse mapToTicketTypeResponse(TicketType tt) {
        return new TicketTypeResponse(
                tt.getId(),
                tt.getName(),
                tt.getDescription(),
                tt.getPrice(),
                tt.getQuantityAvailable(),
                tt.getQuantitySold(),
                tt.getQuantityRemaining(),
                tt.getMinPerOrder(),
                tt.getMaxPerOrder(),
                tt.isAvailable()
        );
    }
}