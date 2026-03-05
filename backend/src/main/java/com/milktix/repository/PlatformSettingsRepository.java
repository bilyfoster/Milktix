package com.milktix.repository;

import com.milktix.entity.PlatformSettings;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Repository for PlatformSettings entity.
 * Uses singleton pattern with ID = 1.
 */
@Repository
public interface PlatformSettingsRepository extends JpaRepository<PlatformSettings, Long> {
}
