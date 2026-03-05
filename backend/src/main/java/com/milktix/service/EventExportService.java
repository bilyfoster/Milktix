package com.milktix.service;

import com.milktix.entity.Event;
import com.milktix.entity.TicketType;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.OutputStreamWriter;
import java.io.PrintWriter;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class EventExportService {

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
    private static final String CSV_HEADER = "Event ID,Title,Start Date,Status,Host Name,Location Name,Tickets Sold,Revenue\n";

    /**
     * Exports a list of events to CSV format.
     * Includes: event id, title, startDate, status, host name, location name, tickets sold, revenue
     * 
     * @param events List of events to export
     * @return CSV content as byte array
     */
    public byte[] exportEventsToCsv(List<Event> events) {
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        
        try (PrintWriter writer = new PrintWriter(new OutputStreamWriter(outputStream, StandardCharsets.UTF_8))) {
            // Write UTF-8 BOM for Excel compatibility
            outputStream.write(0xEF);
            outputStream.write(0xBB);
            outputStream.write(0xBF);
            
            // Write header
            writer.print(CSV_HEADER);
            
            // Write data rows
            for (Event event : events) {
                String csvRow = buildCsvRow(event);
                writer.print(csvRow);
            }
            
            writer.flush();
        } catch (Exception e) {
            throw new RuntimeException("Failed to export events to CSV", e);
        }
        
        return outputStream.toByteArray();
    }

    private String buildCsvRow(Event event) {
        StringBuilder sb = new StringBuilder();
        
        // Event ID
        sb.append(escapeCsv(event.getId().toString())).append(",");
        
        // Title
        sb.append(escapeCsv(event.getTitle())).append(",");
        
        // Start Date
        String startDate = event.getStartDateTime() != null 
            ? event.getStartDateTime().format(DATE_FORMATTER) 
            : "";
        sb.append(escapeCsv(startDate)).append(",");
        
        // Status
        sb.append(escapeCsv(event.getStatus() != null ? event.getStatus().name() : "")).append(",");
        
        // Host Name
        String hostName = event.getHost() != null ? event.getHost().getName() : "";
        sb.append(escapeCsv(hostName)).append(",");
        
        // Location Name
        String locationName = event.getLocation() != null ? event.getLocation().getName() : "";
        sb.append(escapeCsv(locationName)).append(",");
        
        // Tickets Sold
        int ticketsSold = calculateTicketsSold(event);
        sb.append(ticketsSold).append(",");
        
        // Revenue
        BigDecimal revenue = calculateRevenue(event);
        sb.append(revenue.toPlainString());
        
        sb.append("\n");
        
        return sb.toString();
    }

    private int calculateTicketsSold(Event event) {
        if (event.getTicketTypes() == null) {
            return 0;
        }
        return event.getTicketTypes().stream()
                .mapToInt(TicketType::getQuantitySold)
                .sum();
    }

    private BigDecimal calculateRevenue(Event event) {
        if (event.getTicketTypes() == null) {
            return BigDecimal.ZERO;
        }
        
        BigDecimal revenue = BigDecimal.ZERO;
        for (TicketType ticketType : event.getTicketTypes()) {
            int sold = ticketType.getQuantitySold();
            if (sold > 0) {
                revenue = revenue.add(ticketType.getPrice().multiply(BigDecimal.valueOf(sold)));
            }
        }
        return revenue;
    }

    /**
     * Escapes a string for CSV output.
     * Handles commas, quotes, and newlines.
     */
    private String escapeCsv(String value) {
        if (value == null) {
            return "";
        }
        
        // If the value contains special characters, wrap it in quotes
        if (value.contains(",") || value.contains("\"") || value.contains("\n") || value.contains("\r")) {
            // Escape quotes by doubling them
            String escaped = value.replace("\"", "\"\"");
            return "\"" + escaped + "\"";
        }
        
        return value;
    }
}
