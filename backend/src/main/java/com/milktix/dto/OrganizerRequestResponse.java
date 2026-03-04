package com.milktix.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public record OrganizerRequestResponse(
    UUID id,
    String businessName,
    String businessDescription,
    String taxId,
    String website,
    String phoneNumber,
    String businessEmail,
    String status,
    String adminNotes,
    UserSummary user,
    UserSummary reviewedBy,
    LocalDateTime reviewedAt,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {}
