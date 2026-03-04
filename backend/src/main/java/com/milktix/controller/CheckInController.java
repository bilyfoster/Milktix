package com.milktix.controller;

import com.milktix.entity.Ticket;
import com.milktix.repository.TicketRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/checkin")
@CrossOrigin(origins = "*", maxAge = 3600)
public class CheckInController {

    @Autowired
    private TicketRepository ticketRepository;

    // Verify a ticket before check-in (public endpoint for scanning)
    @PostMapping("/verify")
    public ResponseEntity<?> verifyTicket(@RequestBody Map<String, String> request) {
        String ticketNumber = request.get("ticketNumber");
        
        if (ticketNumber == null || ticketNumber.isEmpty()) {
            return ResponseEntity.badRequest().body("Ticket number is required");
        }
        
        Ticket ticket = ticketRepository.findByTicketNumber(ticketNumber)
                .orElse(null);
        
        if (ticket == null) {
            Map<String, Object> response = new HashMap<>();
            response.put("valid", false);
            response.put("message", "Ticket not found");
            return ResponseEntity.ok(response);
        }
        
        Map<String, Object> response = new HashMap<>();
        response.put("ticketNumber", ticket.getTicketNumber());
        response.put("eventTitle", ticket.getTicketType().getEvent().getTitle());
        response.put("ticketType", ticket.getTicketType().getName());
        response.put("attendeeName", ticket.getAttendeeName());
        response.put("attendeeEmail", ticket.getAttendeeEmail());
        response.put("status", ticket.getStatus().name());
        response.put("valid", ticket.isValid());
        response.put("checkedIn", ticket.getCheckedInAt() != null);
        
        if (ticket.getCheckedInAt() != null) {
            response.put("checkedInAt", ticket.getCheckedInAt().toString());
        }
        
        return ResponseEntity.ok(response);
    }

    // Perform check-in (Organizer/Admin only)
    @PostMapping
    @PreAuthorize("hasRole('ORGANIZER') or hasRole('ADMIN')")
    public ResponseEntity<?> checkIn(@RequestBody Map<String, String> request) {
        String ticketNumber = request.get("ticketNumber");
        
        if (ticketNumber == null || ticketNumber.isEmpty()) {
            return ResponseEntity.badRequest().body("Ticket number is required");
        }
        
        Ticket ticket = ticketRepository.findByTicketNumber(ticketNumber)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));
        
        if (!ticket.isValid()) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Ticket is not valid for check-in");
            return ResponseEntity.ok(response);
        }
        
        if (ticket.getCheckedInAt() != null) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Ticket has already been checked in");
            response.put("checkedInAt", ticket.getCheckedInAt().toString());
            return ResponseEntity.ok(response);
        }
        
        ticket.checkIn();
        ticketRepository.save(ticket);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("ticketNumber", ticket.getTicketNumber());
        response.put("eventTitle", ticket.getTicketType().getEvent().getTitle());
        response.put("ticketType", ticket.getTicketType().getName());
        response.put("attendeeName", ticket.getAttendeeName());
        response.put("checkedInAt", ticket.getCheckedInAt().toString());
        
        return ResponseEntity.ok(response);
    }
}
