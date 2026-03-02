package com.milktix.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record PaymentIntentResponse(
    String clientSecret,
    String paymentIntentId
) {}