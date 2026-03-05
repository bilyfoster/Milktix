package com.milktix.dto;

import java.math.BigDecimal;

public record DashboardAnalyticsDTO(
    int totalEvents,
    int upcomingEvents,
    int totalTicketsSold,
    BigDecimal totalRevenue,
    BigDecimal lastWeekRevenue
) {}
