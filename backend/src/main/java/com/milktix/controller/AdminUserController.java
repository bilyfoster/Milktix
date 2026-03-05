package com.milktix.controller;

import com.milktix.dto.*;
import com.milktix.entity.Order;
import com.milktix.entity.User;
import com.milktix.entity.UserStatus;
import com.milktix.repository.OrderRepository;
import com.milktix.repository.UserRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/users")
@CrossOrigin(origins = "*", maxAge = 3600)
@PreAuthorize("hasRole('ADMIN')")
public class AdminUserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OrderRepository orderRepository;

    // Get all users with pagination and filters
    @GetMapping
    public ResponseEntity<UserListResponse> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String role,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search) {

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<User> userPage;

        // Apply filters
        if (search != null && !search.isEmpty()) {
            userPage = userRepository.findByEmailContainingIgnoreCaseOrFullNameContainingIgnoreCase(
                    search, search, pageable);
        } else if (role != null && !role.isEmpty() && status != null && !status.isEmpty()) {
            try {
                User.Role roleEnum = User.Role.valueOf(role.toUpperCase());
                UserStatus statusEnum = UserStatus.valueOf(status.toUpperCase());
                userPage = userRepository.findByRoleAndStatus(roleEnum, statusEnum, pageable);
            } catch (IllegalArgumentException e) {
                userPage = userRepository.findAll(pageable);
            }
        } else if (role != null && !role.isEmpty()) {
            try {
                User.Role roleEnum = User.Role.valueOf(role.toUpperCase());
                userPage = userRepository.findByRole(roleEnum, pageable);
            } catch (IllegalArgumentException e) {
                userPage = userRepository.findAll(pageable);
            }
        } else if (status != null && !status.isEmpty()) {
            try {
                UserStatus statusEnum = UserStatus.valueOf(status.toUpperCase());
                userPage = userRepository.findByStatus(statusEnum, pageable);
            } catch (IllegalArgumentException e) {
                userPage = userRepository.findAll(pageable);
            }
        } else {
            userPage = userRepository.findAll(pageable);
        }

        List<UserDTO> userDTOs = userPage.getContent().stream()
                .map(this::mapToUserDTO)
                .collect(Collectors.toList());

        UserListResponse response = new UserListResponse(
                userDTOs,
                userPage.getTotalElements(),
                userPage.getTotalPages(),
                userPage.getNumber(),
                userPage.getSize()
        );

        return ResponseEntity.ok(response);
    }

    // Get user by ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getUserById(@PathVariable UUID id) {
        return userRepository.findById(id)
                .map(user -> ResponseEntity.ok(mapToUserDetailDTO(user)))
                .orElse(ResponseEntity.notFound().build());
    }

    // Update user role
    @PutMapping("/{id}/role")
    public ResponseEntity<?> updateUserRole(
            @PathVariable UUID id,
            @Valid @RequestBody UserUpdateRequest request) {
        
        return userRepository.findById(id)
                .map(user -> {
                    try {
                        if (request.role() != null && !request.role().isEmpty()) {
                            User.Role newRole = User.Role.valueOf(request.role().toUpperCase());
                            user.setRole(newRole);
                            userRepository.save(user);
                        }
                        return ResponseEntity.ok(mapToUserDTO(user));
                    } catch (IllegalArgumentException e) {
                        return ResponseEntity.badRequest()
                                .body("Invalid role. Valid roles: ADMIN, ORGANIZER, ATTENDEE");
                    }
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // Update user status
    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateUserStatus(
            @PathVariable UUID id,
            @Valid @RequestBody UserUpdateRequest request) {
        
        return userRepository.findById(id)
                .map(user -> {
                    try {
                        if (request.active() != null) {
                            user.setActive(request.active());
                        }
                        userRepository.save(user);
                        return ResponseEntity.ok(mapToUserDTO(user));
                    } catch (Exception e) {
                        return ResponseEntity.badRequest()
                                .body("Error updating user status: " + e.getMessage());
                    }
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // Get user orders
    @GetMapping("/{id}/orders")
    public ResponseEntity<?> getUserOrders(@PathVariable UUID id) {
        return userRepository.findById(id)
                .map(user -> {
                    List<Order> orders = orderRepository.findByUserOrderByCreatedAtDesc(user);
                    List<OrderResponse> orderResponses = orders.stream()
                            .map(this::mapToOrderResponse)
                            .collect(Collectors.toList());
                    return ResponseEntity.ok(orderResponses);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // Bulk operations
    @PostMapping("/bulk")
    public ResponseEntity<?> bulkUpdateUsers(@Valid @RequestBody BulkUserUpdateRequest request) {
        int processedCount = 0;
        int failedCount = 0;
        List<String> errors = new ArrayList<>();

        String operation = request.operation().toLowerCase();

        for (UUID userId : request.userIds()) {
            try {
                userRepository.findById(userId).ifPresentOrElse(
                        user -> {
                            switch (operation) {
                                case "activate":
                                    user.setActive(true);
                                    user.setStatus(UserStatus.ACTIVE);
                                    break;
                                case "deactivate":
                                    user.setActive(false);
                                    user.setStatus(UserStatus.INACTIVE);
                                    break;
                                case "suspend":
                                    user.setActive(false);
                                    user.setStatus(UserStatus.SUSPENDED);
                                    break;
                                default:
                                    throw new IllegalArgumentException("Invalid operation: " + operation);
                            }
                            userRepository.save(user);
                        },
                        () -> errors.add("User not found: " + userId)
                );
                processedCount++;
            } catch (Exception e) {
                failedCount++;
                errors.add("Error processing user " + userId + ": " + e.getMessage());
            }
        }

        BulkOperationResponse response = new BulkOperationResponse(
                failedCount == 0,
                processedCount,
                failedCount,
                errors,
                "Bulk operation completed"
        );

        return ResponseEntity.ok(response);
    }

    // Helper methods
    private UserDTO mapToUserDTO(User user) {
        int orderCount = user.getOrders() != null ? user.getOrders().size() : 0;
        String statusStr = user.getStatus() != null ? user.getStatus().name() : "ACTIVE";
        String createdAtStr = user.getCreatedAt() != null ? user.getCreatedAt().toString() : null;
        
        return new UserDTO(
                user.getId().toString(),
                user.getUsername(),
                user.getFullName(),
                user.getEmail(),
                user.getRole().name(),
                statusStr,
                createdAtStr,
                orderCount
        );
    }

    private UserDetailDTO mapToUserDetailDTO(User user) {
        int orderCount = user.getOrders() != null ? user.getOrders().size() : 0;
        
        return new UserDetailDTO(
                user.getId(),
                user.getUsername(),
                user.getFullName(),
                user.getEmail(),
                user.getRole().name(),
                user.getStatus() != null ? user.getStatus().name() : "ACTIVE",
                user.isActive(),
                user.getPhoneNumber(),
                user.getLastLogin() != null ? user.getLastLogin().toString() : null,
                user.getCreatedAt() != null ? user.getCreatedAt().toString() : null,
                orderCount
        );
    }

    private OrderResponse mapToOrderResponse(Order order) {
        return new OrderResponse(
                order.getId(),
                order.getOrderNumber(),
                new EventSummary(
                        order.getEvent().getId(),
                        order.getEvent().getTitle(),
                        order.getEvent().getStartDateTime().toString(),
                        order.getEvent().getVenueName()
                ),
                null, // tickets not loaded here for performance
                order.getSubtotal(),
                order.getTaxAmount(),
                order.getFeeAmount(),
                order.getTotalAmount(),
                order.getStatus().name(),
                order.getPaymentStatus().name(),
                order.getBillingName(),
                order.getBillingEmail(),
                order.getCreatedAt().toString()
        );
    }

    // Inner DTO for detailed user response
    public record UserDetailDTO(
            UUID id,
            String username,
            String fullName,
            String email,
            String role,
            String status,
            boolean active,
            String phoneNumber,
            String lastLogin,
            String createdAt,
            int orderCount
    ) {}
}
