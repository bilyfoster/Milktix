package com.milktix.repository;

import com.milktix.entity.Location;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface LocationRepository extends JpaRepository<Location, UUID> {
    
    List<Location> findByCityIgnoreCase(String city);
    
    List<Location> findByNameContainingIgnoreCase(String name);
    
    Optional<Location> findByNameAndAddress(String name, String address);
    
    List<Location> findByCityAndStateIgnoreCase(String city, String state);
}
