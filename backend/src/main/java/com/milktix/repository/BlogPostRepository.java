package com.milktix.repository;

import com.milktix.entity.BlogPost;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface BlogPostRepository extends JpaRepository<BlogPost, UUID> {
    Optional<BlogPost> findBySlugAndStatus(String slug, BlogPost.Status status);
    List<BlogPost> findByStatusOrderByPublishedAtDesc(BlogPost.Status status);
    Page<BlogPost> findByStatus(BlogPost.Status status, Pageable pageable);
    List<BlogPost> findByCategoryAndStatus(String category, BlogPost.Status status);
    Page<BlogPost> findByCategoryAndStatus(String category, BlogPost.Status status, Pageable pageable);
    List<BlogPost> findByStatusAndPublishedAtBefore(BlogPost.Status status, LocalDateTime date);
    boolean existsBySlug(String slug);
    List<BlogPost> findTop3ByFeaturedTrueAndStatusOrderByPublishedAtDesc(BlogPost.Status status);
    
    @Query("SELECT DISTINCT b.category FROM BlogPost b WHERE b.category IS NOT NULL AND b.status = 'PUBLISHED'")
    List<String> findDistinctCategories();
}
