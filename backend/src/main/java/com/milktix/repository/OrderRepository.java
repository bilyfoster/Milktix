package com.milktix.repository;

import com.milktix.entity.Order;
import com.milktix.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface OrderRepository extends JpaRepository<Order, UUID>, JpaSpecificationExecutor<Order> {

    List<Order> findByUserOrderByCreatedAtDesc(User user);

    Optional<Order> findByOrderNumber(String orderNumber);

    List<Order> findByEventIdOrderByCreatedAtDesc(UUID eventId);

    List<Order> findByEventId(UUID eventId);

    List<Order> findByStatus(Order.Status status);
}