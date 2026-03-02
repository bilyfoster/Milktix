package com.milktix.dto;

public record AuthResponse(
    String token,
    String type,
    UserDTO user
) {}