package com.milktix.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Entity
@Table(name = "orders")
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(unique = true)
    private String orderNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id")
    private Event event;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<Ticket> tickets = new HashSet<>();

    @NotNull
    @Positive
    private BigDecimal subtotal;

    private BigDecimal taxAmount = BigDecimal.ZERO;
    private BigDecimal feeAmount = BigDecimal.ZERO;

    @NotNull
    @Positive
    private BigDecimal totalAmount;

    @Enumerated(EnumType.STRING)
    private Status status = Status.PENDING;

    @Enumerated(EnumType.STRING)
    private PaymentStatus paymentStatus = PaymentStatus.PENDING;

    private String stripePaymentIntentId;
    private String stripeChargeId;

    private String billingName;
    private String billingEmail;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    private LocalDateTime paidAt;
    private LocalDateTime cancelledAt;

    // Refund fields
    @Enumerated(EnumType.STRING)
    private RefundStatus refundStatus = RefundStatus.NONE;

    private BigDecimal refundAmount;
    private String refundReason;
    private LocalDateTime refundAt;
    private UUID refundedBy;

    // Cancellation fields
    private UUID cancelledBy;
    private String cancelReason;

    public enum Status {
        PENDING,
        COMPLETED,
        CANCELLED,
        REFUNDED
    }

    public enum PaymentStatus {
        PENDING,
        PROCESSING,
        PAID,
        FAILED,
        REFUNDED
    }

    public enum RefundStatus {
        NONE,
        PARTIAL,
        FULL
    }

    // Constructors
    public Order() {}

    public Order(String orderNumber, User user, Event event, BigDecimal totalAmount) {
        this.orderNumber = orderNumber;
        this.user = user;
        this.event = event;
        this.totalAmount = totalAmount;
        this.subtotal = totalAmount;
    }

    // Getters and Setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getOrderNumber() { return orderNumber; }
    public void setOrderNumber(String orderNumber) { this.orderNumber = orderNumber; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public Event getEvent() { return event; }
    public void setEvent(Event event) { this.event = event; }

    public Set<Ticket> getTickets() { return tickets; }
    public void setTickets(Set<Ticket> tickets) { this.tickets = tickets; }

    public BigDecimal getSubtotal() { return subtotal; }
    public void setSubtotal(BigDecimal subtotal) { this.subtotal = subtotal; }

    public BigDecimal getTaxAmount() { return taxAmount; }
    public void setTaxAmount(BigDecimal taxAmount) { this.taxAmount = taxAmount; }

    public BigDecimal getFeeAmount() { return feeAmount; }
    public void setFeeAmount(BigDecimal feeAmount) { this.feeAmount = feeAmount; }

    public BigDecimal getTotalAmount() { return totalAmount; }
    public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }

    public Status getStatus() { return status; }
    public void setStatus(Status status) { this.status = status; }

    public PaymentStatus getPaymentStatus() { return paymentStatus; }
    public void setPaymentStatus(PaymentStatus paymentStatus) { this.paymentStatus = paymentStatus; }

    public String getStripePaymentIntentId() { return stripePaymentIntentId; }
    public void setStripePaymentIntentId(String stripePaymentIntentId) { this.stripePaymentIntentId = stripePaymentIntentId; }

    public String getStripeChargeId() { return stripeChargeId; }
    public void setStripeChargeId(String stripeChargeId) { this.stripeChargeId = stripeChargeId; }

    public String getBillingName() { return billingName; }
    public void setBillingName(String billingName) { this.billingName = billingName; }

    public String getBillingEmail() { return billingEmail; }
    public void setBillingEmail(String billingEmail) { this.billingEmail = billingEmail; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public LocalDateTime getPaidAt() { return paidAt; }
    public void setPaidAt(LocalDateTime paidAt) { this.paidAt = paidAt; }

    public LocalDateTime getCancelledAt() { return cancelledAt; }
    public void setCancelledAt(LocalDateTime cancelledAt) { this.cancelledAt = cancelledAt; }

    // Refund getters and setters
    public RefundStatus getRefundStatus() { return refundStatus; }
    public void setRefundStatus(RefundStatus refundStatus) { this.refundStatus = refundStatus; }

    public BigDecimal getRefundAmount() { return refundAmount; }
    public void setRefundAmount(BigDecimal refundAmount) { this.refundAmount = refundAmount; }

    public String getRefundReason() { return refundReason; }
    public void setRefundReason(String refundReason) { this.refundReason = refundReason; }

    public LocalDateTime getRefundAt() { return refundAt; }
    public void setRefundAt(LocalDateTime refundAt) { this.refundAt = refundAt; }

    public UUID getRefundedBy() { return refundedBy; }
    public void setRefundedBy(UUID refundedBy) { this.refundedBy = refundedBy; }

    // Cancellation getters and setters
    public UUID getCancelledBy() { return cancelledBy; }
    public void setCancelledBy(UUID cancelledBy) { this.cancelledBy = cancelledBy; }

    public String getCancelReason() { return cancelReason; }
    public void setCancelReason(String cancelReason) { this.cancelReason = cancelReason; }

    // Helper methods
    public boolean isPaid() {
        return paymentStatus == PaymentStatus.PAID;
    }

    public boolean isPending() {
        return status == Status.PENDING;
    }

    public boolean isCompleted() {
        return status == Status.COMPLETED;
    }

    public boolean isRefunded() {
        return refundStatus == RefundStatus.FULL || refundStatus == RefundStatus.PARTIAL;
    }

    public boolean isCancelled() {
        return status == Status.CANCELLED;
    }

    public void markAsPaid() {
        this.paymentStatus = PaymentStatus.PAID;
        this.status = Status.COMPLETED;
        this.paidAt = LocalDateTime.now();
    }

    public void markAsFailed() {
        this.paymentStatus = PaymentStatus.FAILED;
    }

    public void markAsRefunded(BigDecimal amount, UUID adminId) {
        this.refundAmount = amount;
        this.refundStatus = amount.compareTo(this.totalAmount) == 0 ? RefundStatus.FULL : RefundStatus.PARTIAL;
        this.refundAt = LocalDateTime.now();
        this.refundedBy = adminId;
        this.status = Status.REFUNDED;
        this.paymentStatus = PaymentStatus.REFUNDED;
    }

    public void markAsCancelled(String reason, UUID adminId) {
        this.status = Status.CANCELLED;
        this.cancelReason = reason;
        this.cancelledAt = LocalDateTime.now();
        this.cancelledBy = adminId;
    }
}
