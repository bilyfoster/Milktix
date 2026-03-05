package com.milktix.controller;

import com.milktix.entity.BlogPost;
import com.milktix.repository.BlogPostRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/blog")
@CrossOrigin(origins = "*", maxAge = 3600)
public class BlogController {

    @Autowired
    private BlogPostRepository blogPostRepository;

    // ============================================================================
    // PUBLIC ENDPOINTS (no auth required)
    // ============================================================================

    /**
     * GET /api/blog/posts - List all published posts (paginated)
     */
    @GetMapping("/posts")
    public ResponseEntity<Page<BlogPost>> getAllPublishedPosts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("publishedAt").descending());
        Page<BlogPost> posts = blogPostRepository.findByStatus(BlogPost.Status.PUBLISHED, pageable);
        return ResponseEntity.ok(posts);
    }

    /**
     * GET /api/blog/posts/{slug} - Get single post by slug (increments viewCount)
     */
    @GetMapping("/posts/{slug}")
    public ResponseEntity<?> getPostBySlug(@PathVariable String slug) {
        BlogPost post = blogPostRepository.findBySlugAndStatus(slug, BlogPost.Status.PUBLISHED)
                .orElseThrow(() -> new RuntimeException("Post not found"));
        
        // Increment view count
        post.setViewCount(post.getViewCount() + 1);
        blogPostRepository.save(post);
        
        return ResponseEntity.ok(post);
    }

    /**
     * GET /api/blog/posts/featured - Get latest 3 featured posts
     */
    @GetMapping("/posts/featured")
    public ResponseEntity<List<BlogPost>> getFeaturedPosts() {
        List<BlogPost> featuredPosts = blogPostRepository
                .findTop3ByFeaturedTrueAndStatusOrderByPublishedAtDesc(BlogPost.Status.PUBLISHED);
        return ResponseEntity.ok(featuredPosts);
    }

    /**
     * GET /api/blog/categories - Get all unique categories
     */
    @GetMapping("/categories")
    public ResponseEntity<List<String>> getAllCategories() {
        List<String> categories = blogPostRepository.findDistinctCategories();
        return ResponseEntity.ok(categories);
    }

    /**
     * GET /api/blog/categories/{category}/posts - Get posts by category
     */
    @GetMapping("/categories/{category}/posts")
    public ResponseEntity<Page<BlogPost>> getPostsByCategory(
            @PathVariable String category,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("publishedAt").descending());
        Page<BlogPost> posts = blogPostRepository
                .findByCategoryAndStatus(category, BlogPost.Status.PUBLISHED, pageable);
        return ResponseEntity.ok(posts);
    }

    // ============================================================================
    // ADMIN ENDPOINTS (ADMIN role required)
    // ============================================================================

    /**
     * GET /api/blog/admin/posts - List all posts (any status, with pagination)
     */
    @GetMapping("/admin/posts")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<BlogPost>> getAllPosts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<BlogPost> posts = blogPostRepository.findAll(pageable);
        return ResponseEntity.ok(posts);
    }

    /**
     * GET /api/blog/admin/posts/{id} - Get any post by ID
     */
    @GetMapping("/admin/posts/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BlogPost> getPostById(@PathVariable UUID id) {
        BlogPost post = blogPostRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Post not found"));
        return ResponseEntity.ok(post);
    }

    /**
     * POST /api/blog/admin/posts - Create new post
     */
    @PostMapping("/admin/posts")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createPost(@RequestBody BlogPost post) {
        if (blogPostRepository.existsBySlug(post.getSlug())) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Post with this slug already exists"));
        }
        
        // Set initial status to DRAFT if not specified
        if (post.getStatus() == null) {
            post.setStatus(BlogPost.Status.DRAFT);
        }
        
        // Set publishedAt if publishing immediately
        if (post.getStatus() == BlogPost.Status.PUBLISHED && post.getPublishedAt() == null) {
            post.setPublishedAt(LocalDateTime.now());
        }
        
        // Initialize view count
        post.setViewCount(0L);
        
        BlogPost saved = blogPostRepository.save(post);
        return ResponseEntity.ok(saved);
    }

    /**
     * PUT /api/blog/admin/posts/{id} - Update post
     */
    @PutMapping("/admin/posts/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updatePost(@PathVariable UUID id, @RequestBody BlogPost postData) {
        BlogPost post = blogPostRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Post not found"));
        
        // Check slug uniqueness if slug is being changed
        if (!post.getSlug().equals(postData.getSlug()) && 
            blogPostRepository.existsBySlug(postData.getSlug())) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Post with this slug already exists"));
        }
        
        post.setSlug(postData.getSlug());
        post.setTitle(postData.getTitle());
        post.setContent(postData.getContent());
        post.setExcerpt(postData.getExcerpt());
        post.setCategory(postData.getCategory());
        post.setFeatured(postData.getFeatured());
        post.setMetaDescription(postData.getMetaDescription());
        
        BlogPost updated = blogPostRepository.save(post);
        return ResponseEntity.ok(updated);
    }

    /**
     * DELETE /api/blog/admin/posts/{id} - Delete post
     */
    @DeleteMapping("/admin/posts/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> deletePost(@PathVariable UUID id) {
        BlogPost post = blogPostRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Post not found"));
        
        blogPostRepository.delete(post);
        return ResponseEntity.ok(Map.of("message", "Post deleted successfully"));
    }

    /**
     * PATCH /api/blog/admin/posts/{id}/publish - Publish a post
     */
    @PatchMapping("/admin/posts/{id}/publish")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BlogPost> publishPost(@PathVariable UUID id) {
        BlogPost post = blogPostRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Post not found"));
        
        post.setStatus(BlogPost.Status.PUBLISHED);
        post.setPublishedAt(LocalDateTime.now());
        
        BlogPost updated = blogPostRepository.save(post);
        return ResponseEntity.ok(updated);
    }

    /**
     * PATCH /api/blog/admin/posts/{id}/unpublish - Unpublish a post
     */
    @PatchMapping("/admin/posts/{id}/unpublish")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BlogPost> unpublishPost(@PathVariable UUID id) {
        BlogPost post = blogPostRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Post not found"));
        
        post.setStatus(BlogPost.Status.DRAFT);
        
        BlogPost updated = blogPostRepository.save(post);
        return ResponseEntity.ok(updated);
    }
}
