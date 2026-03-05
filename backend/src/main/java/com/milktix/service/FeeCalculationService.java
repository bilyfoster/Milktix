package com.milktix.service;

import com.milktix.dto.PlatformSettingsDTO;
import com.milktix.entity.PlatformSettings;
import com.milktix.repository.PlatformSettingsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Optional;

/**
 * Service for calculating fees for orders and payouts.
 */
@Service
public class FeeCalculationService {

    // Default fee structure constants
    private static final BigDecimal DEFAULT_PLATFORM_FEE_PERCENTAGE = new BigDecimal("0.029"); // 2.9%
    private static final BigDecimal DEFAULT_PLATFORM_FEE_FIXED = new BigDecimal("0.30");       // $0.30
    private static final BigDecimal DEFAULT_STRIPE_FEE_PERCENTAGE = new BigDecimal("0.029");   // 2.9%
    private static final BigDecimal DEFAULT_STRIPE_FEE_FIXED = new BigDecimal("0.30");         // $0.30
    
    private static final int DEFAULT_SCALE = 2;
    private static final RoundingMode DEFAULT_ROUNDING = RoundingMode.HALF_UP;

    @Autowired
    private PlatformSettingsRepository platformSettingsRepository;

    /**
     * Record representing a detailed fee breakdown for an order.
     */
    public record FeeBreakdown(
            BigDecimal subtotal,
            BigDecimal platformFeeAmount,
            BigDecimal stripeFeeAmount,
            BigDecimal totalFees,
            BigDecimal totalAmount,
            BigDecimal organizerPayout
    ) {}

    /**
     * Calculate fees for an order based on the subtotal.
     *
     * @param subtotal the order subtotal before fees
     * @return FeeBreakdown containing all calculated fee components
     */
    @Transactional(readOnly = true)
    public FeeBreakdown calculateOrderFees(BigDecimal subtotal) {
        if (subtotal == null) {
            throw new IllegalArgumentException("Subtotal cannot be null");
        }
        if (subtotal.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("Subtotal cannot be negative");
        }

        PlatformSettings settings = getSettingsOrDefault();

        // Calculate platform fee (percentage + fixed)
        BigDecimal platformFeePercentage = settings.getPlatformFeePercent();
        BigDecimal platformFeeFixed = settings.getPlatformFeeFixed();
        BigDecimal platformFeeAmount = subtotal.multiply(platformFeePercentage)
                .add(platformFeeFixed)
                .setScale(DEFAULT_SCALE, DEFAULT_ROUNDING);

        // Calculate Stripe fee (percentage + fixed)
        BigDecimal stripeFeePercentage = settings.getStripeFeePercent();
        BigDecimal stripeFeeFixed = settings.getStripeFeeFixed();
        BigDecimal stripeFeeAmount = subtotal.multiply(stripeFeePercentage)
                .add(stripeFeeFixed)
                .setScale(DEFAULT_SCALE, DEFAULT_ROUNDING);

        // Calculate totals
        BigDecimal totalFees = platformFeeAmount.add(stripeFeeAmount);
        BigDecimal totalAmount = subtotal.add(totalFees);

        // Organizer payout is subtotal minus platform fee (Stripe fee is deducted separately)
        BigDecimal organizerPayout = subtotal.subtract(platformFeeAmount);

        return new FeeBreakdown(
                subtotal.setScale(DEFAULT_SCALE, DEFAULT_ROUNDING),
                platformFeeAmount,
                stripeFeeAmount,
                totalFees,
                totalAmount,
                organizerPayout
        );
    }

    /**
     * Calculate what the organizer receives after all fees are deducted.
     *
     * @param grossRevenue the gross revenue (typically the subtotal/face value of tickets)
     * @return the net amount the organizer will receive
     */
    @Transactional(readOnly = true)
    public BigDecimal calculateOrganizerPayout(BigDecimal grossRevenue) {
        if (grossRevenue == null) {
            throw new IllegalArgumentException("Gross revenue cannot be null");
        }
        if (grossRevenue.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("Gross revenue cannot be negative");
        }

        PlatformSettings settings = getSettingsOrDefault();

        // Platform fee is deducted from the organizer's payout
        BigDecimal platformFeePercentage = settings.getPlatformFeePercent();
        BigDecimal platformFeeFixed = settings.getPlatformFeeFixed();
        BigDecimal platformFeeAmount = grossRevenue.multiply(platformFeePercentage)
                .add(platformFeeFixed)
                .setScale(DEFAULT_SCALE, DEFAULT_ROUNDING);

        // Organizer receives gross revenue minus platform fee only
        // Stripe fee is handled separately in the payment processing
        return grossRevenue.subtract(platformFeeAmount);
    }

    /**
     * Get current platform settings.
     *
     * @return PlatformSettingsDTO with current settings, or default values if no settings exist
     */
    @Transactional(readOnly = true)
    public PlatformSettingsDTO getPlatformSettings() {
        PlatformSettings settings = getSettingsOrDefault();
        return mapToDTO(settings);
    }

    /**
     * Update platform settings (admin only operation).
     *
     * @param dto the new platform settings
     * @return the updated PlatformSettingsDTO
     */
    @Transactional
    public PlatformSettingsDTO updatePlatformSettings(PlatformSettingsDTO dto) {
        if (dto == null) {
            throw new IllegalArgumentException("Platform settings DTO cannot be null");
        }

        PlatformSettings settings = platformSettingsRepository.findFirstByOrderByCreatedAtAsc()
                .orElse(new PlatformSettings());

        // If new settings, set the ID
        if (settings.getId() == null) {
            // Settings will get auto-generated UUID on save
        }

        // Update fields
        settings.setPlatformFeePercent(dto.getPlatformFeePercentage());
        settings.setPlatformFeeFixed(dto.getPlatformFeeFixed());
        settings.setStripeFeePercent(dto.getStripeFeePercentage());
        settings.setStripeFeeFixed(dto.getStripeFeeFixed());

        PlatformSettings saved = platformSettingsRepository.save(settings);
        return mapToDTO(saved);
    }

    /**
     * Get settings from repository or return defaults if none exist.
     */
    private PlatformSettings getSettingsOrDefault() {
        Optional<PlatformSettings> optional = platformSettingsRepository.findFirstByOrderByCreatedAtAsc();
        
        if (optional.isPresent()) {
            return optional.get();
        }

        // Return default settings
        PlatformSettings defaults = new PlatformSettings();
        // No ID needed for transient instance
        defaults.setPlatformFeePercent(DEFAULT_PLATFORM_FEE_PERCENTAGE);
        defaults.setPlatformFeeFixed(DEFAULT_PLATFORM_FEE_FIXED);
        defaults.setStripeFeePercent(DEFAULT_STRIPE_FEE_PERCENTAGE);
        defaults.setStripeFeeFixed(DEFAULT_STRIPE_FEE_FIXED);
        return defaults;
    }

    /**
     * Map PlatformSettings entity to PlatformSettingsDTO.
     */
    private PlatformSettingsDTO mapToDTO(PlatformSettings settings) {
        return new PlatformSettingsDTO(
                settings.getPlatformFeePercent(),
                settings.getPlatformFeeFixed(),
                settings.getStripeFeePercent(),
                settings.getStripeFeeFixed()
        );
    }
}
