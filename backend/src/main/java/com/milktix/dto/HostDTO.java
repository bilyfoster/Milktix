package com.milktix.dto;

import java.util.UUID;

public record HostDTO(
    UUID id,
    String name,
    String bio,
    String imageUrl,
    String website,
    String email,
    String phone,
    String userFullName,
    String userEmail
) {
    // Constructor with backward compatibility
    public HostDTO(UUID id, String name, String bio, String imageUrl, String website, String email, String phone) {
        this(id, name, bio, imageUrl, website, email, phone, null, null);
    }
}
