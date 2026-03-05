package com.milktix.repository;

import com.milktix.entity.PromoCode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PromoCodeRepository extends JpaRepository<PromoCode, UUID> {
    Optional<PromoCode> findByCodeIgnoreCase(String code);
    boolean existsByCodeIgnoreCase(String code);
    List<PromoCode> findByIsActiveTrue();
    List<PromoCode> findByEventId(UUID eventId);
    List<PromoCode> findByScopeAndIsActiveTrue(PromoCode.Scope scope);
}
