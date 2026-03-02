package com.milktix.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "tickets")
public class Ticket {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(unique = true)
    private String ticketNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ticket_type_id")
    private TicketType ticketType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id")
    private Order order;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "attendee_id")
    private User attendee;

    private String attendeeName;
    private String attendeeEmail;

    @Enumerated(EnumType.STRING)
    private Status status = Status.VALID;

    private String qrCodeData;

    private LocalDateTime checkedInAt;

    @CreationTimestamp
    private LocalDateTime createdAt;

    public enum Status {
        VALID,
        USED,
        CANCELLED,
        REFUNDED
    }

    // Constructors
    public Ticket() {}

    public Ticket(TicketType ticketType, Order order, String ticketNumber) {
        this.ticketType = ticketType;
        this.order = order;
        this.ticketNumber = ticketNumber;
    }

    // Getters and Setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getTicketNumber() { return ticketNumber; }
    public void setTicketNumber(String ticketNumber) { this.ticketNumber = ticketNumber; }

    public TicketType getTicketType() { return ticketType; }
    public void setTicketType(TicketType ticketType) { this.ticketType = ticketType; }

    public Order getOrder() { return order; }
    public void setOrder(Order order) { this.order = order; }

    public User getAttendee() { return attendee; }
    public void setAttendee(User attendee) { this.attendee = attendee; }

    public String getAttendeeName() { return attendeeName; }
    public void setAttendeeName(String attendeeName) { this.attendeeName = attendeeName; }

    public String getAttendeeEmail() { return attendeeEmail; }
    public void setAttendeeEmail(String attendeeEmail) { this.attendeeEmail = attendeeEmail; }

    public Status getStatus() { return status; }
    public void setStatus(Status status) { this.status = status; }

    public String getQrCodeData() { return qrCodeData; }
    public void setQrCodeData(String qrCodeData) { this.qrCodeData = qrCodeData; }

    public LocalDateTime getCheckedInAt() { return checkedInAt; }
    public void setCheckedInAt(LocalDateTime checkedInAt) { this.checkedInAt = checkedInAt; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    // Helper methods
    public boolean isValid() {
        return status == Status.VALID;
    }

    public boolean isUsed() {
        return status == Status.USED;
    }

    public void checkIn() {
        if (isValid()) {
            this.status = Status.USED;
            this.checkedInAt = LocalDateTime.now();
        }
    }
}