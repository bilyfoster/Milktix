package com.milktix.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record OrganizerRequestReview(
    @NotBlank
    @Pattern(regexp = "APPROVED|REJECTED", message = "Action must be APPROVED or REJECTED")
    String action,
    
    @Size(max = 2000)
    String adminNotes
) {}
