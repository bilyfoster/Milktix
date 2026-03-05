package com.milktix.service;

import com.milktix.entity.PasswordResetToken;
import com.milktix.entity.User;
import com.milktix.repository.PasswordResetTokenRepository;
import com.milktix.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
public class PasswordResetService {

    @Autowired
    private PasswordResetTokenRepository tokenRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // Token expires in 1 hour
    private static final int EXPIRATION_HOURS = 1;

    @Transactional
    public String createPasswordResetToken(String email) {
        Optional<User> userOpt = userRepository.findByEmail(email);
        
        if (userOpt.isEmpty()) {
            // Don't reveal if email exists or not for security
            return null;
        }

        User user = userOpt.get();
        
        // Delete any existing tokens for this user
        tokenRepository.deleteByUserId(user.getId());
        
        // Create new token
        String token = UUID.randomUUID().toString();
        PasswordResetToken resetToken = new PasswordResetToken(
            user,
            token,
            LocalDateTime.now().plusHours(EXPIRATION_HOURS)
        );
        
        tokenRepository.save(resetToken);
        return token;
    }

    @Transactional(readOnly = true)
    public boolean validateToken(String token) {
        Optional<PasswordResetToken> tokenOpt = tokenRepository.findByToken(token);
        
        if (tokenOpt.isEmpty()) {
            return false;
        }
        
        PasswordResetToken resetToken = tokenOpt.get();
        return !resetToken.isExpired() && !resetToken.isUsed();
    }

    @Transactional
    public boolean resetPassword(String token, String newPassword) {
        Optional<PasswordResetToken> tokenOpt = tokenRepository.findByToken(token);
        
        if (tokenOpt.isEmpty()) {
            return false;
        }
        
        PasswordResetToken resetToken = tokenOpt.get();
        
        if (resetToken.isExpired() || resetToken.isUsed()) {
            return false;
        }
        
        // Update password
        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        
        // Mark token as used
        resetToken.setUsedAt(LocalDateTime.now());
        tokenRepository.save(resetToken);
        
        return true;
    }

    @Transactional(readOnly = true)
    public User getUserByToken(String token) {
        Optional<PasswordResetToken> tokenOpt = tokenRepository.findByToken(token);
        return tokenOpt.map(PasswordResetToken::getUser).orElse(null);
    }

    @Transactional
    public void cleanupExpiredTokens() {
        tokenRepository.deleteAllByExpiresAtBefore(LocalDateTime.now());
    }
}
