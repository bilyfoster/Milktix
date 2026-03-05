package com.milktix.service;

import com.milktix.dto.PromoCodeValidationResult;
import com.milktix.entity.*;
import com.milktix.repository.HostRepository;
import com.milktix.repository.PromoCodeRepository;
import com.milktix.repository.PromoCodeUsageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class PromoCodeService {

    @Autowired
    private PromoCodeRepository promoCodeRepository;

    @Autowired
    private PromoCodeUsageRepository usageRepository;

    @Autowired
    private HostRepository hostRepository;

    @Transactional(readOnly = true)
    public PromoCodeValidationResult validatePromoCode(String code, UUID eventId, UUID userId, 
                                                        BigDecimal orderTotal, int ticketCount,
                                                        List<UUID> ticketTypeIds) {
        
        Optional<PromoCode> promoOpt = promoCodeRepository.findByCodeIgnoreCase(code);
        
        if (promoOpt.isEmpty()) {
            return PromoCodeValidationResult.invalid("Invalid promo code");
        }
        
        PromoCode promo = promoOpt.get();
        
        // Check if active
        if (!promo.getIsActive()) {
            return PromoCodeValidationResult.invalid("This promo code is no longer active");
        }
        
        // Check date validity
        LocalDateTime now = LocalDateTime.now();
        if (promo.getStartDate() != null && now.isBefore(promo.getStartDate())) {
            return PromoCodeValidationResult.invalid("This promo code is not yet valid");
        }
        if (promo.getEndDate() != null && now.isAfter(promo.getEndDate())) {
            return PromoCodeValidationResult.invalid("This promo code has expired");
        }
        
        // Check global usage limit
        if (promo.getMaxUses() != null && promo.getCurrentUses() >= promo.getMaxUses()) {
            return PromoCodeValidationResult.invalid("This promo code has reached its usage limit");
        }
        
        // Check per-user limit
        if (userId != null) {
            long userUsageCount = usageRepository.countByPromoCodeIdAndUserId(promo.getId(), userId);
            if (userUsageCount >= promo.getMaxUsesPerUser()) {
                return PromoCodeValidationResult.invalid("You have already used this promo code");
            }
        }
        
        // Check event scope
        if (promo.getScope() == PromoCode.Scope.EVENT_SPECIFIC) {
            if (promo.getEvent() == null || !promo.getEvent().getId().equals(eventId)) {
                return PromoCodeValidationResult.invalid("This promo code is not valid for this event");
            }
        }
        
        // Check host scope
        if (promo.getScope() == PromoCode.Scope.HOST_SPECIFIC) {
            if (promo.getHost() == null) {
                return PromoCodeValidationResult.invalid("This promo code is not properly configured");
            }
            // For host-specific codes, we need to check if the event belongs to the host
            // This requires the eventId to be provided
            if (eventId == null) {
                return PromoCodeValidationResult.invalid("Event information is required for this promo code");
            }
            // Note: The actual host validation should be done by the caller who has access to EventRepository
            // to check if the event belongs to the promo code's host
        }
        
        // Check minimum tickets
        if (ticketCount < promo.getMinTickets()) {
            return PromoCodeValidationResult.invalid(
                String.format("This promo code requires at least %d tickets", promo.getMinTickets()));
        }
        
        // Check minimum amount
        if (promo.getMinAmount() != null && orderTotal.compareTo(promo.getMinAmount()) < 0) {
            return PromoCodeValidationResult.invalid(
                String.format("This promo code requires a minimum order of $%s", promo.getMinAmount()));
        }
        
        // Check applicable ticket types
        if (promo.getApplicableTicketTypes() != null && !promo.getApplicableTicketTypes().isEmpty()) {
            boolean hasApplicableTicket = ticketTypeIds.stream()
                .anyMatch(tid -> promo.getApplicableTicketTypes().contains(tid));
            if (!hasApplicableTicket) {
                return PromoCodeValidationResult.invalid("This promo code is not valid for the selected ticket types");
            }
        }
        
        // Calculate discount
        BigDecimal discountAmount = calculateDiscount(promo, orderTotal);
        
        return PromoCodeValidationResult.valid(promo, discountAmount);
    }

    private BigDecimal calculateDiscount(PromoCode promo, BigDecimal orderTotal) {
        switch (promo.getDiscountType()) {
            case PERCENTAGE:
                return orderTotal
                    .multiply(promo.getDiscountValue())
                    .divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP);
                
            case FIXED_AMOUNT:
                return promo.getDiscountValue().min(orderTotal); // Don't exceed order total
                
            case COMP:
                return orderTotal; // 100% off
                
            default:
                return BigDecimal.ZERO;
        }
    }

    @Transactional
    public void applyPromoCode(UUID promoCodeId, UUID orderId, UUID userId, BigDecimal discountApplied) {
        PromoCode promo = promoCodeRepository.findById(promoCodeId)
            .orElseThrow(() -> new RuntimeException("Promo code not found"));
        
        // Increment usage counter
        promo.setCurrentUses(promo.getCurrentUses() + 1);
        promoCodeRepository.save(promo);
        
        // Log usage
        PromoCodeUsage usage = new PromoCodeUsage();
        usage.setPromoCode(promo);
        if (userId != null) {
            User user = new User();
            user.setId(userId);
            usage.setUser(user);
        }
        if (orderId != null) {
            Order order = new Order();
            order.setId(orderId);
            usage.setOrder(order);
        }
        usage.setDiscountApplied(discountApplied);
        usageRepository.save(usage);
    }

    @Transactional
    public PromoCode createPromoCode(PromoCode promoCode, UUID createdById) {
        // Validate code format
        if (!isValidCodeFormat(promoCode.getCode())) {
            throw new IllegalArgumentException("Invalid promo code format. Use alphanumeric characters only.");
        }
        
        // Check if code already exists
        if (promoCodeRepository.existsByCodeIgnoreCase(promoCode.getCode())) {
            throw new IllegalArgumentException("Promo code already exists");
        }
        
        // Validate discount value
        if (promoCode.getDiscountType() == PromoCode.DiscountType.PERCENTAGE) {
            if (promoCode.getDiscountValue().compareTo(BigDecimal.ZERO) < 0 ||
                promoCode.getDiscountValue().compareTo(new BigDecimal("100")) > 0) {
                throw new IllegalArgumentException("Percentage discount must be between 0 and 100");
            }
        }
        
        if (promoCode.getDiscountType() == PromoCode.DiscountType.COMP) {
            promoCode.setDiscountValue(new BigDecimal("100")); // Always 100% for comp codes
        }
        
        User creator = new User();
        creator.setId(createdById);
        promoCode.setCreatedBy(creator);
        
        return promoCodeRepository.save(promoCode);
    }

    private boolean isValidCodeFormat(String code) {
        return code != null && code.matches("^[A-Za-z0-9_-]+$");
    }

    @Transactional(readOnly = true)
    public List<PromoCode> getAllPromoCodes() {
        return promoCodeRepository.findAll();
    }

    @Transactional(readOnly = true)
    public List<PromoCode> getActivePromoCodes() {
        return promoCodeRepository.findByIsActiveTrue();
    }

    @Transactional(readOnly = true)
    public Optional<PromoCode> getPromoCodeById(UUID id) {
        return promoCodeRepository.findById(id);
    }

    @Transactional
    public void deletePromoCode(UUID id) {
        promoCodeRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public List<PromoCodeUsage> getUsageHistory(UUID promoCodeId) {
        return usageRepository.findByPromoCodeId(promoCodeId);
    }

    @Transactional(readOnly = true)
    public List<PromoCode> getPromoCodesByHost(UUID hostId) {
        return promoCodeRepository.findByHostId(hostId);
    }

    @Transactional(readOnly = true)
    public List<PromoCode> getActivePromoCodesByHost(UUID hostId) {
        return promoCodeRepository.findByHostIdAndIsActiveTrue(hostId);
    }

    @Transactional(readOnly = true)
    public Optional<Host> getHostByUserId(UUID userId) {
        return hostRepository.findByUserId(userId);
    }

    @Transactional
    public PromoCode createHostPromoCode(PromoCode promoCode, UUID createdById, UUID hostId) {
        // Validate that the user is the host's user
        Host host = hostRepository.findById(hostId)
            .orElseThrow(() -> new IllegalArgumentException("Host not found"));
        
        if (!host.getUser().getId().equals(createdById)) {
            throw new IllegalArgumentException("You can only create promo codes for your own host");
        }
        
        // Set the host and scope
        promoCode.setHost(host);
        promoCode.setScope(PromoCode.Scope.HOST_SPECIFIC);
        
        // Use the existing createPromoCode method for the rest
        return createPromoCode(promoCode, createdById);
    }

    @Transactional(readOnly = true)
    public List<PromoCode> getAllPromoCodes(UUID hostId) {
        if (hostId != null) {
            return promoCodeRepository.findByHostId(hostId);
        }
        return promoCodeRepository.findAll();
    }

    @Transactional(readOnly = true)
    public boolean canAccessPromoCode(UUID promoCodeId, UUID userId) {
        Optional<PromoCode> promoOpt = promoCodeRepository.findById(promoCodeId);
        if (promoOpt.isEmpty()) {
            return false;
        }
        
        PromoCode promo = promoOpt.get();
        
        // Admin can access all
        // Organizer can only access their host's codes
        if (promo.getScope() == PromoCode.Scope.HOST_SPECIFIC) {
            if (promo.getHost() == null) {
                return false;
            }
            return promo.getHost().getUser().getId().equals(userId);
        }
        
        // For GLOBAL and EVENT_SPECIFIC, only admin should access
        // This will be checked by @PreAuthorize in controller
        return true;
    }
}
