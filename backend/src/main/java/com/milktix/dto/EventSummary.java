package com.milktix.dto;

import java.util.UUID;

public record EventSummary(
    UUID id,
    String title,
    String startDateTime,
    String venueName
) {}