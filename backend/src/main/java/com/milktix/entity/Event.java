package com.milktix.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Entity
@Table(name = "events")
public class Event {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @NotBlank
    @Size(max = 200)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @NotNull
    private LocalDateTime startDateTime;

    private LocalDateTime endDateTime;

    @NotBlank
    @Size(max = 200)
    private String venueName;

    @Size(max = 500)
    private String venueAddress;

    private String venueCity;
    private String venueState;
    private String venueZip;

    @Enumerated(EnumType.STRING)
    private Status status = Status.DRAFT;

    @Enumerated(EnumType.STRING)
    private EventType eventType = EventType.PUBLIC;

    private String imageUrl;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organizer_id")
    private User organizer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "host_id")
    private Host host;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "location_id")
    private Location location;

    @OneToMany(mappedBy = "event", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<TicketType> ticketTypes = new HashSet<>();

    @ManyToMany
    @JoinTable(
        name = "event_categories",
        joinColumns = @JoinColumn(name = "event_id"),
        inverseJoinColumns = @JoinColumn(name = "category_id")
    )
    private Set<Category> categories = new HashSet<>();

    // For recurring events - link to template
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "template_id")
    private EventTemplate template;

    // For series tracking
    private UUID seriesId;
    private Integer seriesInstanceNumber;
    private Boolean isRecurringInstance = false;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    public enum Status {
        DRAFT,
        PUBLISHED,
        CANCELLED,
        COMPLETED
    }

    public enum EventType {
        PUBLIC,
        PRIVATE,
        MEMBERS_ONLY
    }

    // Constructors
    public Event() {}

    public Event(String title, String description, LocalDateTime startDateTime, 
                 String venueName, User organizer) {
        this.title = title;
        this.description = description;
        this.startDateTime = startDateTime;
        this.venueName = venueName;
        this.organizer = organizer;
    }

    // Getters and Setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public LocalDateTime getStartDateTime() { return startDateTime; }
    public void setStartDateTime(LocalDateTime startDateTime) { this.startDateTime = startDateTime; }

    public LocalDateTime getEndDateTime() { return endDateTime; }
    public void setEndDateTime(LocalDateTime endDateTime) { this.endDateTime = endDateTime; }

    public String getVenueName() { return venueName; }
    public void setVenueName(String venueName) { this.venueName = venueName; }

    public String getVenueAddress() { return venueAddress; }
    public void setVenueAddress(String venueAddress) { this.venueAddress = venueAddress; }

    public String getVenueCity() { return venueCity; }
    public void setVenueCity(String venueCity) { this.venueCity = venueCity; }

    public String getVenueState() { return venueState; }
    public void setVenueState(String venueState) { this.venueState = venueState; }

    public String getVenueZip() { return venueZip; }
    public void setVenueZip(String venueZip) { this.venueZip = venueZip; }

    public Status getStatus() { return status; }
    public void setStatus(Status status) { this.status = status; }

    public EventType getEventType() { return eventType; }
    public void setEventType(EventType eventType) { this.eventType = eventType; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public User getOrganizer() { return organizer; }
    public void setOrganizer(User organizer) { this.organizer = organizer; }

    public Host getHost() { return host; }
    public void setHost(Host host) { this.host = host; }

    public Location getLocation() { return location; }
    public void setLocation(Location location) { this.location = location; }

    public Set<TicketType> getTicketTypes() { return ticketTypes; }
    public void setTicketTypes(Set<TicketType> ticketTypes) { this.ticketTypes = ticketTypes; }

    public Set<Category> getCategories() { return categories; }
    public void setCategories(Set<Category> categories) { this.categories = categories; }

    public EventTemplate getTemplate() { return template; }
    public void setTemplate(EventTemplate template) { this.template = template; }

    public UUID getSeriesId() { return seriesId; }
    public void setSeriesId(UUID seriesId) { this.seriesId = seriesId; }

    public Integer getSeriesInstanceNumber() { return seriesInstanceNumber; }
    public void setSeriesInstanceNumber(Integer seriesInstanceNumber) { this.seriesInstanceNumber = seriesInstanceNumber; }

    public Boolean getIsRecurringInstance() { return isRecurringInstance; }
    public void setIsRecurringInstance(Boolean isRecurringInstance) { this.isRecurringInstance = isRecurringInstance; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    // Helper method to check if event is upcoming
    public boolean isUpcoming() {
        return startDateTime != null && startDateTime.isAfter(LocalDateTime.now());
    }

    // Helper method to check if event is past
    public boolean isPast() {
        return startDateTime != null && startDateTime.isBefore(LocalDateTime.now());
    }
}