package com.milktix.dto;

import java.util.Map;

public record ReportResponse(
    String reportType,
    String generatedAt,
    Map<String, Object> data,
    Map<String, Object> summary,
    String downloadUrl
) {}
