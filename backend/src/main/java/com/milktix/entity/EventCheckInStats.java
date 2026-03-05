package com.milktix.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "event_checkin_stats")
public class EventCheckInStats {

    @Id
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "event_id")
    private Event event;

    private Integer totalTickets = 0;
    private Integer checkedIn = 0;
    private Integer noShow = 0;
    private Double checkInRate = 0.0;
    private LocalDateTime lastUpdated;

    // Getters and Setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public Event getEvent() { return event; }
    public void setEvent(Event event) { this.event = event; }

    public Integer getTotalTickets() { return totalTickets; }
    public void setTotalTickets(Integer totalTickets) { this.totalTickets = totalTickets; }

    public Integer getCheckedIn() { return checkedIn; }
    public void setCheckedIn(Integer checkedIn) { this.checkedIn = checkedIn; }

    public Integer getNoShow() { return noShow; }
    public void setNoShow(Integer noShow) { this.noShow = noShow; }

    public Double getCheckInRate() { return checkInRate; }
    public void setCheckInRate(Double checkInRate) { this.checkInRate = checkInRate; }

    public LocalDateTime getLastUpdated() { return lastUpdated; }
    public void setLastUpdated(LocalDateTime lastUpdated) { this.lastUpdated = lastUpdated; }
}
