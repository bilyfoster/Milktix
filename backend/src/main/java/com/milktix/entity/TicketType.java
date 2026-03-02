package com.milktix.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Entity
@Table(name = "ticket_types")
public class TicketType {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @NotBlank
    private String name;

    private String description;

    @NotNull
    @Positive
    private BigDecimal price;

    @NotNull
    @PositiveOrZero
    private Integer quantityAvailable;

    @PositiveOrZero
    private Integer quantitySold = 0;

    @PositiveOrZero
    private Integer minPerOrder = 1;

    @PositiveOrZero
    private Integer maxPerOrder = 10;

    private LocalDateTime salesStart;
    private LocalDateTime salesEnd;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id")
    private Event event;

    @OneToMany(mappedBy = "ticketType", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<Ticket> tickets = new HashSet<>();

    @CreationTimestamp
    private LocalDateTime createdAt;

    // Constructors
    public TicketType() {}

    public TicketType(String name, String description, BigDecimal price, 
                      Integer quantityAvailable, Event event) {
        this.name = name;
        this.description = description;
        this.price = price;
        this.quantityAvailable = quantityAvailable;
        this.event = event;
    }

    // Getters and Setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }

    public Integer getQuantityAvailable() { return quantityAvailable; }
    public void setQuantityAvailable(Integer quantityAvailable) { this.quantityAvailable = quantityAvailable; }

    public Integer getQuantitySold() { return quantitySold; }
    public void setQuantitySold(Integer quantitySold) { this.quantitySold = quantitySold; }

    public Integer getMinPerOrder() { return minPerOrder; }
    public void setMinPerOrder(Integer minPerOrder) { this.minPerOrder = minPerOrder; }

    public Integer getMaxPerOrder() { return maxPerOrder; }
    public void setMaxPerOrder(Integer maxPerOrder) { this.maxPerOrder = maxPerOrder; }

    public LocalDateTime getSalesStart() { return salesStart; }
    public void setSalesStart(LocalDateTime salesStart) { this.salesStart = salesStart; }

    public LocalDateTime getSalesEnd() { return salesEnd; }
    public void setSalesEnd(LocalDateTime salesEnd) { this.salesEnd = salesEnd; }

    public Event getEvent() { return event; }
    public void setEvent(Event event) { this.event = event; }

    public Set<Ticket> getTickets() { return tickets; }
    public void setTickets(Set<Ticket> tickets) { this.tickets = tickets; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    // Helper methods
    public Integer getQuantityRemaining() {
        return quantityAvailable - quantitySold;
    }

    public boolean isAvailable() {
        LocalDateTime now = LocalDateTime.now();
        boolean withinSalesWindow = true;
        
        if (salesStart != null && now.isBefore(salesStart)) {
            withinSalesWindow = false;
        }
        if (salesEnd != null && now.isAfter(salesEnd)) {
            withinSalesWindow = false;
        }
        
        return withinSalesWindow && getQuantityRemaining() > 0;
    }

    public boolean canPurchase(int quantity) {
        return isAvailable() 
               && quantity >= minPerOrder 
               && quantity <= maxPerOrder
               && quantity <= getQuantityRemaining();
    }
}