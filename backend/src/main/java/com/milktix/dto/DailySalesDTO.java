package com.milktix.dto;

import java.math.BigDecimal;

public record DailySalesDTO(
    String date,
    int tickets,
    BigDecimal revenue
) {}
