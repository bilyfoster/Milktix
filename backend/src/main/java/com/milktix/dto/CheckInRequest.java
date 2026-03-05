package com.milktix.dto;

import java.math.BigDecimal;

public record CheckInRequest(
    String ticketNumber,  // QR code data or ticket number
    String method,        // QR_SCAN, MANUAL
    String stationId,     // Check-in station identifier
    BigDecimal latitude,
    BigDecimal longitude,
    String notes
) {}
