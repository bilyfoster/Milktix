package com.milktix.dto;

import java.util.List;

public record UserListResponse(
    List<UserDTO> users,
    long totalElements,
    int totalPages,
    int currentPage,
    int pageSize
) {}
