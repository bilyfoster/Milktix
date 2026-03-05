package com.milktix.dto;

import java.util.UUID;

public record LocationDTO(
    UUID id,
    String name,
    String description,
    String address,
    String city,
    String state,
    String zipCode,
    String country,
    Double latitude,
    Double longitude,
    String imageUrl,
    String website,
    String phone,
    Integer capacity
) {}
