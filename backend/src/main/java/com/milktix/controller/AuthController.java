package com.milktix.controller;

import com.milktix.dto.*;
import com.milktix.entity.User;
import com.milktix.repository.UserRepository;
import com.milktix.security.JwtUtils;
import com.milktix.security.UserDetailsImpl;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*", maxAge = 3600)
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder encoder;

    @Autowired
    private JwtUtils jwtUtils;

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginRequest.usernameOrEmail(),
                            loginRequest.password()
                    )
            );

            SecurityContextHolder.getContext().setAuthentication(authentication);
            String jwt = jwtUtils.generateJwtToken(authentication);
            
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            UserDTO userDTO = new UserDTO(
                    userDetails.getId().toString(),
                    userDetails.getUsername(),
                    userDetails.getUsername(), // fullName not stored in UserDetails
                    userDetails.getEmail(),
                    userDetails.getRole()
            );

            return ResponseEntity.ok(new AuthResponse(jwt, "Bearer", userDTO));
        } catch (BadCredentialsException e) {
            return ResponseEntity.status(401).body("Invalid username or password");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("An error occurred: " + e.getMessage());
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody RegisterRequest signUpRequest) {
        try {
            if (userRepository.existsByUsername(signUpRequest.username())) {
                return ResponseEntity.badRequest().body("Error: Username is already taken!");
            }

            if (userRepository.existsByEmail(signUpRequest.email())) {
                return ResponseEntity.badRequest().body("Error: Email is already in use!");
            }

            // Create new user's account
            User user = new User(
                    signUpRequest.username(),
                    signUpRequest.fullName(),
                    signUpRequest.email(),
                    encoder.encode(signUpRequest.password())
            );

            user.setRole(User.Role.ATTENDEE);
            userRepository.save(user);

            return ResponseEntity.ok("User registered successfully!");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Registration failed: " + e.getMessage());
        }
    }
}
