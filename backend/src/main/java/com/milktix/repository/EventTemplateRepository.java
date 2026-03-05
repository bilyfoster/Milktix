package com.milktix.repository;

import com.milktix.entity.EventTemplate;
import com.milktix.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface EventTemplateRepository extends JpaRepository<EventTemplate, UUID> {
    List<EventTemplate> findByOrganizerOrderByCreatedAtDesc(User organizer);
    List<EventTemplate> findByOrganizerIdOrderByCreatedAtDesc(UUID organizerId);
}
