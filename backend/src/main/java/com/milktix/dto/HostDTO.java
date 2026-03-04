package com.milktix.dto;

import java.util.UUID;

public record HostDTO(
    UUID id,
    String name,
    String bio,
    String imageUrl,
    String website,
    String email,
    String phone
) {}
