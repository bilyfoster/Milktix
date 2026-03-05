package com.milktix.dto;

import java.util.List;

public record BulkOperationResponse(
    boolean success,
    int processedCount,
    int failedCount,
    List<String> errors,
    String message
) {}
