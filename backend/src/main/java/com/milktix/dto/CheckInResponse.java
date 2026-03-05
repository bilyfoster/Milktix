package com.milktix.dto;

import java.time.LocalDateTime;

public record CheckInResponse(
    boolean success,
    String message,
    String ticketNumber,
    String attendeeName,
    String ticketType,
    String attendeeEmail,
    String status,
    LocalDateTime checkedInAt,
    String checkedInBy,
    String qrCodeData
) {
    public static CheckInResponse success(String ticketNumber, String attendeeName, 
                                          String ticketType, LocalDateTime checkedInAt) {
        return new CheckInResponse(true, null, ticketNumber, attendeeName, ticketType, 
                                   null, null, checkedInAt, null, null);
    }

    public static CheckInResponse error(String message) {
        return new CheckInResponse(false, message, null, null, null, null, null, null, null, null);
    }

    public CheckInResponse withAttendeeEmail(String email) {
        return new CheckInResponse(success, message, ticketNumber, attendeeName, 
                                   ticketType, email, status, checkedInAt, checkedInBy, qrCodeData);
    }
}
