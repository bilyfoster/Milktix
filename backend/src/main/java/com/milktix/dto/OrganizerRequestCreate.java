package com.milktix.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record OrganizerRequestCreate(
    @NotBlank
    @Size(max = 255)
    String businessName,
    
    @Size(max = 1000)
    String businessDescription,
    
    @Size(max = 100)
    String taxId,
    
    @Size(max = 255)
    String website,
    
    @Size(max = 20)
    String phoneNumber,
    
    @NotBlank
    @Email
    @Size(max = 100)
    String businessEmail
) {}
