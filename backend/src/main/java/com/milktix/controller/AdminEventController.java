package com.milktix.controller;

import com.milktix.dto.*;
import com.milktix.entity.Event;
import com.milktix.repository.EventRepository;
import com.milktix.service.EventExportService;
import jakarta.persistence.criteria.Predicate;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/events")
@CrossOrigin(origins = "*", maxAge = 3600)
@PreAuthorize("hasRole('ADMIN')")
public class AdminEventController {

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private EventExportService eventExportService;

    /**
     * GET /api/admin/events - Get all events with filters
     * Filters: status, date range, host, organizer, location
     */
    @GetMapping
    public ResponseEntity<List<EventResponse>> getAllEventsWithFilters(
            @RequestParam(required = false) List<String> statuses,
            @RequestParam(required = false) LocalDate startDateFrom,
            @RequestParam(required = false) LocalDate startDateTo,
            @RequestParam(required = false) UUID hostId,
            @RequestParam(required = false) UUID organizerId,
            @RequestParam(required = false) UUID locationId,
            @RequestParam(required = false) String search) {

        Specification<Event> spec = buildSpecification(statuses, startDateFrom, startDateTo, 
                                                       hostId, organizerId, locationId, search);
        
        List<Event> events = eventRepository.findAll(spec, Sort.by(Sort.Direction.DESC, "startDateTime"));
        
        return ResponseEntity.ok(events.stream()
                .map(this::mapToEventResponse)
                .collect(Collectors.toList()));
    }

    /**
     * POST /api/admin/events/bulk - Bulk status change or publish/unpublish
     */
    @PostMapping("/bulk")
    public ResponseEntity<BulkOperationResponse> bulkUpdateEvents(
            @Valid @RequestBody BulkEventUpdateRequest request) {
        
        int successCount = 0;
        int failureCount = 0;
        List<String> errors = new ArrayList<>();

        for (UUID eventId : request.eventIds()) {
            try {
                Event event = eventRepository.findById(eventId)
                        .orElse(null);
                
                if (event == null) {
                    failureCount++;
                    errors.add("Event not found: " + eventId);
                    continue;
                }

                // Update status if provided
                if (request.newStatus() != null && !request.newStatus().isBlank()) {
                    try {
                        Event.Status newStatus = Event.Status.valueOf(request.newStatus().toUpperCase());
                        event.setStatus(newStatus);
                    } catch (IllegalArgumentException e) {
                        failureCount++;
                        errors.add("Invalid status '" + request.newStatus() + "' for event: " + eventId);
                        continue;
                    }
                }

                // Update published status via event type
                if (request.isPublished() != null) {
                    if (request.isPublished()) {
                        event.setStatus(Event.Status.PUBLISHED);
                    } else {
                        event.setStatus(Event.Status.DRAFT);
                    }
                }

                eventRepository.save(event);
                successCount++;
                
            } catch (Exception e) {
                failureCount++;
                errors.add("Error processing event " + eventId + ": " + e.getMessage());
            }
        }

        String message = String.format("Processed %d events: %d successful, %d failed", 
                request.eventIds().size(), successCount, failureCount);

        return ResponseEntity.ok(new BulkOperationResponse(
                failureCount == 0,
                successCount,
                failureCount,
                errors,
                message
        ));
    }

    /**
     * POST /api/admin/events/bulk-delete - Soft delete (mark as CANCELLED) in bulk
     */
    @PostMapping("/bulk-delete")
    public ResponseEntity<BulkOperationResponse> bulkDeleteEvents(
            @RequestBody List<UUID> eventIds) {
        
        int successCount = 0;
        int failureCount = 0;
        List<String> errors = new ArrayList<>();

        for (UUID eventId : eventIds) {
            try {
                Event event = eventRepository.findById(eventId)
                        .orElse(null);
                
                if (event == null) {
                    failureCount++;
                    errors.add("Event not found: " + eventId);
                    continue;
                }

                // Soft delete: mark as CANCELLED
                event.setStatus(Event.Status.CANCELLED);
                eventRepository.save(event);
                successCount++;
                
            } catch (Exception e) {
                failureCount++;
                errors.add("Error deleting event " + eventId + ": " + e.getMessage());
            }
        }

        String message = String.format("Processed %d events: %d deleted successfully, %d failed", 
                eventIds.size(), successCount, failureCount);

        return ResponseEntity.ok(new BulkOperationResponse(
                failureCount == 0,
                successCount,
                failureCount,
                errors,
                message
        ));
    }

    /**
     * GET /api/admin/events/export - CSV export endpoint
     */
    @PostMapping(value = "/export", produces = "text/csv")
    public ResponseEntity<byte[]> exportEvents(@RequestBody(required = false) EventExportRequest request) {
        
        // Build specification from export request filters
        Specification<Event> spec;
        if (request != null) {
            spec = buildSpecification(
                request.statuses(),
                request.startDateFrom(),
                request.startDateTo(),
                request.hostId(),
                request.organizerId(),
                request.locationId(),
                request.searchQuery()
            );
        } else {
            spec = Specification.where(null);
        }
        
        List<Event> events = eventRepository.findAll(spec, Sort.by(Sort.Direction.DESC, "startDateTime"));
        
        byte[] csvData = eventExportService.exportEventsToCsv(events);
        
        String filename = "events_export_" + LocalDate.now() + ".csv";
        
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(csvData);
    }

    /**
     * GET /api/admin/events/export - CSV export with query params (alternative)
     */
    @GetMapping(value = "/export", produces = "text/csv")
    public ResponseEntity<byte[]> exportEventsGet(
            @RequestParam(required = false) List<String> statuses,
            @RequestParam(required = false) LocalDate startDateFrom,
            @RequestParam(required = false) LocalDate startDateTo,
            @RequestParam(required = false) UUID hostId,
            @RequestParam(required = false) UUID organizerId,
            @RequestParam(required = false) UUID locationId,
            @RequestParam(required = false) String search) {
        
        Specification<Event> spec = buildSpecification(statuses, startDateFrom, startDateTo,
                                                       hostId, organizerId, locationId, search);
        
        List<Event> events = eventRepository.findAll(spec, Sort.by(Sort.Direction.DESC, "startDateTime"));
        
        byte[] csvData = eventExportService.exportEventsToCsv(events);
        
        String filename = "events_export_" + LocalDate.now() + ".csv";
        
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(csvData);
    }

    private Specification<Event> buildSpecification(List<String> statuses, LocalDate startDateFrom,
                                                    LocalDate startDateTo, UUID hostId, UUID organizerId,
                                                    UUID locationId, String search) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Filter by statuses
            if (statuses != null && !statuses.isEmpty()) {
                List<Event.Status> statusEnums = statuses.stream()
                        .map(s -> {
                            try {
                                return Event.Status.valueOf(s.toUpperCase());
                            } catch (IllegalArgumentException e) {
                                return null;
                            }
                        })
                        .filter(s -> s != null)
                        .collect(Collectors.toList());
                
                if (!statusEnums.isEmpty()) {
                    predicates.add(root.get("status").in(statusEnums));
                }
            }

            // Filter by date range
            if (startDateFrom != null) {
                LocalDateTime fromDateTime = startDateFrom.atStartOfDay();
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(
                        root.get("startDateTime"), fromDateTime));
            }

            if (startDateTo != null) {
                LocalDateTime toDateTime = startDateTo.atTime(LocalTime.MAX);
                predicates.add(criteriaBuilder.lessThanOrEqualTo(
                        root.get("startDateTime"), toDateTime));
            }

            // Filter by host
            if (hostId != null) {
                predicates.add(criteriaBuilder.equal(root.get("host").get("id"), hostId));
            }

            // Filter by organizer
            if (organizerId != null) {
                predicates.add(criteriaBuilder.equal(root.get("organizer").get("id"), organizerId));
            }

            // Filter by location
            if (locationId != null) {
                predicates.add(criteriaBuilder.equal(root.get("location").get("id"), locationId));
            }

            // Search by title or description
            if (search != null && !search.isBlank()) {
                String searchLower = "%" + search.toLowerCase() + "%";
                predicates.add(criteriaBuilder.or(
                        criteriaBuilder.like(criteriaBuilder.lower(root.get("title")), searchLower),
                        criteriaBuilder.like(criteriaBuilder.lower(root.get("description")), searchLower)
                ));
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }

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
                event.getStatus() != null ? event.getStatus().name() : null,
                event.getEventType() != null ? event.getEventType().name() : null,
                event.getImageUrl(),
                organizerSummary,
                hostDTO,
                locationDTO,
                event.getTicketTypes() != null ?
                        event.getTicketTypes().stream()
                                .map(this::mapToTicketTypeResponse)
                                .collect(Collectors.toList()) : null,
                event.getCategories() != null ?
                        event.getCategories().stream()
                                .map(c -> new CategoryResponse(c.getId(), c.getName(), c.getDescription(), c.getColor()))
                                .collect(Collectors.toList()) : null,
                event.isUpcoming(),
                event.isPast()
        );
    }

    private TicketTypeResponse mapToTicketTypeResponse(com.milktix.entity.TicketType tt) {
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
