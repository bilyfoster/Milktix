package com.milktix.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record TicketTypeResponse(
    UUID id,
    String name,
    String description,
    BigDecimal price,
    Integer quantityAvailable,
    Integer quantitySold,
    Integer quantityRemaining,
    Integer minPerOrder,
    Integer maxPerOrder,
    boolean isAvailable
) {}