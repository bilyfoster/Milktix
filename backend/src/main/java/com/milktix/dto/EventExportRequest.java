package com.milktix.dto;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record EventExportRequest(
    List<String> statuses,
    LocalDate startDateFrom,
    LocalDate startDateTo,
    UUID hostId,
    UUID organizerId,
    UUID locationId,
    String searchQuery
) {}
