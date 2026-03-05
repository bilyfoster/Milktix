package com.milktix.dto;

public record UserUpdateRequest(
    String fullName,
    String email,
    String phoneNumber,
    String role,
    Boolean active
) {}
