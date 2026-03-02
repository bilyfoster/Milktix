package com.milktix.repository;

import com.milktix.entity.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, UUID> {

    List<Ticket> findByOrderId(UUID orderId);

    Optional<Ticket> findByTicketNumber(String ticketNumber);

    List<Ticket> findByAttendeeId(UUID attendeeId);

    long countByTicketTypeIdAndStatus(UUID ticketTypeId, Ticket.Status status);
}