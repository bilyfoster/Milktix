package com.milktix.dto;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.UUID;

public record EventCreateRequest(
    @NotBlank @Size(max = 200) String title,
    String description,
    @NotNull LocalDateTime startDateTime,
    LocalDateTime endDateTime,
    @NotBlank @Size(max = 200) String venueName,
    String venueAddress,
    String venueCity,
    String venueState,
    String venueZip,
    Set<UUID> categoryIds,
    String imageUrl,
    List<TicketTypeRequest> ticketTypes
) {}