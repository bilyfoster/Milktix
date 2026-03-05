package com.milktix.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "check_ins")
public class CheckIn {

    public enum CheckInMethod {
        QR_SCAN,    // Scanned QR code
        MANUAL,     // Manual name/email lookup
        API,        // External API/integration
        BULK        // Bulk check-in
    }

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "ticket_id", nullable = false)
    private Ticket ticket;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id", nullable = false)
    private Event event;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "checked_in_by")
    private User checkedInBy;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private CheckInMethod checkInMethod;

    @Column(length = 100)
    private String checkInStation;

    private BigDecimal latitude;
    private BigDecimal longitude;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @CreationTimestamp
    private LocalDateTime checkedInAt;

    private LocalDateTime revertedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reverted_by")
    private User revertedBy;

    @Column(columnDefinition = "TEXT")
    private String revertReason;

    // Getters and Setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public Ticket getTicket() { return ticket; }
    public void setTicket(Ticket ticket) { this.ticket = ticket; }

    public Event getEvent() { return event; }
    public void setEvent(Event event) { this.event = event; }

    public User getCheckedInBy() { return checkedInBy; }
    public void setCheckedInBy(User checkedInBy) { this.checkedInBy = checkedInBy; }

    public CheckInMethod getCheckInMethod() { return checkInMethod; }
    public void setCheckInMethod(CheckInMethod checkInMethod) { this.checkInMethod = checkInMethod; }

    public String getCheckInStation() { return checkInStation; }
    public void setCheckInStation(String checkInStation) { this.checkInStation = checkInStation; }

    public BigDecimal getLatitude() { return latitude; }
    public void setLatitude(BigDecimal latitude) { this.latitude = latitude; }

    public BigDecimal getLongitude() { return longitude; }
    public void setLongitude(BigDecimal longitude) { this.longitude = longitude; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public LocalDateTime getCheckedInAt() { return checkedInAt; }
    public void setCheckedInAt(LocalDateTime checkedInAt) { this.checkedInAt = checkedInAt; }

    public LocalDateTime getRevertedAt() { return revertedAt; }
    public void setRevertedAt(LocalDateTime revertedAt) { this.revertedAt = revertedAt; }

    public User getRevertedBy() { return revertedBy; }
    public void setRevertedBy(User revertedBy) { this.revertedBy = revertedBy; }

    public String getRevertReason() { return revertReason; }
    public void setRevertReason(String revertReason) { this.revertReason = revertReason; }
}
