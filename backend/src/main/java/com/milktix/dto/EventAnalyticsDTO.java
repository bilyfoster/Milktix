package com.milktix.dto;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public record EventAnalyticsDTO(
    String eventTitle,
    int totalTickets,
    int ticketsSold,
    BigDecimal totalRevenue,
    int totalOrders,
    Map<String, Integer> salesByTicketType,
    Map<String, BigDecimal> revenueByTicketType,
    List<DailySalesDTO> salesTrend
) {}
