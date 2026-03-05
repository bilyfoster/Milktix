package com.milktix.repository;

import com.milktix.entity.PlatformSettings;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

/**
 * Repository for PlatformSettings entity.
 * Uses singleton pattern - only one settings record exists.
 */
@Repository
public interface PlatformSettingsRepository extends JpaRepository<PlatformSettings, UUID> {
    
    /**
     * Find the first (and only) settings record.
     */
    Optional<PlatformSettings> findFirstByOrderByCreatedAtAsc();
}
