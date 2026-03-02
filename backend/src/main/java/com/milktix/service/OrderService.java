package com.milktix.service;

import com.milktix.dto.PaymentIntentRequest;
import com.milktix.dto.PaymentIntentResponse;
import com.milktix.entity.Order;
import com.milktix.entity.Ticket;
import com.milktix.entity.TicketType;
import com.milktix.entity.User;
import com.milktix.repository.*;
import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import com.stripe.param.PaymentIntentCreateParams;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class OrderService {

    @Value("${stripe.secret.key}")
    private String stripeSecretKey;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private TicketRepository ticketRepository;

    @Autowired
    private TicketTypeRepository ticketTypeRepository;

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private UserRepository userRepository;

    @PostConstruct
    public void init() {
        Stripe.apiKey = stripeSecretKey;
    }

    @Transactional
    public Order createOrder(UUID userId, UUID eventId, Map<UUID, Integer> ticketQuantities,
                             String billingName, String billingEmail) {
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        var event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));

        // Calculate total
        BigDecimal subtotal = BigDecimal.ZERO;
        Map<TicketType, Integer> ticketsToCreate = new HashMap<>();
        
        for (Map.Entry<UUID, Integer> entry : ticketQuantities.entrySet()) {
            TicketType ticketType = ticketTypeRepository.findById(entry.getKey())
                    .orElseThrow(() -> new RuntimeException("Ticket type not found"));
            
            int quantity = entry.getValue();
            
            // Validate availability
            if (!ticketType.canPurchase(quantity)) {
                throw new RuntimeException("Cannot purchase " + quantity + " tickets of type " + ticketType.getName());
            }
            
            subtotal = subtotal.add(ticketType.getPrice().multiply(BigDecimal.valueOf(quantity)));
            ticketsToCreate.put(ticketType, quantity);
        }

        // Calculate fees (example: 2.9% + $0.30 per transaction)
        BigDecimal feeRate = new BigDecimal("0.029");
        BigDecimal feeFixed = new BigDecimal("0.30");
        BigDecimal feeAmount = subtotal.multiply(feeRate).add(feeFixed);
        
        BigDecimal totalAmount = subtotal.add(feeAmount);

        // Create order
        Order order = new Order();
        order.setOrderNumber(generateOrderNumber());
        order.setUser(user);
        order.setEvent(event);
        order.setSubtotal(subtotal);
        order.setFeeAmount(feeAmount);
        order.setTotalAmount(totalAmount);
        order.setBillingName(billingName);
        order.setBillingEmail(billingEmail);
        order.setStatus(Order.Status.PENDING);
        order.setPaymentStatus(Order.PaymentStatus.PENDING);
        
        Order savedOrder = orderRepository.save(order);

        // Create tickets (but don't finalize until payment)
        for (Map.Entry<TicketType, Integer> entry : ticketsToCreate.entrySet()) {
            TicketType ticketType = entry.getKey();
            int quantity = entry.getValue();
            
            for (int i = 0; i < quantity; i++) {
                Ticket ticket = new Ticket();
                ticket.setTicketType(ticketType);
                ticket.setOrder(savedOrder);
                ticket.setTicketNumber(generateTicketNumber());
                ticket.setStatus(Ticket.Status.VALID);
                ticketRepository.save(ticket);
            }
            
            // Update sold count
            ticketType.setQuantitySold(ticketType.getQuantitySold() + quantity);
            ticketTypeRepository.save(ticketType);
        }

        return savedOrder;
    }

    public PaymentIntentResponse createPaymentIntent(UUID orderId) throws StripeException {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        // Convert to cents for Stripe
        long amountInCents = order.getTotalAmount().multiply(BigDecimal.valueOf(100)).longValue();

        PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                .setAmount(amountInCents)
                .setCurrency("usd")
                .setAutomaticPaymentMethods(
                        PaymentIntentCreateParams.AutomaticPaymentMethods.builder()
                                .setEnabled(true)
                                .build()
                )
                .putMetadata("order_id", order.getId().toString())
                .putMetadata("order_number", order.getOrderNumber())
                .build();

        PaymentIntent paymentIntent = PaymentIntent.create(params);
        
        // Save payment intent ID
        order.setStripePaymentIntentId(paymentIntent.getId());
        orderRepository.save(order);

        return new PaymentIntentResponse(paymentIntent.getClientSecret(), paymentIntent.getId());
    }

    @Transactional
    public void confirmPayment(String paymentIntentId) {
        Order order = orderRepository.findAll().stream()
                .filter(o -> paymentIntentId.equals(o.getStripePaymentIntentId()))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Order not found for payment intent: " + paymentIntentId));

        order.markAsPaid();
        orderRepository.save(order);

        // Generate QR codes for tickets
        List<Ticket> tickets = ticketRepository.findByOrderId(order.getId());
        for (Ticket ticket : tickets) {
            String qrData = generateQRCodeData(ticket);
            ticket.setQrCodeData(qrData);
            ticketRepository.save(ticket);
        }
    }

    private String generateOrderNumber() {
        return "MTX" + System.currentTimeMillis();
    }

    private String generateTicketNumber() {
        return "TKT" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    private String generateQRCodeData(Ticket ticket) {
        // Simple QR code data format - can be enhanced
        return String.format("MILKTIX:%s:%s:%s", 
                ticket.getTicketNumber(),
                ticket.getTicketType().getEvent().getId(),
                ticket.getTicketType().getId());
    }
}