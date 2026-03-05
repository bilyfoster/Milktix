package com.milktix.repository;

import com.milktix.entity.EventCheckInStats;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface EventCheckInStatsRepository extends JpaRepository<EventCheckInStats, UUID> {
}
