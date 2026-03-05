package com.milktix.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "payouts")
public class Payout {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organizer_id")
    private User organizer;

    @NotNull
    @DecimalMin(value = "0.01")
    @Column(precision = 12, scale = 2)
    private BigDecimal amount;

    @NotNull
    @Enumerated(EnumType.STRING)
    private Status status = Status.PENDING;

    private String stripeTransferId;

    private LocalDateTime periodStart;

    private LocalDateTime periodEnd;

    @CreationTimestamp
    private LocalDateTime createdAt;

    private LocalDateTime paidAt;

    @Column(length = 1000)
    private String notes;

    public enum Status {
        PENDING,
        PROCESSING,
        PAID,
        FAILED
    }

    // Constructors
    public Payout() {}

    public Payout(User organizer, BigDecimal amount, LocalDateTime periodStart, LocalDateTime periodEnd) {
        this.organizer = organizer;
        this.amount = amount;
        this.periodStart = periodStart;
        this.periodEnd = periodEnd;
    }

    // Getters and Setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public User getOrganizer() { return organizer; }
    public void setOrganizer(User organizer) { this.organizer = organizer; }

    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }

    public Status getStatus() { return status; }
    public void setStatus(Status status) { this.status = status; }

    public String getStripeTransferId() { return stripeTransferId; }
    public void setStripeTransferId(String stripeTransferId) { this.stripeTransferId = stripeTransferId; }

    public LocalDateTime getPeriodStart() { return periodStart; }
    public void setPeriodStart(LocalDateTime periodStart) { this.periodStart = periodStart; }

    public LocalDateTime getPeriodEnd() { return periodEnd; }
    public void setPeriodEnd(LocalDateTime periodEnd) { this.periodEnd = periodEnd; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getPaidAt() { return paidAt; }
    public void setPaidAt(LocalDateTime paidAt) { this.paidAt = paidAt; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    // Helper methods
    public boolean isPending() {
        return status == Status.PENDING;
    }

    public boolean isProcessing() {
        return status == Status.PROCESSING;
    }

    public boolean isPaid() {
        return status == Status.PAID;
    }

    public boolean isFailed() {
        return status == Status.FAILED;
    }

    public void markAsProcessing() {
        this.status = Status.PROCESSING;
    }

    public void markAsPaid(String stripeTransferId) {
        this.status = Status.PAID;
        this.stripeTransferId = stripeTransferId;
        this.paidAt = LocalDateTime.now();
    }

    public void markAsFailed(String failureNotes) {
        this.status = Status.FAILED;
        if (failureNotes != null) {
            this.notes = failureNotes;
        }
    }
}
