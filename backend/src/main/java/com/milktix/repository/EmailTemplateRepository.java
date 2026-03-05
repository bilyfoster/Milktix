package com.milktix.repository;

import com.milktix.entity.EmailTemplate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface EmailTemplateRepository extends JpaRepository<EmailTemplate, UUID> {
    Optional<EmailTemplate> findByName(String name);
    Optional<EmailTemplate> findByNameAndIsActiveTrue(String name);
}
