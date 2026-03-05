package com.milktix.dto;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public record TicketTypeUpdateRequest(
    @NotBlank String name,
    String description,
    @NotNull @Positive BigDecimal price,
    @NotNull @PositiveOrZero Integer quantityAvailable,
    @PositiveOrZero Integer minPerOrder,
    @PositiveOrZero Integer maxPerOrder,
    LocalDateTime salesStart,
    LocalDateTime salesEnd
) {}
