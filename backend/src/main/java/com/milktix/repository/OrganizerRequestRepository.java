package com.milktix.repository;

import com.milktix.entity.OrganizerRequest;
import com.milktix.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface OrganizerRequestRepository extends JpaRepository<OrganizerRequest, UUID> {
    
    List<OrganizerRequest> findByStatusOrderByCreatedAtDesc(OrganizerRequest.Status status);
    
    List<OrganizerRequest> findAllByOrderByCreatedAtDesc();
    
    Optional<OrganizerRequest> findByUser(User user);
    
    Optional<OrganizerRequest> findByUserId(UUID userId);
    
    boolean existsByUserAndStatus(User user, OrganizerRequest.Status status);
    
    boolean existsByUserIdAndStatus(UUID userId, OrganizerRequest.Status status);
}
