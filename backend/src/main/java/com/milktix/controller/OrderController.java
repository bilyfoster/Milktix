package com.milktix.controller;

import com.milktix.dto.*;
import com.milktix.entity.Order;
import com.milktix.entity.Ticket;
import com.milktix.entity.User;
import com.milktix.repository.OrderRepository;
import com.milktix.repository.TicketRepository;
import com.milktix.security.UserDetailsImpl;
import com.milktix.service.OrderService;
import com.stripe.exception.StripeException;
import com.stripe.model.Event;
import com.stripe.model.PaymentIntent;
import com.stripe.net.Webhook;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "*", maxAge = 3600)
public class OrderController {

    @Value("${stripe.webhook.secret}")
    private String webhookSecret;

    @Autowired
    private OrderService orderService;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private TicketRepository ticketRepository;

    // Create order
    @PostMapping
    public ResponseEntity<?> createOrder(
            @Valid @RequestBody OrderCreateRequest request,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        
        try {
            Map<UUID, Integer> ticketQuantities = new HashMap<>();
            for (var item : request.items()) {
                ticketQuantities.put(item.ticketTypeId(), item.quantity());
            }

            Order order = orderService.createOrder(
                    userDetails.getId(),
                    request.eventId(),
                    ticketQuantities,
                    request.billingName(),
                    request.billingEmail()
            );

            return ResponseEntity.ok(mapToOrderResponse(order));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Create payment intent
    @PostMapping("/{orderId}/payment-intent")
    public ResponseEntity<?> createPaymentIntent(@PathVariable UUID orderId) {
        try {
            PaymentIntentResponse response = orderService.createPaymentIntent(orderId);
            return ResponseEntity.ok(response);
        } catch (StripeException e) {
            return ResponseEntity.badRequest().body("Payment error: " + e.getMessage());
        }
    }

    // Get my orders
    @GetMapping("/my")
    public ResponseEntity<List<OrderResponse>> getMyOrders(
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        
        User user = new User();
        user.setId(userDetails.getId());
        
        List<Order> orders = orderRepository.findByUserOrderByCreatedAtDesc(user);
        
        return ResponseEntity.ok(orders.stream()
                .map(this::mapToOrderResponse)
                .collect(Collectors.toList()));
    }

    // Get order by ID
    @GetMapping("/{id}")
    public ResponseEntity<OrderResponse> getOrderById(@PathVariable UUID id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        
        return ResponseEntity.ok(mapToOrderResponse(order));
    }

    // Webhook for Stripe
    @PostMapping("/webhook")
    public ResponseEntity<Void> handleStripeWebhook(@RequestBody String payload,
                                                      @RequestHeader("Stripe-Signature") String sigHeader) {
        try {
            // Verify webhook signature
            Event event = Webhook.constructEvent(payload, sigHeader, webhookSecret);
            
            // Handle the event
            switch (event.getType()) {
                case "payment_intent.succeeded":
                    PaymentIntent paymentIntent = (PaymentIntent) event.getDataObjectDeserializer().getObject().orElse(null);
                    if (paymentIntent != null) {
                        orderService.confirmPayment(paymentIntent.getId());
                    }
                    break;
                    
                case "payment_intent.payment_failed":
                    // Handle failed payment - could update order status
                    break;
                    
                default:
                    // Unexpected event type
                    break;
            }
            
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            // Invalid signature or other error
            return ResponseEntity.badRequest().build();
        }
    }

    // Get all orders (admin/organizer)
    @GetMapping
    @PreAuthorize("hasRole('ORGANIZER') or hasRole('ADMIN')")
    public ResponseEntity<List<OrderResponse>> getAllOrders() {
        List<Order> orders = orderRepository.findAll();
        return ResponseEntity.ok(orders.stream()
                .map(this::mapToOrderResponse)
                .collect(Collectors.toList()));
    }

    private OrderResponse mapToOrderResponse(Order order) {
        return new OrderResponse(
                order.getId(),
                order.getOrderNumber(),
                new EventSummary(
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

    private TicketResponse mapToTicketResponse(Ticket ticket) {
        return new TicketResponse(
                ticket.getId(),
                ticket.getTicketNumber(),
                new TicketTypeSummary(
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
