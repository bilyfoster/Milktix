package com.milktix.repository;

import com.milktix.entity.EmailLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface EmailLogRepository extends JpaRepository<EmailLog, UUID> {
    List<EmailLog> findByRecipientEmailOrderByCreatedAtDesc(String email);
    List<EmailLog> findByStatusAndCreatedAtBefore(EmailLog.EmailStatus status, LocalDateTime date);
}
