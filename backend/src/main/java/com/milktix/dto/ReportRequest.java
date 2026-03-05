package com.milktix.dto;

import java.time.LocalDate;
import java.util.UUID;

public record ReportRequest(
    String reportType,
    LocalDate startDate,
    LocalDate endDate,
    UUID eventId,
    UUID organizerId,
    String format
) {}
