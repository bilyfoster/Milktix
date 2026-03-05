package com.milktix.repository;

import com.milktix.entity.CheckIn;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CheckInRepository extends JpaRepository<CheckIn, UUID> {
    Optional<CheckIn> findByTicketIdAndRevertedAtIsNull(UUID ticketId);
    int countByEventIdAndRevertedAtIsNull(UUID eventId);
    
    @Query("SELECT c FROM CheckIn c WHERE c.event.id = :eventId AND c.revertedAt IS NULL ORDER BY c.checkedInAt DESC")
    List<CheckIn> findRecentCheckInsByEvent(@Param("eventId") UUID eventId);
    
    @Query("SELECT FUNCTION('DATE_TRUNC', 'hour', c.checkedInAt) as hour, COUNT(c) as count " +
           "FROM CheckIn c WHERE c.event.id = :eventId AND c.revertedAt IS NULL " +
           "GROUP BY FUNCTION('DATE_TRUNC', 'hour', c.checkedInAt) " +
           "ORDER BY hour")
    List<Map<String, Object>> getHourlyCheckIns(@Param("eventId") UUID eventId);
}
