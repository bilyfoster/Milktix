package com.milktix.controller;

import com.milktix.dto.EventSummary;
import com.milktix.dto.OrderResponse;
import com.milktix.dto.TicketResponse;
import com.milktix.dto.TicketTypeSummary;
import com.milktix.entity.Order;
import com.milktix.entity.Ticket;
import com.milktix.entity.User;
import com.milktix.repository.EventRepository;
import com.milktix.repository.OrderRepository;
import com.milktix.repository.TicketRepository;
import com.milktix.repository.UserRepository;
import com.milktix.security.UserDetailsImpl;
import com.milktix.service.EmailService;
import jakarta.persistence.criteria.Predicate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/orders")
@CrossOrigin(origins = "*", maxAge = 3600)
@PreAuthorize("hasRole('ADMIN')")
public class AdminOrderController {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private TicketRepository ticketRepository;

    @Autowired
    private EmailService emailService;

    /**
     * GET /api/admin/orders - List all orders with filters (status, dateFrom, dateTo, search, page, limit)
     */
    @GetMapping
    public ResponseEntity<OrderListResponse> getAllOrders(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) LocalDate dateFrom,
            @RequestParam(required = false) LocalDate dateTo,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int limit) {

        Pageable pageable = PageRequest.of(page, limit, Sort.by(Sort.Direction.DESC, "createdAt"));
        
        Specification<Order> spec = buildSpecification(status, dateFrom, dateTo, search);
        Page<Order> orderPage = orderRepository.findAll(spec, pageable);

        List<OrderResponse> orders = orderPage.getContent().stream()
                .map(this::mapToOrderResponse)
                .collect(Collectors.toList());

        OrderListResponse response = new OrderListResponse(
                orders,
                orderPage.getTotalElements(),
                orderPage.getTotalPages(),
                orderPage.getNumber(),
                orderPage.getSize()
        );

        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/admin/orders/{id} - Get single order details
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getOrderById(@PathVariable UUID id) {
        Optional<Order> orderOpt = orderRepository.findById(id);
        
        if (orderOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Order order = orderOpt.get();
        AdminOrderDetailResponse response = mapToAdminOrderDetailResponse(order);
        
        return ResponseEntity.ok(response);
    }

    /**
     * POST /api/admin/orders/{id}/refund - Process refund (full or partial)
     */
    @PostMapping("/{id}/refund")
    public ResponseEntity<?> processRefund(
            @PathVariable UUID id,
            @RequestBody RefundRequest request,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        
        Optional<Order> orderOpt = orderRepository.findById(id);
        
        if (orderOpt.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(new ErrorResponse("Order not found"));
        }

        Order order = orderOpt.get();

        // Validate order can be refunded
        if (order.getStatus() == Order.Status.CANCELLED) {
            return ResponseEntity.badRequest()
                    .body(new ErrorResponse("Cannot refund a cancelled order"));
        }

        if (order.getPaymentStatus() != Order.PaymentStatus.PAID) {
            return ResponseEntity.badRequest()
                    .body(new ErrorResponse("Cannot refund an unpaid order"));
        }

        // Validate refund amount
        if (request.amount() == null || request.amount().compareTo(BigDecimal.ZERO) <= 0) {
            return ResponseEntity.badRequest()
                    .body(new ErrorResponse("Refund amount must be greater than zero"));
        }

        if (request.amount().compareTo(order.getTotalAmount()) > 0) {
            return ResponseEntity.badRequest()
                    .body(new ErrorResponse("Refund amount cannot exceed order total"));
        }

        // Determine refund type
        Order.RefundStatus refundStatus = request.amount().compareTo(order.getTotalAmount()) == 0 
                ? Order.RefundStatus.FULL 
                : Order.RefundStatus.PARTIAL;

        // Update order with refund info
        order.setRefundStatus(refundStatus);
        order.setRefundAmount(request.amount());
        order.setRefundReason(request.reason());
        order.setRefundAt(LocalDateTime.now());
        order.setRefundedBy(userDetails.getId());
        order.setStatus(Order.Status.REFUNDED);
        order.setPaymentStatus(Order.PaymentStatus.REFUNDED);

        orderRepository.save(order);

        // Update tickets status to REFUNDED
        List<Ticket> tickets = ticketRepository.findByOrderId(order.getId());
        for (Ticket ticket : tickets) {
            ticket.setStatus(Ticket.Status.REFUNDED);
        }
        ticketRepository.saveAll(tickets);

        // Send refund confirmation email
        sendRefundConfirmationEmail(order);

        return ResponseEntity.ok(new SuccessResponse(
                "Refund processed successfully",
                Map.of(
                        "orderId", order.getId(),
                        "refundAmount", request.amount(),
                        "refundStatus", refundStatus.name()
                )
        ));
    }

    /**
     * POST /api/admin/orders/{id}/cancel - Cancel order with reason
     */
    @PostMapping("/{id}/cancel")
    public ResponseEntity<?> cancelOrder(
            @PathVariable UUID id,
            @RequestBody CancelRequest request,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        
        Optional<Order> orderOpt = orderRepository.findById(id);
        
        if (orderOpt.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(new ErrorResponse("Order not found"));
        }

        Order order = orderOpt.get();

        // Validate order can be cancelled
        if (order.getStatus() == Order.Status.CANCELLED) {
            return ResponseEntity.badRequest()
                    .body(new ErrorResponse("Order is already cancelled"));
        }

        if (order.getStatus() == Order.Status.REFUNDED) {
            return ResponseEntity.badRequest()
                    .body(new ErrorResponse("Cannot cancel a refunded order"));
        }

        // Update order status
        order.setStatus(Order.Status.CANCELLED);
        order.setCancelledAt(LocalDateTime.now());
        order.setCancelledBy(userDetails.getId());
        order.setCancelReason(request.reason());

        orderRepository.save(order);

        // Update tickets status to CANCELLED
        List<Ticket> tickets = ticketRepository.findByOrderId(order.getId());
        for (Ticket ticket : tickets) {
            ticket.setStatus(Ticket.Status.CANCELLED);
        }
        ticketRepository.saveAll(tickets);

        // Send cancellation email
        sendCancellationEmail(order);

        return ResponseEntity.ok(new SuccessResponse(
                "Order cancelled successfully",
                Map.of(
                        "orderId", order.getId(),
                        "cancelledAt", order.getCancelledAt(),
                        "reason", request.reason() != null ? request.reason() : ""
                )
        ));
    }

    /**
     * POST /api/admin/orders/{id}/resend-email - Resend order confirmation email
     */
    @PostMapping("/{id}/resend-email")
    public ResponseEntity<?> resendOrderEmail(@PathVariable UUID id) {
        Optional<Order> orderOpt = orderRepository.findById(id);
        
        if (orderOpt.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(new ErrorResponse("Order not found"));
        }

        Order order = orderOpt.get();

        // Only send for completed/paid orders
        if (order.getPaymentStatus() != Order.PaymentStatus.PAID && 
            order.getStatus() != Order.Status.COMPLETED) {
            return ResponseEntity.badRequest()
                    .body(new ErrorResponse("Cannot resend email for unpaid or incomplete orders"));
        }

        // Send order confirmation email
        sendOrderConfirmationEmail(order);

        return ResponseEntity.ok(new SuccessResponse(
                "Order confirmation email resent successfully",
                Map.of(
                        "orderId", order.getId(),
                        "emailSentTo", order.getBillingEmail() != null ? order.getBillingEmail() : ""
                )
        ));
    }

    private Specification<Order> buildSpecification(String status, LocalDate dateFrom, 
                                                     LocalDate dateTo, String search) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Filter by status
            if (status != null && !status.isBlank()) {
                try {
                    Order.Status statusEnum = Order.Status.valueOf(status.toUpperCase());
                    predicates.add(criteriaBuilder.equal(root.get("status"), statusEnum));
                } catch (IllegalArgumentException e) {
                    // Invalid status, ignore filter
                }
            }

            // Filter by date range
            if (dateFrom != null) {
                LocalDateTime fromDateTime = dateFrom.atStartOfDay();
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(
                        root.get("createdAt"), fromDateTime));
            }

            if (dateTo != null) {
                LocalDateTime toDateTime = dateTo.atTime(LocalTime.MAX);
                predicates.add(criteriaBuilder.lessThanOrEqualTo(
                        root.get("createdAt"), toDateTime));
            }

            // Search by order number, billing name, or billing email
            if (search != null && !search.isBlank()) {
                String searchLower = "%" + search.toLowerCase() + "%";
                predicates.add(criteriaBuilder.or(
                        criteriaBuilder.like(criteriaBuilder.lower(root.get("orderNumber")), searchLower),
                        criteriaBuilder.like(criteriaBuilder.lower(root.get("billingName")), searchLower),
                        criteriaBuilder.like(criteriaBuilder.lower(root.get("billingEmail")), searchLower)
                ));
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
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
                null, // tickets not loaded for list view
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

    private AdminOrderDetailResponse mapToAdminOrderDetailResponse(Order order) {
        List<Ticket> tickets = ticketRepository.findByOrderId(order.getId());
        
        return new AdminOrderDetailResponse(
                order.getId(),
                order.getOrderNumber(),
                new EventSummary(
                        order.getEvent().getId(),
                        order.getEvent().getTitle(),
                        order.getEvent().getStartDateTime().toString(),
                        order.getEvent().getVenueName()
                ),
                tickets.stream()
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
                order.getCreatedAt().toString(),
                order.getPaidAt() != null ? order.getPaidAt().toString() : null,
                order.getCancelledAt() != null ? order.getCancelledAt().toString() : null,
                order.getCancelReason(),
                order.getRefundStatus() != null ? order.getRefundStatus().name() : null,
                order.getRefundAmount(),
                order.getRefundReason(),
                order.getRefundAt() != null ? order.getRefundAt().toString() : null,
                order.getUser() != null ? order.getUser().getId() : null,
                order.getUser() != null ? order.getUser().getFullName() : null,
                order.getUser() != null ? order.getUser().getEmail() : null
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

    private void sendOrderConfirmationEmail(Order order) {
        if (order.getBillingEmail() == null || order.getBillingEmail().isBlank()) {
            return;
        }

        Map<String, String> variables = Map.of(
                "orderNumber", order.getOrderNumber(),
                "customerName", order.getBillingName() != null ? order.getBillingName() : "Customer",
                "eventTitle", order.getEvent().getTitle(),
                "eventDate", order.getEvent().getStartDateTime().toString(),
                "totalAmount", order.getTotalAmount().toString()
        );

        emailService.sendTicketConfirmationEmail(order.getBillingEmail(), variables);
    }

    private void sendRefundConfirmationEmail(Order order) {
        if (order.getBillingEmail() == null || order.getBillingEmail().isBlank()) {
            return;
        }

        Map<String, String> variables = Map.of(
                "orderNumber", order.getOrderNumber(),
                "customerName", order.getBillingName() != null ? order.getBillingName() : "Customer",
                "refundAmount", order.getRefundAmount() != null ? order.getRefundAmount().toString() : "0",
                "refundReason", order.getRefundReason() != null ? order.getRefundReason() : ""
        );

        emailService.sendTemplateEmail(order.getBillingEmail(), "refund_confirmation", variables);
    }

    private void sendCancellationEmail(Order order) {
        if (order.getBillingEmail() == null || order.getBillingEmail().isBlank()) {
            return;
        }

        Map<String, String> variables = Map.of(
                "orderNumber", order.getOrderNumber(),
                "customerName", order.getBillingName() != null ? order.getBillingName() : "Customer",
                "eventTitle", order.getEvent().getTitle(),
                "cancelReason", order.getCancelReason() != null ? order.getCancelReason() : ""
        );

        emailService.sendTemplateEmail(order.getBillingEmail(), "order_cancellation", variables);
    }

    // Response DTOs
    public record OrderListResponse(
            List<OrderResponse> orders,
            long totalElements,
            int totalPages,
            int currentPage,
            int pageSize
    ) {}

    public record AdminOrderDetailResponse(
            UUID id,
            String orderNumber,
            EventSummary event,
            List<TicketResponse> tickets,
            BigDecimal subtotal,
            BigDecimal taxAmount,
            BigDecimal feeAmount,
            BigDecimal totalAmount,
            String status,
            String paymentStatus,
            String billingName,
            String billingEmail,
            String createdAt,
            String paidAt,
            String cancelledAt,
            String cancelReason,
            String refundStatus,
            BigDecimal refundAmount,
            String refundReason,
            String refundAt,
            UUID userId,
            String userName,
            String userEmail
    ) {}

    // Request DTOs
    public record RefundRequest(
            BigDecimal amount,
            String reason
    ) {}

    public record CancelRequest(
            String reason
    ) {}

    public record ErrorResponse(String error) {}

    public record SuccessResponse(String message, Map<String, Object> data) {}
}
