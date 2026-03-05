package com.milktix.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "promo_codes")
public class PromoCode {

    public enum DiscountType {
        PERCENTAGE,      // 0-100%
        FIXED_AMOUNT,    // $ off
        COMP             // 100% off (free/comp ticket)
    }

    public enum Scope {
        GLOBAL,          // All events
        EVENT_SPECIFIC   // Specific event only
    }

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true, length = 50)
    private String code;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private DiscountType discountType;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal discountValue;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Scope scope = Scope.GLOBAL;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id")
    private Event event;

    @ElementCollection
    @CollectionTable(name = "promo_code_ticket_types", joinColumns = @JoinColumn(name = "promo_code_id"))
    @Column(name = "ticket_type_id")
    private List<UUID> applicableTicketTypes;

    private Integer maxUses; // null = unlimited

    private Integer maxUsesPerUser = 1;

    private Integer currentUses = 0;

    private Integer minTickets = 1;

    private BigDecimal minAmount;

    private LocalDateTime startDate;

    private LocalDateTime endDate;

    private Boolean isActive = true;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private User createdBy;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    // Getters and Setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public DiscountType getDiscountType() { return discountType; }
    public void setDiscountType(DiscountType discountType) { this.discountType = discountType; }

    public BigDecimal getDiscountValue() { return discountValue; }
    public void setDiscountValue(BigDecimal discountValue) { this.discountValue = discountValue; }

    public Scope getScope() { return scope; }
    public void setScope(Scope scope) { this.scope = scope; }

    public Event getEvent() { return event; }
    public void setEvent(Event event) { this.event = event; }

    public List<UUID> getApplicableTicketTypes() { return applicableTicketTypes; }
    public void setApplicableTicketTypes(List<UUID> applicableTicketTypes) { this.applicableTicketTypes = applicableTicketTypes; }

    public Integer getMaxUses() { return maxUses; }
    public void setMaxUses(Integer maxUses) { this.maxUses = maxUses; }

    public Integer getMaxUsesPerUser() { return maxUsesPerUser; }
    public void setMaxUsesPerUser(Integer maxUsesPerUser) { this.maxUsesPerUser = maxUsesPerUser; }

    public Integer getCurrentUses() { return currentUses; }
    public void setCurrentUses(Integer currentUses) { this.currentUses = currentUses; }

    public Integer getMinTickets() { return minTickets; }
    public void setMinTickets(Integer minTickets) { this.minTickets = minTickets; }

    public BigDecimal getMinAmount() { return minAmount; }
    public void setMinAmount(BigDecimal minAmount) { this.minAmount = minAmount; }

    public LocalDateTime getStartDate() { return startDate; }
    public void setStartDate(LocalDateTime startDate) { this.startDate = startDate; }

    public LocalDateTime getEndDate() { return endDate; }
    public void setEndDate(LocalDateTime endDate) { this.endDate = endDate; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }

    public User getCreatedBy() { return createdBy; }
    public void setCreatedBy(User createdBy) { this.createdBy = createdBy; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    // Helper methods
    public boolean isValid() {
        if (!isActive) return false;
        
        LocalDateTime now = LocalDateTime.now();
        if (startDate != null && now.isBefore(startDate)) return false;
        if (endDate != null && now.isAfter(endDate)) return false;
        
        if (maxUses != null && currentUses >= maxUses) return false;
        
        return true;
    }

    public boolean isCompCode() {
        return discountType == DiscountType.COMP;
    }
}
