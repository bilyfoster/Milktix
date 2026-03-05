package com.milktix.dto;

import com.milktix.entity.PromoCode;

import java.math.BigDecimal;

public record PromoCodeValidationResult(
    boolean valid,
    String message,
    String code,
    String discountType,
    BigDecimal discountValue,
    BigDecimal discountAmount,
    BigDecimal finalAmount,
    String description
) {
    public static PromoCodeValidationResult valid(PromoCode promo, BigDecimal discountAmount) {
        return new PromoCodeValidationResult(
            true,
            "Promo code applied successfully",
            promo.getCode(),
            promo.getDiscountType().toString(),
            promo.getDiscountValue(),
            discountAmount,
            null, // finalAmount calculated elsewhere
            promo.getDescription()
        );
    }

    public static PromoCodeValidationResult invalid(String message) {
        return new PromoCodeValidationResult(
            false,
            message,
            null,
            null,
            null,
            null,
            null,
            null
        );
    }

    public PromoCodeValidationResult withFinalAmount(BigDecimal finalAmount) {
        return new PromoCodeValidationResult(
            valid,
            message,
            code,
            discountType,
            discountValue,
            discountAmount,
            finalAmount,
            description
        );
    }
}
