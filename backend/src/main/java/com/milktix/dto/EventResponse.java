package com.milktix.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public record EventResponse(
    UUID id,
    String title,
    String description,
    LocalDateTime startDateTime,
    LocalDateTime endDateTime,
    String venueName,
    String venueAddress,
    String venueCity,
    String venueState,
    String venueZip,
    String status,
    String eventType,
    String imageUrl,
    UserSummary organizer,
    List<TicketTypeResponse> ticketTypes,
    List<CategoryResponse> categories,
    boolean isUpcoming,
    boolean isPast
) {}