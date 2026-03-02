package com.milktix.dto;

public record UserDTO(
    String id,
    String username,
    String fullName,
    String email,
    String role
) {}