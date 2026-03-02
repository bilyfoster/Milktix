package com.milktix.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record TicketTypeSummary(
    UUID id,
    String name,
    BigDecimal price
) {}