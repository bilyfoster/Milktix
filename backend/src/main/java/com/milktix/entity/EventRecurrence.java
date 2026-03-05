package com.milktix.entity;

import jakarta.persistence.*;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

@Entity
@Table(name = "event_recurrences")
public class EventRecurrence {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @OneToOne
    @JoinColumn(name = "template_id")
    private EventTemplate template;
    
    // Recurrence pattern type
    @Enumerated(EnumType.STRING)
    private RecurrenceType recurrenceType;
    
    // For WEEKLY: which days of week (e.g., TUESDAY, FRIDAY)
    @ElementCollection
    @Enumerated(EnumType.STRING)
    private java.util.List<DayOfWeek> daysOfWeek;
    
    // For MONTHLY options
    private Integer weekOfMonth; // 1-4 or -1 for last
    private DayOfWeek dayOfWeek; // For "4th Wednesday"
    
    // For INTERVAL (every N weeks/months)
    private Integer interval = 1; // 1 = every week/month, 2 = every other, etc.
    
    // Date range
    private LocalDate startDate;
    private LocalDate endDate; // null = no end
    private Integer maxOccurrences; // alternative to endDate
    
    // Time
    private LocalTime startTime;
    private LocalTime endTime;
    
    public enum RecurrenceType {
        DAILY,           // Every day
        WEEKLY,          // Every week on specific days
        BIWEEKLY,        // Every 2 weeks
        MONTHLY,         // Same date each month
        MONTHLY_WEEKDAY, // e.g., "4th Wednesday"
        CUSTOM           // Custom interval
    }
    
    // Getters and setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    
    public EventTemplate getTemplate() { return template; }
    public void setTemplate(EventTemplate template) { this.template = template; }
    
    public RecurrenceType getRecurrenceType() { return recurrenceType; }
    public void setRecurrenceType(RecurrenceType recurrenceType) { this.recurrenceType = recurrenceType; }
    
    public java.util.List<DayOfWeek> getDaysOfWeek() { return daysOfWeek; }
    public void setDaysOfWeek(java.util.List<DayOfWeek> daysOfWeek) { this.daysOfWeek = daysOfWeek; }
    
    public Integer getWeekOfMonth() { return weekOfMonth; }
    public void setWeekOfMonth(Integer weekOfMonth) { this.weekOfMonth = weekOfMonth; }
    
    public DayOfWeek getDayOfWeek() { return dayOfWeek; }
    public void setDayOfWeek(DayOfWeek dayOfWeek) { this.dayOfWeek = dayOfWeek; }
    
    public Integer getInterval() { return interval; }
    public void setInterval(Integer interval) { this.interval = interval; }
    
    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }
    
    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }
    
    public Integer getMaxOccurrences() { return maxOccurrences; }
    public void setMaxOccurrences(Integer maxOccurrences) { this.maxOccurrences = maxOccurrences; }
    
    public LocalTime getStartTime() { return startTime; }
    public void setStartTime(LocalTime startTime) { this.startTime = startTime; }
    
    public LocalTime getEndTime() { return endTime; }
    public void setEndTime(LocalTime endTime) { this.endTime = endTime; }
}
