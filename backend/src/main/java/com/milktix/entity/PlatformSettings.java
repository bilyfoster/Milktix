package com.milktix.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "platform_settings")
public class PlatformSettings {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @NotNull
    @DecimalMin(value = "0.00", inclusive = true)
    @Column(precision = 5, scale = 2)
    private BigDecimal platformFeePercent = new BigDecimal("2.50");

    @NotNull
    @DecimalMin(value = "0.00", inclusive = true)
    @Column(precision = 10, scale = 2)
    private BigDecimal platformFeeFixed = new BigDecimal("0.30");

    @NotNull
    @DecimalMin(value = "0.00", inclusive = true)
    @Column(precision = 5, scale = 2)
    private BigDecimal stripeFeePercent = new BigDecimal("2.90");

    @NotNull
    @DecimalMin(value = "0.00", inclusive = true)
    @Column(precision = 10, scale = 2)
    private BigDecimal stripeFeeFixed = new BigDecimal("0.30");

    @NotNull
    @Enumerated(EnumType.STRING)
    private PayoutSchedule payoutSchedule = PayoutSchedule.WEEKLY;

    @NotNull
    @DecimalMin(value = "0.00", inclusive = true)
    @Column(precision = 10, scale = 2)
    private BigDecimal minimumPayoutAmount = new BigDecimal("25.00");

    @NotNull
    private boolean enableNotifications = true;

    @NotNull
    private boolean maintenanceMode = false;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    public enum PayoutSchedule {
        DAILY,
        WEEKLY,
        MONTHLY
    }

    // Constructors
    public PlatformSettings() {}

    public PlatformSettings(BigDecimal platformFeePercent, BigDecimal platformFeeFixed,
                           BigDecimal stripeFeePercent, BigDecimal stripeFeeFixed) {
        this.platformFeePercent = platformFeePercent;
        this.platformFeeFixed = platformFeeFixed;
        this.stripeFeePercent = stripeFeePercent;
        this.stripeFeeFixed = stripeFeeFixed;
    }

    // Getters and Setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public BigDecimal getPlatformFeePercent() { return platformFeePercent; }
    public void setPlatformFeePercent(BigDecimal platformFeePercent) { this.platformFeePercent = platformFeePercent; }

    public BigDecimal getPlatformFeeFixed() { return platformFeeFixed; }
    public void setPlatformFeeFixed(BigDecimal platformFeeFixed) { this.platformFeeFixed = platformFeeFixed; }

    public BigDecimal getStripeFeePercent() { return stripeFeePercent; }
    public void setStripeFeePercent(BigDecimal stripeFeePercent) { this.stripeFeePercent = stripeFeePercent; }

    public BigDecimal getStripeFeeFixed() { return stripeFeeFixed; }
    public void setStripeFeeFixed(BigDecimal stripeFeeFixed) { this.stripeFeeFixed = stripeFeeFixed; }

    public PayoutSchedule getPayoutSchedule() { return payoutSchedule; }
    public void setPayoutSchedule(PayoutSchedule payoutSchedule) { this.payoutSchedule = payoutSchedule; }

    public BigDecimal getMinimumPayoutAmount() { return minimumPayoutAmount; }
    public void setMinimumPayoutAmount(BigDecimal minimumPayoutAmount) { this.minimumPayoutAmount = minimumPayoutAmount; }

    public boolean isEnableNotifications() { return enableNotifications; }
    public void setEnableNotifications(boolean enableNotifications) { this.enableNotifications = enableNotifications; }

    public boolean isMaintenanceMode() { return maintenanceMode; }
    public void setMaintenanceMode(boolean maintenanceMode) { this.maintenanceMode = maintenanceMode; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    // Helper methods
    public BigDecimal calculatePlatformFee(BigDecimal amount) {
        BigDecimal percentageFee = amount.multiply(platformFeePercent).divide(new BigDecimal("100"));
        return percentageFee.add(platformFeeFixed);
    }

    public BigDecimal calculateStripeFee(BigDecimal amount) {
        BigDecimal percentageFee = amount.multiply(stripeFeePercent).divide(new BigDecimal("100"));
        return percentageFee.add(stripeFeeFixed);
    }

    public BigDecimal calculateTotalFees(BigDecimal amount) {
        return calculatePlatformFee(amount).add(calculateStripeFee(amount));
    }
}
