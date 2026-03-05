package com.milktix.dto;

import jakarta.validation.constraints.NotEmpty;
import java.util.List;
import java.util.UUID;

public record BulkEventUpdateRequest(
    @NotEmpty List<UUID> eventIds,
    String newStatus,
    Boolean isPublished
) {}
