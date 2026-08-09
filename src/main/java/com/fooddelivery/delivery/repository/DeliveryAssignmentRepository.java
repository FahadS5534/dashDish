package com.fooddelivery.delivery.repository;

import com.fooddelivery.delivery.model.DeliveryAssignment;
import com.fooddelivery.delivery.model.DeliveryStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DeliveryAssignmentRepository extends JpaRepository<DeliveryAssignment, Long> {
    List<DeliveryAssignment> findByStatus(DeliveryStatus status);
    List<DeliveryAssignment> findByDeliveryPartnerEmail(String email);
    Optional<DeliveryAssignment> findByOrderId(Long orderId);
}
