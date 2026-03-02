package com.milktix.dto;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record OrderResponse(
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
    String createdAt
) {}