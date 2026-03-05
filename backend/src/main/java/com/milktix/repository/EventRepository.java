package com.milktix.repository;

import com.milktix.entity.Event;
import com.milktix.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface EventRepository extends JpaRepository<Event, UUID>, JpaSpecificationExecutor<Event> {

    // Find published upcoming events
    List<Event> findByStatusAndStartDateTimeAfterOrderByStartDateTimeAsc(
            Event.Status status, LocalDateTime now);

    // Find published past events
    List<Event> findByStatusAndStartDateTimeBeforeOrderByStartDateTimeDesc(
            Event.Status status, LocalDateTime now);

    // Find events by organizer
    List<Event> findByOrganizerOrderByStartDateTimeDesc(User organizer);

    // Find events by organizer ID
    List<Event> findByOrganizerIdOrderByStartDateTimeDesc(UUID organizerId);

    // Search events by title or description
    @Query("SELECT e FROM Event e WHERE e.status = 'PUBLISHED' AND " +
           "(LOWER(e.title) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(e.description) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "ORDER BY e.startDateTime ASC")
    List<Event> searchPublishedEvents(@Param("search") String search);

    // Find events by category
    @Query("SELECT e FROM Event e JOIN e.categories c WHERE e.status = 'PUBLISHED' AND c.id = :categoryId")
    List<Event> findPublishedEventsByCategory(@Param("categoryId") UUID categoryId);

    // Paginated upcoming events
    Page<Event> findByStatusAndStartDateTimeAfter(
            Event.Status status, LocalDateTime now, Pageable pageable);

    // Find all events ordered by date (for admin)
    List<Event> findAllByOrderByStartDateTimeDesc();
}