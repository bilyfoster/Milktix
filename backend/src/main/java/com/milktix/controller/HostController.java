package com.milktix.controller;

import com.milktix.dto.EventSummary;
import com.milktix.dto.HostDTO;
import com.milktix.entity.Host;
import com.milktix.entity.User;
import com.milktix.repository.HostRepository;
import com.milktix.repository.UserRepository;
import com.milktix.security.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/hosts")
@CrossOrigin(origins = "*", maxAge = 3600)
public class HostController {

    @Autowired
    private HostRepository hostRepository;

    @Autowired
    private UserRepository userRepository;

    // Get all hosts
    @GetMapping
    public ResponseEntity<List<HostDTO>> getAllHosts() {
        List<Host> hosts = hostRepository.findAll();
        return ResponseEntity.ok(hosts.stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList()));
    }

    // Get host by ID
    @GetMapping("/{id}")
    public ResponseEntity<HostDTO> getHostById(@PathVariable UUID id) {
        Host host = hostRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Host not found"));
        return ResponseEntity.ok(mapToDTO(host));
    }

    // Get my host profile
    @GetMapping("/my")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getMyHost(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        Host host = hostRepository.findByUserId(userDetails.getId())
                .orElse(null);
        if (host == null) {
            return ResponseEntity.ok().body("{\"hasHost\": false}");
        }
        return ResponseEntity.ok(mapToDTO(host));
    }

    // Create host profile
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> createHost(
            @RequestBody HostDTO hostDTO,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        
        // Check if user already has a host profile
        if (hostRepository.existsByUserId(userDetails.getId())) {
            return ResponseEntity.badRequest().body("Host profile already exists");
        }

        User user = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Host host = new Host();
        host.setName(hostDTO.name());
        host.setBio(hostDTO.bio());
        host.setImageUrl(hostDTO.imageUrl());
        host.setWebsite(hostDTO.website());
        host.setEmail(hostDTO.email());
        host.setPhone(hostDTO.phone());
        host.setUser(user);

        Host savedHost = hostRepository.save(host);
        return ResponseEntity.ok(mapToDTO(savedHost));
    }

    // Update host profile
    @PutMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> updateHost(
            @PathVariable UUID id,
            @RequestBody HostDTO hostDTO,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        
        Host host = hostRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Host not found"));

        // Verify ownership or admin
        boolean isAdmin = userDetails.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        if (!host.getUser().getId().equals(userDetails.getId()) && !isAdmin) {
            return ResponseEntity.status(403).body("Not authorized to update this host");
        }

        host.setName(hostDTO.name());
        host.setBio(hostDTO.bio());
        host.setImageUrl(hostDTO.imageUrl());
        host.setWebsite(hostDTO.website());
        host.setEmail(hostDTO.email());
        host.setPhone(hostDTO.phone());

        Host updatedHost = hostRepository.save(host);
        return ResponseEntity.ok(mapToDTO(updatedHost));
    }

    // Delete host profile (admin only)
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteHost(@PathVariable UUID id) {
        Host host = hostRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Host not found"));
        
        hostRepository.delete(host);
        return ResponseEntity.ok().body("Host deleted successfully");
    }

    // Get events by host
    @GetMapping("/{id}/events")
    public ResponseEntity<?> getHostEvents(@PathVariable UUID id) {
        Host host = hostRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Host not found"));
        
        return ResponseEntity.ok(host.getEvents().stream()
                .map(event -> new EventSummary(
                        event.getId(),
                        event.getTitle(),
                        event.getStartDateTime().toString(),
                        event.getVenueName()
                ))
                .collect(Collectors.toList()));
    }

    private HostDTO mapToDTO(Host host) {
        return new HostDTO(
                host.getId(),
                host.getName(),
                host.getBio(),
                host.getImageUrl(),
                host.getWebsite(),
                host.getEmail(),
                host.getPhone()
        );
    }

    private HostDTO mapToDTOWithUser(Host host) {
        return new HostDTO(
                host.getId(),
                host.getName(),
                host.getBio(),
                host.getImageUrl(),
                host.getWebsite(),
                host.getEmail(),
                host.getPhone(),
                host.getUser() != null ? host.getUser().getFullName() : null,
                host.getUser() != null ? host.getUser().getEmail() : null
        );
    }
}
