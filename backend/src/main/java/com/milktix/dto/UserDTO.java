package com.milktix.dto;

public record UserDTO(
    String id,
    String username,
    String fullName,
    String email,
    String role,
    String status,
    String createdAt,
    int orderCount
) {
    // Constructor for backward compatibility
    public UserDTO(String id, String username, String fullName, String email, String role) {
        this(id, username, fullName, email, role, "ACTIVE", null, 0);
    }
}
