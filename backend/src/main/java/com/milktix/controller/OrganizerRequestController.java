package com.milktix.controller;

import com.milktix.dto.OrganizerRequestCreate;
import com.milktix.dto.OrganizerRequestResponse;
import com.milktix.dto.OrganizerRequestReview;
import com.milktix.entity.OrganizerRequest;
import com.milktix.security.UserDetailsImpl;
import com.milktix.service.OrganizerRequestService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/organizer-requests")
@CrossOrigin(origins = "*", maxAge = 3600)
public class OrganizerRequestController {

    @Autowired
    private OrganizerRequestService requestService;

    // Submit organizer request (any authenticated user)
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> createRequest(
            @Valid @RequestBody OrganizerRequestCreate request,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        try {
            OrganizerRequestResponse response = requestService.createRequest(userDetails.getId(), request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Get my request status
    @GetMapping("/my")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getMyRequest(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        OrganizerRequestResponse response = requestService.getMyRequest(userDetails.getId());
        if (response == null) {
            return ResponseEntity.ok().body("{\"hasRequest\": false}");
        }
        return ResponseEntity.ok(response);
    }

    // Admin: Get all requests
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<OrganizerRequestResponse>> getAllRequests() {
        return ResponseEntity.ok(requestService.getAllRequests());
    }

    // Admin: Get requests by status
    @GetMapping("/status/{status}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<OrganizerRequestResponse>> getRequestsByStatus(
            @PathVariable String status) {
        try {
            OrganizerRequest.Status requestStatus = OrganizerRequest.Status.valueOf(status.toUpperCase());
            return ResponseEntity.ok(requestService.getRequestsByStatus(requestStatus));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    // Admin: Review (approve/reject) request
    @PostMapping("/{id}/review")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> reviewRequest(
            @PathVariable UUID id,
            @Valid @RequestBody OrganizerRequestReview review,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        try {
            OrganizerRequestResponse response = requestService.reviewRequest(
                    id, userDetails.getId(), review.action(), review.adminNotes());
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Admin: Get pending count
    @GetMapping("/pending-count")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Long>> getPendingCount() {
        Map<String, Long> response = new HashMap<>();
        response.put("count", requestService.getPendingCount());
        return ResponseEntity.ok(response);
    }
}
