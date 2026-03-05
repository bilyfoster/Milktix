package com.milktix.service;

import com.milktix.entity.Event;
import com.milktix.entity.Order;
import com.milktix.entity.Ticket;
import com.milktix.repository.EventRepository;
import com.milktix.repository.OrderRepository;
import com.milktix.repository.TicketRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
public class EventReminderService {

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private TicketRepository ticketRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private EmailService emailService;

    @Value("${milktix.frontend-url:http://localhost:3000}")
    private String frontendUrl;

    // Run every hour
    @Scheduled(cron = "0 0 * * * *")
    @Transactional
    public void sendEventReminders() {
        System.out.println("Running event reminder check at: " + LocalDateTime.now());
        
        send24HourReminders();
        send1HourReminders();
    }

    private void send24HourReminders() {
        // Find events starting in ~24 hours (between 23-25 hours from now)
        LocalDateTime startWindow = LocalDateTime.now().plusHours(23);
        LocalDateTime endWindow = LocalDateTime.now().plusHours(25);
        
        List<Event> events = eventRepository.findByStartDateTimeBetweenAndStatus(
            startWindow, endWindow, Event.Status.PUBLISHED
        );
        
        for (Event event : events) {
            sendReminderForEvent(event, "event_reminder_24h");
        }
    }

    private void send1HourReminders() {
        // Find events starting in ~1 hour (between 45-75 minutes from now)
        LocalDateTime startWindow = LocalDateTime.now().plusMinutes(45);
        LocalDateTime endWindow = LocalDateTime.now().plusMinutes(75);
        
        List<Event> events = eventRepository.findByStartDateTimeBetweenAndStatus(
            startWindow, endWindow, Event.Status.PUBLISHED
        );
        
        for (Event event : events) {
            sendReminderForEvent(event, "event_reminder_1h");
        }
    }

    private void sendReminderForEvent(Event event, String templateName) {
        try {
            // Get all tickets for this event
            List<Ticket> tickets = ticketRepository.findByTicketType_Event(event);
            
            for (Ticket ticket : tickets) {
                // Skip if ticket is cancelled or refunded
                if (ticket.getStatus() == Ticket.Status.CANCELLED || 
                    ticket.getStatus() == Ticket.Status.REFUNDED) {
                    continue;
                }
                
                Order order = ticket.getOrder();
                if (order == null || order.getBillingEmail() == null) {
                    continue;
                }
                
                // Check if reminder was already sent (you might want to add a flag to track this)
                // For now, we send it every time the job runs within the window
                
                Map<String, String> variables = Map.of(
                    "firstName", order.getBillingName(),
                    "eventTitle", event.getTitle(),
                    "eventDate", event.getStartDateTime().toLocalDate().toString(),
                    "eventTime", event.getStartDateTime().toLocalTime().toString(),
                    "eventLocation", event.getVenueName() != null ? event.getVenueName() : "TBD",
                    "ticketsUrl", frontendUrl + "/orders/" + order.getId()
                );
                
                emailService.sendEventReminder(order.getBillingEmail(), templateName, variables);
                
                // Small delay to avoid overwhelming the email service
                Thread.sleep(100);
            }
            
            System.out.println("Sent " + templateName + " for event: " + event.getTitle());
            
        } catch (Exception e) {
            System.err.println("Failed to send reminders for event " + event.getTitle() + ": " + e.getMessage());
        }
    }
}
