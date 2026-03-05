package com.milktix.repository;

import com.milktix.entity.PromoCodeUsage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PromoCodeUsageRepository extends JpaRepository<PromoCodeUsage, UUID> {
    long countByPromoCodeIdAndUserId(UUID promoCodeId, UUID userId);
    List<PromoCodeUsage> findByUserId(UUID userId);
    List<PromoCodeUsage> findByPromoCodeId(UUID promoCodeId);
}
