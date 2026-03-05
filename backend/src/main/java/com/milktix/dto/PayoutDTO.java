package com.milktix.dto;

import java.math.BigDecimal;

public record PayoutDTO(
    String id,
    String organizerId,
    String organizerName,
    BigDecimal amount,
    String status,
    String periodStart,
    String periodEnd,
    String createdAt,
    String paidAt,
    String notes
) {}
