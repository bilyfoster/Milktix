package com.milktix.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record TicketOrderItem(
    @NotNull UUID ticketTypeId,
    @Min(1) Integer quantity
) {}