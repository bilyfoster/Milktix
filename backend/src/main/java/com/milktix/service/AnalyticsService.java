package com.milktix.service;

import com.milktix.dto.*;
import com.milktix.entity.Event;
import com.milktix.entity.Order;
import com.milktix.entity.Ticket;
import com.milktix.entity.User;
import com.milktix.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AnalyticsService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private TicketRepository ticketRepository;

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private UserRepository userRepository;

    @Transactional(readOnly = true)
    public EventAnalyticsDTO getEventAnalytics(UUID eventId) {
        Event event = eventRepository.findById(eventId)
            .orElseThrow(() -> new RuntimeException("Event not found"));

        // Get all tickets for this event
        List<Ticket> tickets = ticketRepository.findByTicketType_EventId(eventId);
        
        // Get all orders for this event
        List<Order> orders = orderRepository.findByEventId(eventId);

        // Calculate metrics
        int totalTickets = tickets.size();
        int ticketsSold = (int) tickets.stream()
            .filter(t -> t.getStatus() != Ticket.Status.CANCELLED)
            .count();
        
        BigDecimal totalRevenue = orders.stream()
            .filter(o -> o.getStatus() == Order.Status.COMPLETED)
            .map(Order::getTotalAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        int totalOrders = (int) orders.stream()
            .filter(o -> o.getStatus() == Order.Status.COMPLETED)
            .count();

        // Sales by ticket type
        Map<String, Integer> salesByTicketType = tickets.stream()
            .filter(t -> t.getStatus() != Ticket.Status.CANCELLED)
            .collect(Collectors.groupingBy(
                t -> t.getTicketType().getName(),
                Collectors.collectingAndThen(Collectors.counting(), Long::intValue)
            ));

        // Revenue by ticket type
        Map<String, BigDecimal> revenueByTicketType = new HashMap<>();
        for (Order order : orders) {
            if (order.getStatus() == Order.Status.COMPLETED) {
                for (Ticket ticket : order.getTickets()) {
                    String typeName = ticket.getTicketType().getName();
                    BigDecimal price = ticket.getTicketType().getPrice();
                    revenueByTicketType.merge(typeName, price, BigDecimal::add);
                }
            }
        }

        // Daily sales trend (last 30 days)
        LocalDate today = LocalDate.now();
        List<DailySalesDTO> salesTrend = new ArrayList<>();
        
        for (int i = 29; i >= 0; i--) {
            LocalDate date = today.minusDays(i);
            LocalDateTime startOfDay = date.atStartOfDay();
            LocalDateTime endOfDay = date.plusDays(1).atStartOfDay();
            
            List<Order> dayOrders = orders.stream()
                .filter(o -> o.getCreatedAt() != null && 
                    !o.getCreatedAt().isBefore(startOfDay) && 
                    o.getCreatedAt().isBefore(endOfDay) &&
                    o.getStatus() == Order.Status.COMPLETED)
                .toList();
            
            int dayTickets = dayOrders.stream()
                .mapToInt(o -> o.getTickets().size())
                .sum();
            
            BigDecimal dayRevenue = dayOrders.stream()
                .map(Order::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
            
            salesTrend.add(new DailySalesDTO(date.toString(), dayTickets, dayRevenue));
        }

        return new EventAnalyticsDTO(
            event.getTitle(),
            totalTickets,
            ticketsSold,
            totalRevenue,
            totalOrders,
            salesByTicketType,
            revenueByTicketType,
            salesTrend
        );
    }

    @Transactional(readOnly = true)
    public DashboardAnalyticsDTO getDashboardAnalytics(UUID organizerId) {
        User organizer = userRepository.findById(organizerId)
            .orElseThrow(() -> new RuntimeException("User not found"));

        // Get all events by this organizer
        List<Event> events = eventRepository.findByOrganizer(organizer);

        int totalEvents = events.size();
        int upcomingEvents = (int) events.stream()
            .filter(e -> e.getStartDateTime().isAfter(LocalDateTime.now()))
            .count();

        // Get all orders for these events
        List<Order> allOrders = new ArrayList<>();
        for (Event event : events) {
            allOrders.addAll(orderRepository.findByEventId(event.getId()));
        }

        BigDecimal totalRevenue = allOrders.stream()
            .filter(o -> o.getStatus() == Order.Status.COMPLETED)
            .map(Order::getTotalAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        int totalTicketsSold = allOrders.stream()
            .filter(o -> o.getStatus() == Order.Status.COMPLETED)
            .mapToInt(o -> o.getTickets().size())
            .sum();

        // Recent sales (last 7 days)
        LocalDateTime weekAgo = LocalDateTime.now().minusDays(7);
        BigDecimal lastWeekRevenue = allOrders.stream()
            .filter(o -> o.getStatus() == Order.Status.COMPLETED && 
                o.getCreatedAt().isAfter(weekAgo))
            .map(Order::getTotalAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        return new DashboardAnalyticsDTO(
            totalEvents,
            upcomingEvents,
            totalTicketsSold,
            totalRevenue,
            lastWeekRevenue
        );
    }

    @Transactional(readOnly = true)
    public PlatformAnalyticsDTO getPlatformAnalytics() {
        // Total users
        long totalUsers = userRepository.count();
        long newUsersThisMonth = userRepository.countByCreatedAtAfter(
            LocalDateTime.now().minusDays(30));

        // Total events
        long totalEvents = eventRepository.count();
        long upcomingEvents = eventRepository.countByStartDateTimeAfterAndStatus(
            LocalDateTime.now(), Event.Status.PUBLISHED);

        // Total revenue
        List<Order> allPaidOrders = orderRepository.findByStatus(Order.Status.COMPLETED);
        BigDecimal totalRevenue = allPaidOrders.stream()
            .map(Order::getTotalAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Tickets sold
        long totalTicketsSold = ticketRepository.countByStatus(Ticket.Status.VALID) 
                + ticketRepository.countByStatus(Ticket.Status.USED);

        return new PlatformAnalyticsDTO(
            totalUsers,
            newUsersThisMonth,
            totalEvents,
            upcomingEvents,
            totalRevenue,
            (int) totalTicketsSold
        );
    }
}
