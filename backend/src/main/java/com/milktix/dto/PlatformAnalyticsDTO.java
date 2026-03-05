package com.milktix.dto;

import java.math.BigDecimal;

public record PlatformAnalyticsDTO(
    long totalUsers,
    long newUsersThisMonth,
    long totalEvents,
    long upcomingEvents,
    BigDecimal totalRevenue,
    int totalTicketsSold
) {}
