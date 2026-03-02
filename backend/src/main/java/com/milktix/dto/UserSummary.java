package com.milktix.dto;

import java.util.UUID;

public record UserSummary(
    UUID id,
    String fullName
) {}