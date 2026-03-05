package com.milktix.controller;

import com.milktix.dto.*;
import com.milktix.security.UserDetailsImpl;
import com.milktix.service.AnalyticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/analytics")
@CrossOrigin(origins = "*", maxAge = 3600)
public class AnalyticsController {

    @Autowired
    private AnalyticsService analyticsService;

    // Event analytics (organizer/admin only)
    @GetMapping("/event/{eventId}")
    @PreAuthorize("hasRole('ORGANIZER') or hasRole('ADMIN')")
    public ResponseEntity<EventAnalyticsDTO> getEventAnalytics(@PathVariable UUID eventId) {
        return ResponseEntity.ok(analyticsService.getEventAnalytics(eventId));
    }

    // Dashboard analytics for organizer
    @GetMapping("/dashboard")
    @PreAuthorize("hasRole('ORGANIZER')")
    public ResponseEntity<DashboardAnalyticsDTO> getDashboardAnalytics(
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(analyticsService.getDashboardAnalytics(userDetails.getId()));
    }

    // Platform-wide analytics (admin only)
    @GetMapping("/platform")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PlatformAnalyticsDTO> getPlatformAnalytics() {
        return ResponseEntity.ok(analyticsService.getPlatformAnalytics());
    }
}
