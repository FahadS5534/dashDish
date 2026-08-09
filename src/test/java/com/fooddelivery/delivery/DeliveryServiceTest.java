package com.fooddelivery.delivery;

import com.fooddelivery.delivery.dto.DeliveryAssignmentResponse;
import com.fooddelivery.delivery.model.DeliveryAssignment;
import com.fooddelivery.delivery.model.DeliveryStatus;
import com.fooddelivery.delivery.repository.DeliveryAssignmentRepository;
import com.fooddelivery.delivery.service.DeliveryService;
import com.fooddelivery.order.model.Order;
import com.fooddelivery.order.model.OrderStatus;
import com.fooddelivery.order.repository.OrderRepository;
import com.fooddelivery.user.model.Role;
import com.fooddelivery.user.model.User;
import com.fooddelivery.user.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class DeliveryServiceTest {

    @Mock
    private DeliveryAssignmentRepository deliveryAssignmentRepository;

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private DeliveryService deliveryService;

    @Test
    void initiateDeliverySearch_success() {
        Order order = Order.builder().id(50L).build();
        deliveryService.initiateDeliverySearch(order);
        verify(deliveryAssignmentRepository, times(1)).save(any(DeliveryAssignment.class));
    }

    @Test
    void getAvailableDeliveries_success() {
        Order order = Order.builder().id(50L).build();
        DeliveryAssignment assignment = DeliveryAssignment.builder()
                .id(1L)
                .order(order)
                .status(DeliveryStatus.SEARCHING)
                .build();

        when(deliveryAssignmentRepository.findByStatus(DeliveryStatus.SEARCHING)).thenReturn(List.of(assignment));

        List<DeliveryAssignmentResponse> list = deliveryService.getAvailableDeliveries();

        assertNotNull(list);
        assertEquals(1, list.size());
        assertEquals("SEARCHING", list.get(0).getStatus());
    }

    @Test
    void acceptDelivery_success() {
        String partnerEmail = "delivery@gmail.com";
        Long assignmentId = 1L;

        User partner = User.builder().id(3L).email(partnerEmail).role(Role.DELIVERY_PARTNER).name("Rider").build();
        Order order = Order.builder().id(50L).build();
        DeliveryAssignment assignment = DeliveryAssignment.builder()
                .id(assignmentId)
                .order(order)
                .status(DeliveryStatus.SEARCHING)
                .build();

        DeliveryAssignment savedAssignment = DeliveryAssignment.builder()
                .id(assignmentId)
                .order(order)
                .deliveryPartner(partner)
                .status(DeliveryStatus.ASSIGNED)
                .assignedAt(LocalDateTime.now())
                .build();

        when(userRepository.findByEmail(partnerEmail)).thenReturn(Optional.of(partner));
        when(deliveryAssignmentRepository.findById(assignmentId)).thenReturn(Optional.of(assignment));
        when(deliveryAssignmentRepository.save(any(DeliveryAssignment.class))).thenReturn(savedAssignment);

        DeliveryAssignmentResponse response = deliveryService.acceptDelivery(partnerEmail, assignmentId);

        assertNotNull(response);
        assertEquals("ASSIGNED", response.getStatus());
        assertEquals("Rider", response.getDeliveryPartnerName());
    }

    @Test
    void updateDeliveryStatus_pickedUp() {
        String partnerEmail = "delivery@gmail.com";
        Long assignmentId = 1L;

        User partner = User.builder().id(3L).email(partnerEmail).role(Role.DELIVERY_PARTNER).build();
        Order order = Order.builder().id(50L).status(OrderStatus.PLACED).build();
        DeliveryAssignment assignment = DeliveryAssignment.builder()
                .id(assignmentId)
                .order(order)
                .deliveryPartner(partner)
                .status(DeliveryStatus.ASSIGNED)
                .build();

        when(deliveryAssignmentRepository.findById(assignmentId)).thenReturn(Optional.of(assignment));
        when(deliveryAssignmentRepository.save(any(DeliveryAssignment.class))).thenReturn(assignment);
        when(orderRepository.save(any(Order.class))).thenReturn(order);

        DeliveryAssignmentResponse response = deliveryService.updateDeliveryStatus(partnerEmail, assignmentId, DeliveryStatus.PICKED_UP);

        assertNotNull(response);
        assertEquals("PICKED_UP", response.getStatus());
        assertEquals(OrderStatus.OUT_FOR_DELIVERY, order.getStatus());
    }

    @Test
    void updateDeliveryStatus_delivered() {
        String partnerEmail = "delivery@gmail.com";
        Long assignmentId = 1L;

        User partner = User.builder().id(3L).email(partnerEmail).role(Role.DELIVERY_PARTNER).build();
        Order order = Order.builder().id(50L).status(OrderStatus.OUT_FOR_DELIVERY).build();
        DeliveryAssignment assignment = DeliveryAssignment.builder()
                .id(assignmentId)
                .order(order)
                .deliveryPartner(partner)
                .status(DeliveryStatus.PICKED_UP)
                .build();

        when(deliveryAssignmentRepository.findById(assignmentId)).thenReturn(Optional.of(assignment));
        when(deliveryAssignmentRepository.save(any(DeliveryAssignment.class))).thenReturn(assignment);
        when(orderRepository.save(any(Order.class))).thenReturn(order);

        DeliveryAssignmentResponse response = deliveryService.updateDeliveryStatus(partnerEmail, assignmentId, DeliveryStatus.DELIVERED);

        assertNotNull(response);
        assertEquals("DELIVERED", response.getStatus());
        assertEquals(OrderStatus.DELIVERED, order.getStatus());
        assertNotNull(assignment.getDeliveredAt());
    }
}
