package com.fooddelivery.delivery.service;

import com.fooddelivery.common.exception.ResourceNotFoundException;
import com.fooddelivery.delivery.dto.DeliveryAssignmentResponse;
import com.fooddelivery.delivery.model.DeliveryAssignment;
import com.fooddelivery.delivery.model.DeliveryStatus;
import com.fooddelivery.delivery.repository.DeliveryAssignmentRepository;
import com.fooddelivery.order.model.Order;
import com.fooddelivery.order.model.OrderStatus;
import com.fooddelivery.order.repository.OrderRepository;
import com.fooddelivery.user.model.Role;
import com.fooddelivery.user.model.User;
import com.fooddelivery.user.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Slf4j
public class DeliveryService {

    private final DeliveryAssignmentRepository deliveryAssignmentRepository;
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;

    public DeliveryService(
            DeliveryAssignmentRepository deliveryAssignmentRepository,
            OrderRepository orderRepository,
            UserRepository userRepository
    ) {
        this.deliveryAssignmentRepository = deliveryAssignmentRepository;
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public void initiateDeliverySearch(Order order) {
        log.info("Initiating delivery partner search for order ID: {}", order.getId());
        DeliveryAssignment assignment = DeliveryAssignment.builder()
                .order(order)
                .status(DeliveryStatus.SEARCHING)
                .build();
        deliveryAssignmentRepository.save(assignment);
    }

    public List<DeliveryAssignmentResponse> getAvailableDeliveries() {
        log.info("Retrieving all available delivery offers");
        return deliveryAssignmentRepository.findByStatus(DeliveryStatus.SEARCHING).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public DeliveryAssignmentResponse acceptDelivery(String partnerEmail, Long assignmentId) {
        log.info("Delivery partner: {} attempting to accept assignment ID: {}", partnerEmail, assignmentId);
        User partner = userRepository.findByEmail(partnerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + partnerEmail));

        if (partner.getRole() != Role.DELIVERY_PARTNER && partner.getRole() != Role.ADMIN) {
            throw new AccessDeniedException("Only delivery partners can accept delivery assignments");
        }

        DeliveryAssignment assignment = deliveryAssignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Delivery assignment not found with ID: " + assignmentId));

        if (assignment.getStatus() != DeliveryStatus.SEARCHING) {
            throw new IllegalStateException("Delivery offer is no longer available");
        }

        assignment.setDeliveryPartner(partner);
        assignment.setStatus(DeliveryStatus.ASSIGNED);
        assignment.setAssignedAt(LocalDateTime.now());

        DeliveryAssignment saved = deliveryAssignmentRepository.save(assignment);
        log.info("Delivery assignment ID: {} accepted by: {}", assignmentId, partnerEmail);
        return mapToResponse(saved);
    }

    @Transactional
    public DeliveryAssignmentResponse updateDeliveryStatus(String partnerEmail, Long assignmentId, DeliveryStatus status) {
        log.info("Delivery partner: {} updating assignment ID: {} status to: {}", partnerEmail, assignmentId, status);
        DeliveryAssignment assignment = deliveryAssignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Delivery assignment not found with ID: " + assignmentId));

        if (assignment.getDeliveryPartner() == null || !assignment.getDeliveryPartner().getEmail().equals(partnerEmail)) {
            throw new AccessDeniedException("You are not authorized to update this delivery assignment");
        }

        assignment.setStatus(status);

        Order order = assignment.getOrder();
        if (status == DeliveryStatus.PICKED_UP) {
            order.setStatus(OrderStatus.OUT_FOR_DELIVERY);
            orderRepository.save(order);
        } else if (status == DeliveryStatus.DELIVERED) {
            assignment.setDeliveredAt(LocalDateTime.now());
            order.setStatus(OrderStatus.DELIVERED);
            orderRepository.save(order);
        } else if (status == DeliveryStatus.CANCELLED) {
            order.setStatus(OrderStatus.CANCELLED);
            orderRepository.save(order);
        }

        DeliveryAssignment saved = deliveryAssignmentRepository.save(assignment);
        log.info("Delivery assignment ID: {} updated to: {}", assignmentId, status);
        return mapToResponse(saved);
    }

    public List<DeliveryAssignmentResponse> getPartnerDeliveries(String partnerEmail) {
        log.info("Retrieving delivery history for partner: {}", partnerEmail);
        return deliveryAssignmentRepository.findByDeliveryPartnerEmail(partnerEmail).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private DeliveryAssignmentResponse mapToResponse(DeliveryAssignment da) {
        return DeliveryAssignmentResponse.builder()
                .id(da.getId())
                .orderId(da.getOrder().getId())
                .deliveryPartnerId(da.getDeliveryPartner() != null ? da.getDeliveryPartner().getId() : null)
                .deliveryPartnerName(da.getDeliveryPartner() != null ? da.getDeliveryPartner().getName() : null)
                .status(da.getStatus().name())
                .assignedAt(da.getAssignedAt())
                .deliveredAt(da.getDeliveredAt())
                .build();
    }
}
