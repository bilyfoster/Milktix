package com.milktix.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;

import java.util.List;
import java.util.UUID;

public record BulkUserUpdateRequest(
    @NotEmpty(message = "User IDs list cannot be empty")
    List<UUID> userIds,
    
    @NotBlank(message = "Operation is required")
    String operation
) {}
