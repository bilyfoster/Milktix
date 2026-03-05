package com.milktix.repository;

import com.milktix.entity.CmsPage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface CmsPageRepository extends JpaRepository<CmsPage, UUID> {
    Optional<CmsPage> findBySlug(String slug);
    Optional<CmsPage> findBySlugAndIsPublishedTrue(String slug);
    boolean existsBySlug(String slug);
}
