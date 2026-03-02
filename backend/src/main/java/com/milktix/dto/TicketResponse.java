package com.milktix.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record TicketResponse(
    UUID id,
    String ticketNumber,
    TicketTypeSummary ticketType,
    String attendeeName,
    String attendeeEmail,
    String status,
    String qrCodeData,
    String checkedInAt
) {}