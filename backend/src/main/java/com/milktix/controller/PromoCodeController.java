package com.milktix.controller;

import com.milktix.dto.PromoCodeValidationResult;
import com.milktix.entity.PromoCode;
import com.milktix.entity.PromoCodeUsage;
import com.milktix.security.UserDetailsImpl;
import com.milktix.service.PromoCodeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/promo-codes")
@CrossOrigin(origins = "*", maxAge = 3600)
public class PromoCodeController {

    @Autowired
    private PromoCodeService promoCodeService;

    // Validate promo code (public endpoint for checkout)
    @PostMapping("/validate")
    public ResponseEntity<?> validatePromoCode(@RequestBody Map<String, Object> request) {
        try {
            String code = (String) request.get("code");
            String eventIdStr = (String) request.get("eventId");
            String userIdStr = (String) request.get("userId");
            BigDecimal orderTotal = new BigDecimal(request.get("orderTotal").toString());
            Integer ticketCount = (Integer) request.get("ticketCount");
            @SuppressWarnings("unchecked")
            List<String> ticketTypeIds = (List<String>) request.get("ticketTypeIds");

            if (code == null || code.isEmpty()) {
                return ResponseEntity.badRequest().body("Promo code is required");
            }

            UUID eventId = eventIdStr != null ? UUID.fromString(eventIdStr) : null;
            UUID userId = userIdStr != null ? UUID.fromString(userIdStr) : null;
            List<UUID> ticketTypeUUIDs = ticketTypeIds != null ? 
                ticketTypeIds.stream().map(UUID::fromString).toList() : List.of();

            PromoCodeValidationResult result = promoCodeService.validatePromoCode(
                code, eventId, userId, orderTotal, 
                ticketCount != null ? ticketCount : 1, 
                ticketTypeUUIDs
            );

            if (result.valid() && result.discountAmount() != null && orderTotal != null) {
                BigDecimal finalAmount = orderTotal.subtract(result.discountAmount()).max(BigDecimal.ZERO);
                result = result.withFinalAmount(finalAmount);
            }

            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error validating promo code: " + e.getMessage());
        }
    }

    // Get all promo codes (admin can see all, organizer can see their host's codes)
    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('ORGANIZER')")
    public ResponseEntity<?> getAllPromoCodes(
            @RequestParam(required = false) UUID hostId,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        
        boolean isAdmin = userDetails.getRole().equals("ADMIN");
        
        if (isAdmin) {
            // Admin can filter by host or get all
            return ResponseEntity.ok(promoCodeService.getAllPromoCodes(hostId));
        } else {
            // Organizer can only see their host's codes
            var hostOpt = promoCodeService.getHostByUserId(userDetails.getId());
            if (hostOpt.isEmpty()) {
                return ResponseEntity.badRequest().body("Organizer is not associated with a host");
            }
            return ResponseEntity.ok(promoCodeService.getPromoCodesByHost(hostOpt.get().getId()));
        }
    }

    // Get my host's promo codes (organizer only)
    @GetMapping("/my-codes")
    @PreAuthorize("hasRole('ORGANIZER')")
    public ResponseEntity<?> getMyPromoCodes(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        var hostOpt = promoCodeService.getHostByUserId(userDetails.getId());
        if (hostOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("Organizer is not associated with a host");
        }
        return ResponseEntity.ok(promoCodeService.getPromoCodesByHost(hostOpt.get().getId()));
    }

    // Create host-specific promo code (organizer only)
    @PostMapping("/host-specific")
    @PreAuthorize("hasRole('ORGANIZER')")
    public ResponseEntity<?> createHostPromoCode(
            @RequestBody PromoCode promoCode,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        try {
            var hostOpt = promoCodeService.getHostByUserId(userDetails.getId());
            if (hostOpt.isEmpty()) {
                return ResponseEntity.badRequest().body("Organizer is not associated with a host");
            }
            
            PromoCode created = promoCodeService.createHostPromoCode(
                promoCode, userDetails.getId(), hostOpt.get().getId());
            return ResponseEntity.ok(created);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Get active promo codes (public)
    @GetMapping("/active")
    public ResponseEntity<List<PromoCode>> getActivePromoCodes() {
        return ResponseEntity.ok(promoCodeService.getActivePromoCodes());
    }

    // Get promo code by ID
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('ORGANIZER')")
    public ResponseEntity<?> getPromoCodeById(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        
        boolean isAdmin = userDetails.getRole().equals("ADMIN");
        
        return promoCodeService.getPromoCodeById(id)
            .map(promoCode -> {
                // If not admin, check if organizer can access this promo code
                if (!isAdmin) {
                    if (promoCode.getScope() == PromoCode.Scope.HOST_SPECIFIC) {
                        var hostOpt = promoCodeService.getHostByUserId(userDetails.getId());
                        if (hostOpt.isEmpty() || 
                            promoCode.getHost() == null || 
                            !promoCode.getHost().getId().equals(hostOpt.get().getId())) {
                            return ResponseEntity.status(403).body("Access denied");
                        }
                    } else {
                        // Organizers can only view HOST_SPECIFIC codes
                        return ResponseEntity.status(403).body("Access denied");
                    }
                }
                return ResponseEntity.ok(promoCode);
            })
            .orElse(ResponseEntity.notFound().build());
    }

    // Create promo code (admin only)
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createPromoCode(
            @RequestBody PromoCode promoCode,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        try {
            PromoCode created = promoCodeService.createPromoCode(promoCode, userDetails.getId());
            return ResponseEntity.ok(created);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Update promo code (admin only)
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updatePromoCode(@PathVariable UUID id, @RequestBody PromoCode promoCode) {
        // Implementation would go here
        return ResponseEntity.ok().build();
    }

    // Delete promo code (admin only)
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deletePromoCode(@PathVariable UUID id) {
        promoCodeService.deletePromoCode(id);
        return ResponseEntity.ok().body("Promo code deleted");
    }

    // Get usage history (admin only)
    @GetMapping("/{id}/usage")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<PromoCodeUsage>> getUsageHistory(@PathVariable UUID id) {
        return ResponseEntity.ok(promoCodeService.getUsageHistory(id));
    }
}
