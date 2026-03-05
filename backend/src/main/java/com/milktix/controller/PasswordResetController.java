package com.milktix.controller;

import com.milktix.entity.User;
import com.milktix.service.EmailService;
import com.milktix.service.PasswordResetService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*", maxAge = 3600)
public class PasswordResetController {

    @Autowired
    private PasswordResetService passwordResetService;

    @Autowired
    private EmailService emailService;

    @Value("${milktix.frontend-url:http://localhost:3000}")
    private String frontendUrl;

    // Request password reset
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        
        if (email == null || email.isEmpty()) {
            return ResponseEntity.badRequest().body("Email is required");
        }

        // Create token (returns null if user not found, but we don't reveal that)
        String token = passwordResetService.createPasswordResetToken(email);
        
        // In a real app, you would send an email here with the reset link
        // For now, we return the token in the response for testing
        // Example email link: https://milktix.com/reset-password?token=xyz
        
        if (token != null) {
            // Get user details for email
            User user = passwordResetService.getUserByToken(token);
            if (user != null) {
                // Send actual email
                emailService.sendPasswordResetEmail(
                    email,
                    user.getFullName(),
                    token,
                    frontendUrl
                );
            }
            
            return ResponseEntity.ok(Map.of(
                "message", "If an account exists with this email, you will receive password reset instructions.",
                "devToken", emailService.isEmailEnabled() ? null : token  // Only show token if email disabled
            ));
        } else {
            // Same message for security (don't reveal if email exists)
            return ResponseEntity.ok(Map.of(
                "message", "If an account exists with this email, you will receive password reset instructions."
            ));
        }
    }

    // Validate reset token
    @GetMapping("/validate-reset-token")
    public ResponseEntity<?> validateToken(@RequestParam String token) {
        boolean isValid = passwordResetService.validateToken(token);
        
        if (isValid) {
            return ResponseEntity.ok(Map.of("valid", true));
        } else {
            return ResponseEntity.badRequest().body(Map.of(
                "valid", false,
                "message", "Invalid or expired token"
            ));
        }
    }

    // Reset password with token
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> request) {
        String token = request.get("token");
        String newPassword = request.get("newPassword");
        
        if (token == null || token.isEmpty()) {
            return ResponseEntity.badRequest().body("Token is required");
        }
        
        if (newPassword == null || newPassword.isEmpty()) {
            return ResponseEntity.badRequest().body("New password is required");
        }
        
        if (newPassword.length() < 6) {
            return ResponseEntity.badRequest().body("Password must be at least 6 characters");
        }

        boolean success = passwordResetService.resetPassword(token, newPassword);
        
        if (success) {
            return ResponseEntity.ok(Map.of("message", "Password reset successfully"));
        } else {
            return ResponseEntity.badRequest().body(Map.of(
                "message", "Invalid or expired token"
            ));
        }
    }
}
