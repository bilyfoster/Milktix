package com.milktix.controller;

import com.milktix.dto.CheckInRequest;
import com.milktix.dto.CheckInResponse;
import com.milktix.security.UserDetailsImpl;
import com.milktix.service.CheckInService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/checkin")
@CrossOrigin(origins = "*", maxAge = 3600)
public class CheckInController {

    @Autowired
    private CheckInService checkInService;

    // Check in a ticket (QR scan or manual)
    @PostMapping
    @PreAuthorize("hasRole('ORGANIZER') or hasRole('ADMIN')")
    public ResponseEntity<?> checkInTicket(
            @RequestBody CheckInRequest request,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        try {
            CheckInResponse response = checkInService.checkInTicket(request, userDetails.getId());
            if (response.success()) {
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.badRequest().body(response);
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(CheckInResponse.error(e.getMessage()));
        }
    }

    // Revert a check-in (mistake correction)
    @PostMapping("/revert/{ticketId}")
    @PreAuthorize("hasRole('ORGANIZER') or hasRole('ADMIN')")
    public ResponseEntity<?> revertCheckIn(
            @PathVariable UUID ticketId,
            @RequestParam String reason,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        try {
            CheckInResponse response = checkInService.revertCheckIn(ticketId, userDetails.getId(), reason);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(CheckInResponse.error(e.getMessage()));
        }
    }

    // Get attendee list with check-in status
    @GetMapping("/attendees/{eventId}")
    @PreAuthorize("hasRole('ORGANIZER') or hasRole('ADMIN')")
    public ResponseEntity<List<CheckInResponse>> getAttendeeList(
            @PathVariable UUID eventId,
            @RequestParam(required = false) String search) {
        List<CheckInResponse> attendees = checkInService.getAttendeeList(eventId, search);
        return ResponseEntity.ok(attendees);
    }

    // Get check-in statistics
    @GetMapping("/stats/{eventId}")
    @PreAuthorize("hasRole('ORGANIZER') or hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getCheckInStats(@PathVariable UUID eventId) {
        Map<String, Object> stats = checkInService.getCheckInStats(eventId);
        return ResponseEntity.ok(stats);
    }

    // Verify ticket (for QR scanning - returns ticket info without checking in)
    @GetMapping("/verify/{ticketNumber}")
    @PreAuthorize("hasRole('ORGANIZER') or hasRole('ADMIN')")
    public ResponseEntity<?> verifyTicket(@PathVariable String ticketNumber) {
        // Implementation would return ticket details without marking as checked in
        return ResponseEntity.ok().build();
    }
}
