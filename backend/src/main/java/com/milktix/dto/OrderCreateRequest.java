package com.milktix.dto;

import jakarta.validation.constraints.*;
import java.util.List;
import java.util.UUID;

public record OrderCreateRequest(
    @NotNull UUID eventId,
    @NotEmpty List<TicketOrderItem> items,
    String billingName,
    @Email String billingEmail
) {}