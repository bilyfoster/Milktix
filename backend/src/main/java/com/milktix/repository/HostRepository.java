package com.milktix.repository;

import com.milktix.entity.Host;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface HostRepository extends JpaRepository<Host, UUID> {
    
    Optional<Host> findByUserId(UUID userId);
    
    List<Host> findByNameContainingIgnoreCase(String name);
    
    boolean existsByUserId(UUID userId);
}
