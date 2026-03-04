package com.milktix.controller;

import com.milktix.dto.EventResponse;
import com.milktix.dto.OrderResponse;
import com.milktix.entity.Event;
import com.milktix.entity.Order;
import com.milktix.entity.User;
import com.milktix.repository.EventRepository;
import com.milktix.repository.OrderRepository;
import com.milktix.repository.TicketRepository;
import com.milktix.repository.UserRepository;
import com.milktix.security.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*", maxAge = 3600)
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private TicketRepository ticketRepository;

    // Get saved events for the current user
    @GetMapping("/saved-events")
    public ResponseEntity<List<EventResponse>> getSavedEvents(
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        
        User user = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // For now, return empty list - saved events feature needs to be implemented
        // with a proper many-to-many relationship between users and events
        return ResponseEntity.ok(List.of());
    }

    // Save an event
    @PostMapping("/saved-events/{eventId}")
    public ResponseEntity<?> saveEvent(
            @PathVariable UUID eventId,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        
        User user = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));
        
        // TODO: Implement saved events relationship
        // For now, just return success
        return ResponseEntity.ok().build();
    }

    // Remove a saved event
    @DeleteMapping("/saved-events/{eventId}")
    public ResponseEntity<?> removeSavedEvent(
            @PathVariable UUID eventId,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        
        User user = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // TODO: Implement saved events relationship
        return ResponseEntity.ok().build();
    }

    // Get user orders
    @GetMapping("/orders")
    public ResponseEntity<List<OrderResponse>> getUserOrders(
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        
        User user = new User();
        user.setId(userDetails.getId());
        
        List<Order> orders = orderRepository.findByUserOrderByCreatedAtDesc(user);
        
        return ResponseEntity.ok(orders.stream()
                .map(this::mapToOrderResponse)
                .collect(Collectors.toList()));
    }

    private OrderResponse mapToOrderResponse(Order order) {
        return new OrderResponse(
                order.getId(),
                order.getOrderNumber(),
                new com.milktix.dto.EventSummary(
                        order.getEvent().getId(),
                        order.getEvent().getTitle(),
                        order.getEvent().getStartDateTime().toString(),
                        order.getEvent().getVenueName()
                ),
                ticketRepository.findByOrderId(order.getId()).stream()
                        .map(this::mapToTicketResponse)
                        .collect(Collectors.toList()),
                order.getSubtotal(),
                order.getTaxAmount(),
                order.getFeeAmount(),
                order.getTotalAmount(),
                order.getStatus().name(),
                order.getPaymentStatus().name(),
                order.getBillingName(),
                order.getBillingEmail(),
                order.getCreatedAt().toString()
        );
    }

    private com.milktix.dto.TicketResponse mapToTicketResponse(com.milktix.entity.Ticket ticket) {
        return new com.milktix.dto.TicketResponse(
                ticket.getId(),
                ticket.getTicketNumber(),
                new com.milktix.dto.TicketTypeSummary(
                        ticket.getTicketType().getId(),
                        ticket.getTicketType().getName(),
                        ticket.getTicketType().getPrice()
                ),
                ticket.getAttendeeName(),
                ticket.getAttendeeEmail(),
                ticket.getStatus().name(),
                ticket.getQrCodeData(),
                ticket.getCheckedInAt() != null ? ticket.getCheckedInAt().toString() : null
        );
    }
}
