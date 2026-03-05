package com.milktix.controller;

import com.milktix.dto.EventSummary;
import com.milktix.dto.LocationDTO;
import com.milktix.entity.Location;
import com.milktix.repository.LocationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/locations")
@CrossOrigin(origins = "*", maxAge = 3600)
public class LocationController {

    @Autowired
    private LocationRepository locationRepository;

    // Get all locations
    @GetMapping
    public ResponseEntity<List<LocationDTO>> getAllLocations() {
        List<Location> locations = locationRepository.findAll();
        return ResponseEntity.ok(locations.stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList()));
    }

    // Get location by ID
    @GetMapping("/{id}")
    public ResponseEntity<LocationDTO> getLocationById(@PathVariable UUID id) {
        Location location = locationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Location not found"));
        return ResponseEntity.ok(mapToDTO(location));
    }

    // Search locations by name
    @GetMapping("/search")
    public ResponseEntity<List<LocationDTO>> searchLocations(@RequestParam String query) {
        List<Location> locations = locationRepository.findByNameContainingIgnoreCase(query);
        return ResponseEntity.ok(locations.stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList()));
    }

    // Get locations by city
    @GetMapping("/city/{city}")
    public ResponseEntity<List<LocationDTO>> getLocationsByCity(@PathVariable String city) {
        List<Location> locations = locationRepository.findByCityIgnoreCase(city);
        return ResponseEntity.ok(locations.stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList()));
    }

    // Update location (admin only)
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateLocation(
            @PathVariable UUID id,
            @RequestBody LocationDTO locationDTO) {
        
        Location location = locationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Location not found"));

        location.setName(locationDTO.name());
        location.setDescription(locationDTO.description());
        location.setAddress(locationDTO.address());
        location.setCity(locationDTO.city());
        location.setState(locationDTO.state());
        location.setZipCode(locationDTO.zipCode());
        location.setCountry(locationDTO.country());
        location.setLatitude(locationDTO.latitude());
        location.setLongitude(locationDTO.longitude());
        location.setImageUrl(locationDTO.imageUrl());
        location.setWebsite(locationDTO.website());
        location.setPhone(locationDTO.phone());
        location.setCapacity(locationDTO.capacity());

        Location updatedLocation = locationRepository.save(location);
        return ResponseEntity.ok(mapToDTO(updatedLocation));
    }

    // Delete location (admin only)
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteLocation(@PathVariable UUID id) {
        Location location = locationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Location not found"));
        
        locationRepository.delete(location);
        return ResponseEntity.ok().body("Location deleted successfully");
    }

    // Create location
    @PostMapping
    public ResponseEntity<?> createLocation(@RequestBody LocationDTO locationDTO) {
        // Check if location already exists
        var existing = locationRepository.findByNameAndAddress(
                locationDTO.name(), locationDTO.address());
        
        if (existing.isPresent()) {
            return ResponseEntity.ok(mapToDTO(existing.get()));
        }

        Location location = new Location();
        location.setName(locationDTO.name());
        location.setDescription(locationDTO.description());
        location.setAddress(locationDTO.address());
        location.setCity(locationDTO.city());
        location.setState(locationDTO.state());
        location.setZipCode(locationDTO.zipCode());
        location.setCountry(locationDTO.country());
        location.setLatitude(locationDTO.latitude());
        location.setLongitude(locationDTO.longitude());
        location.setImageUrl(locationDTO.imageUrl());
        location.setWebsite(locationDTO.website());
        location.setPhone(locationDTO.phone());
        location.setCapacity(locationDTO.capacity());

        Location savedLocation = locationRepository.save(location);
        return ResponseEntity.ok(mapToDTO(savedLocation));
    }

    // Get events at location
    @GetMapping("/{id}/events")
    public ResponseEntity<?> getLocationEvents(@PathVariable UUID id) {
        Location location = locationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Location not found"));
        
        return ResponseEntity.ok(location.getEvents().stream()
                .map(event -> new EventSummary(
                        event.getId(),
                        event.getTitle(),
                        event.getStartDateTime().toString(),
                        event.getVenueName()
                ))
                .collect(Collectors.toList()));
    }

    private LocationDTO mapToDTO(Location location) {
        return new LocationDTO(
                location.getId(),
                location.getName(),
                location.getDescription(),
                location.getAddress(),
                location.getCity(),
                location.getState(),
                location.getZipCode(),
                location.getCountry(),
                location.getLatitude(),
                location.getLongitude(),
                location.getImageUrl(),
                location.getWebsite(),
                location.getPhone(),
                location.getCapacity()
        );
    }
}
