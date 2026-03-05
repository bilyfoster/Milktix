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

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
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

    @Autowired
    private HostRepository hostRepository;

    @Autowired
    private LocationRepository locationRepository;

    // Get all published upcoming events (public)
    @GetMapping
    public ResponseEntity<List<EventResponse>> getAllEvents() {
        List<Event> events = eventRepository
                .findByStatusAndStartDateTimeAfterOrderByStartDateTimeAsc(
                        Event.Status.PUBLISHED, LocalDateTime.now());
        
        return ResponseEntity.ok(events.stream()
                .map(this::mapToEventResponse)
                .collect(Collectors.toList()));
    }

    // Get my events (for organizers)
    @GetMapping("/my")
    @PreAuthorize("hasRole('ORGANIZER') or hasRole('ADMIN')")
    public ResponseEntity<List<EventResponse>> getMyEvents(
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        List<Event> events = eventRepository
                .findByOrganizerIdOrderByStartDateTimeDesc(userDetails.getId());
        
        return ResponseEntity.ok(events.stream()
                .map(this::mapToEventResponse)
                .collect(Collectors.toList()));
    }

    // Get all events (admin only)
    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<EventResponse>> getAllEventsAdmin() {
        List<Event> events = eventRepository.findAllByOrderByStartDateTimeDesc();
        
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

        List<EventResponse> createdEvents = new ArrayList<>();
        
        // Check if this is a recurring event
        if (Boolean.TRUE.equals(request.isRecurring()) && request.recurrenceEndDate() != null) {
            // Generate recurring events
            LocalDate currentDate = request.startDateTime().toLocalDate();
            LocalDate endDate = request.recurrenceEndDate();
            
            while (!currentDate.isAfter(endDate)) {
                // Check if we should create an event for this date based on pattern
                if (shouldCreateEventForDate(currentDate, request)) {
                    Event event = createSingleEvent(request, organizer, currentDate);
                    createdEvents.add(mapToEventResponse(event));
                }
                currentDate = currentDate.plusDays(1);
            }
        } else {
            // Single event
            Event event = createSingleEvent(request, organizer, request.startDateTime().toLocalDate());
            createdEvents.add(mapToEventResponse(event));
        }

        return ResponseEntity.ok(createdEvents);
    }
    
    private boolean shouldCreateEventForDate(LocalDate date, EventCreateRequest request) {
        String pattern = request.recurrencePattern();
        LocalDate startDate = request.startDateTime().toLocalDate();
        
        return switch (pattern) {
            case "DAILY" -> true;
            case "WEEKLY" -> {
                // Check if day of week matches selected days
                String dayName = date.getDayOfWeek().name();
                List<String> days = request.recurrenceDaysOfWeek();
                yield days != null && days.contains(dayName);
            }
            case "BIWEEKLY" -> {
                // Every 2 weeks on the same day of week as start date
                long weeksBetween = java.time.temporal.ChronoUnit.WEEKS.between(startDate, date);
                yield weeksBetween % 2 == 0 && date.getDayOfWeek().equals(startDate.getDayOfWeek());
            }
            case "MONTHLY" -> date.getDayOfMonth() == startDate.getDayOfMonth();
            default -> date.equals(startDate);
        };
    }
    
    private Event createSingleEvent(EventCreateRequest request, User organizer, LocalDate date) {
        Event event = new Event();
        event.setTitle(request.title());
        event.setDescription(request.description());
        
        // Adjust datetime to the specific date
        LocalDateTime startDateTime = date.atTime(request.startDateTime().toLocalTime());
        LocalDateTime endDateTime = request.endDateTime() != null 
            ? date.atTime(request.endDateTime().toLocalTime())
            : null;
            
        event.setStartDateTime(startDateTime);
        event.setEndDateTime(endDateTime);
        event.setVenueName(request.venueName());
        event.setVenueAddress(request.venueAddress());
        event.setVenueCity(request.venueCity());
        event.setVenueState(request.venueState());
        event.setVenueZip(request.venueZip());
        event.setImageUrl(request.imageUrl());
        event.setOrganizer(organizer);
        event.setStatus(Event.Status.PUBLISHED);

        // Set host if provided
        if (request.hostId() != null) {
            hostRepository.findById(request.hostId())
                    .ifPresent(event::setHost);
        }

        // Set location if provided
        if (request.locationId() != null) {
            locationRepository.findById(request.locationId())
                    .ifPresent(event::setLocation);
        }

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

        return savedEvent;
    }

    // Helper method to map Event to EventResponse
    private EventResponse mapToEventResponse(Event event) {
        UserSummary organizerSummary = event.getOrganizer() != null ? 
                new UserSummary(event.getOrganizer().getId(), event.getOrganizer().getFullName()) : null;
        
        HostDTO hostDTO = event.getHost() != null ?
                new HostDTO(
                        event.getHost().getId(),
                        event.getHost().getName(),
                        event.getHost().getBio(),
                        event.getHost().getImageUrl(),
                        event.getHost().getWebsite(),
                        event.getHost().getEmail(),
                        event.getHost().getPhone()
                ) : null;
        
        LocationDTO locationDTO = event.getLocation() != null ?
                new LocationDTO(
                        event.getLocation().getId(),
                        event.getLocation().getName(),
                        event.getLocation().getDescription(),
                        event.getLocation().getAddress(),
                        event.getLocation().getCity(),
                        event.getLocation().getState(),
                        event.getLocation().getZipCode(),
                        event.getLocation().getCountry(),
                        event.getLocation().getLatitude(),
                        event.getLocation().getLongitude(),
                        event.getLocation().getImageUrl(),
                        event.getLocation().getWebsite(),
                        event.getLocation().getPhone(),
                        event.getLocation().getCapacity()
                ) : null;
        
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
                organizerSummary,
                hostDTO,
                locationDTO,
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