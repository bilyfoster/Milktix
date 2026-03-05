package com.milktix.controller;

import com.milktix.entity.CmsPage;
import com.milktix.repository.CmsPageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/cms")
@CrossOrigin(origins = "*", maxAge = 3600)
public class CmsPageController {

    @Autowired
    private CmsPageRepository cmsPageRepository;

    // Public: Get page by slug
    @GetMapping("/pages/{slug}")
    public ResponseEntity<?> getPageBySlug(@PathVariable String slug) {
        CmsPage page = cmsPageRepository.findBySlugAndIsPublishedTrue(slug)
                .orElse(null);
        
        if (page == null) {
            // Return fallback for built-in pages
            return ResponseEntity.ok(Map.of(
                "slug", slug,
                "title", capitalize(slug),
                "content", "<p>Content for " + slug + " page.</p>",
                "fallback", true
            ));
        }
        
        return ResponseEntity.ok(page);
    }

    // Public: Get all published pages (for navigation)
    @GetMapping("/pages")
    public ResponseEntity<List<CmsPage>> getAllPublishedPages() {
        List<CmsPage> pages = cmsPageRepository.findAll().stream()
                .filter(CmsPage::getIsPublished)
                .toList();
        return ResponseEntity.ok(pages);
    }

    // Admin: Get all pages (including unpublished)
    @GetMapping("/admin/pages")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<CmsPage>> getAllPages() {
        return ResponseEntity.ok(cmsPageRepository.findAll());
    }

    // Admin: Get page by ID
    @GetMapping("/admin/pages/id/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CmsPage> getPageById(@PathVariable UUID id) {
        CmsPage page = cmsPageRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Page not found"));
        return ResponseEntity.ok(page);
    }

    // Admin: Create new page
    @PostMapping("/admin/pages")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createPage(@RequestBody CmsPage page) {
        if (cmsPageRepository.existsBySlug(page.getSlug())) {
            return ResponseEntity.badRequest().body("Page with this slug already exists");
        }
        
        CmsPage saved = cmsPageRepository.save(page);
        return ResponseEntity.ok(saved);
    }

    // Admin: Update page
    @PutMapping("/admin/pages/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CmsPage> updatePage(@PathVariable UUID id, @RequestBody CmsPage pageData) {
        CmsPage page = cmsPageRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Page not found"));
        
        page.setTitle(pageData.getTitle());
        page.setContent(pageData.getContent());
        page.setMetaDescription(pageData.getMetaDescription());
        page.setIsPublished(pageData.getIsPublished());
        
        CmsPage updated = cmsPageRepository.save(page);
        return ResponseEntity.ok(updated);
    }

    // Admin: Delete page
    @DeleteMapping("/admin/pages/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deletePage(@PathVariable UUID id) {
        cmsPageRepository.deleteById(id);
        return ResponseEntity.ok().body("Page deleted successfully");
    }

    private String capitalize(String str) {
        if (str == null || str.isEmpty()) return str;
        return str.substring(0, 1).toUpperCase() + str.substring(1);
    }
}
