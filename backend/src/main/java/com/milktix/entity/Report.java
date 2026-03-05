package com.milktix.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "reports")
public class Report {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @NotBlank
    @Size(max = 200)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @NotNull
    @Enumerated(EnumType.STRING)
    private ReportType reportType;

    @Column(columnDefinition = "TEXT")
    private String filters;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_id")
    private User createdBy;

    @NotNull
    private boolean isScheduled = false;

    @Column(length = 50)
    private String scheduleFrequency;

    private LocalDateTime lastRunAt;

    private LocalDateTime nextRunAt;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    public enum ReportType {
        SALES,
        ATTENDANCE,
        REVENUE,
        USER_ACTIVITY
    }

    // Constructors
    public Report() {}

    public Report(String name, ReportType reportType, User createdBy) {
        this.name = name;
        this.reportType = reportType;
        this.createdBy = createdBy;
    }

    public Report(String name, String description, ReportType reportType, String filters,
                 User createdBy, boolean isScheduled, String scheduleFrequency) {
        this.name = name;
        this.description = description;
        this.reportType = reportType;
        this.filters = filters;
        this.createdBy = createdBy;
        this.isScheduled = isScheduled;
        this.scheduleFrequency = scheduleFrequency;
    }

    // Getters and Setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public ReportType getReportType() { return reportType; }
    public void setReportType(ReportType reportType) { this.reportType = reportType; }

    public String getFilters() { return filters; }
    public void setFilters(String filters) { this.filters = filters; }

    public User getCreatedBy() { return createdBy; }
    public void setCreatedBy(User createdBy) { this.createdBy = createdBy; }

    public boolean isScheduled() { return isScheduled; }
    public void setScheduled(boolean scheduled) { isScheduled = scheduled; }

    public String getScheduleFrequency() { return scheduleFrequency; }
    public void setScheduleFrequency(String scheduleFrequency) { this.scheduleFrequency = scheduleFrequency; }

    public LocalDateTime getLastRunAt() { return lastRunAt; }
    public void setLastRunAt(LocalDateTime lastRunAt) { this.lastRunAt = lastRunAt; }

    public LocalDateTime getNextRunAt() { return nextRunAt; }
    public void setNextRunAt(LocalDateTime nextRunAt) { this.nextRunAt = nextRunAt; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    // Helper methods
    public boolean isSalesReport() {
        return reportType == ReportType.SALES;
    }

    public boolean isAttendanceReport() {
        return reportType == ReportType.ATTENDANCE;
    }

    public boolean isRevenueReport() {
        return reportType == ReportType.REVENUE;
    }

    public boolean isUserActivityReport() {
        return reportType == ReportType.USER_ACTIVITY;
    }

    public void markAsRun() {
        this.lastRunAt = LocalDateTime.now();
    }

    public boolean shouldRun() {
        if (!isScheduled || nextRunAt == null) {
            return false;
        }
        return LocalDateTime.now().isAfter(nextRunAt) || LocalDateTime.now().isEqual(nextRunAt);
    }
}
