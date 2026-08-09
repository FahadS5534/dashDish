package com.fooddelivery.order.service;

import com.fooddelivery.address.model.Address;
import com.fooddelivery.address.repository.AddressRepository;
import com.fooddelivery.common.exception.ResourceNotFoundException;
import com.fooddelivery.order.dto.OrderItemResponse;
import com.fooddelivery.order.dto.OrderRequest;
import com.fooddelivery.order.dto.OrderResponse;
import com.fooddelivery.order.model.Cart;
import com.fooddelivery.order.model.CartItem;
import com.fooddelivery.order.model.Order;
import com.fooddelivery.order.model.OrderItem;
import com.fooddelivery.order.model.OrderStatus;
import com.fooddelivery.order.repository.CartItemRepository;
import com.fooddelivery.order.repository.CartRepository;
import com.fooddelivery.order.repository.OrderItemRepository;
import com.fooddelivery.order.repository.OrderRepository;
import com.fooddelivery.restaurant.model.Restaurant;
import com.fooddelivery.user.model.Role;
import com.fooddelivery.user.model.User;
import com.fooddelivery.user.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Slf4j
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final AddressRepository addressRepository;
    private final UserRepository userRepository;
    private final com.fooddelivery.delivery.service.DeliveryService deliveryService;

    public OrderService(
            OrderRepository orderRepository,
            OrderItemRepository orderItemRepository,
            CartRepository cartRepository,
            CartItemRepository cartItemRepository,
            AddressRepository addressRepository,
            UserRepository userRepository,
            com.fooddelivery.delivery.service.DeliveryService deliveryService
    ) {
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
        this.addressRepository = addressRepository;
        this.userRepository = userRepository;
        this.deliveryService = deliveryService;
    }

    @Transactional
    public OrderResponse checkoutAndPlaceOrder(String email, OrderRequest request) {
        log.info("Starting checkout for user: {}", email);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));

        Cart cart = cartRepository.findByUserId(user.getId())
                .orElseThrow(() -> new IllegalArgumentException("No cart found for user"));

        if (cart.getCartItems() == null || cart.getCartItems().isEmpty()) {
            throw new IllegalArgumentException("Cart is empty");
        }

        Address address = addressRepository.findByIdAndUserEmail(request.getAddressId(), email)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found with ID: " + request.getAddressId() + " for user: " + email));

        // Get restaurant from the first item
        Restaurant restaurant = cart.getCartItems().get(0).getMenuItem().getRestaurant();

        // Calculate total amount
        BigDecimal totalAmount = BigDecimal.ZERO;
        for (CartItem cartItem : cart.getCartItems()) {
            BigDecimal itemCost = cartItem.getMenuItem().getPrice().multiply(BigDecimal.valueOf(cartItem.getQuantity()));
            totalAmount = totalAmount.add(itemCost);
        }

        // Create Order
        Order order = Order.builder()
                .user(user)
                .restaurant(restaurant)
                .address(address)
                .totalAmount(totalAmount)
                .status(OrderStatus.PLACED)
                .orderItems(new ArrayList<>())
                .build();

        Order savedOrder = orderRepository.save(order);

        // Convert CartItems to OrderItems
        List<OrderItem> orderItems = new ArrayList<>();
        for (CartItem cartItem : cart.getCartItems()) {
            OrderItem orderItem = OrderItem.builder()
                    .order(savedOrder)
                    .menuItem(cartItem.getMenuItem())
                    .name(cartItem.getMenuItem().getName())
                    .price(cartItem.getMenuItem().getPrice())
                    .quantity(cartItem.getQuantity())
                    .build();
            orderItems.add(orderItem);
        }

        orderItemRepository.saveAll(orderItems);
        savedOrder.setOrderItems(orderItems);
        orderRepository.save(savedOrder);

        // Clear cart
        cartItemRepository.deleteByCartId(cart.getId());
        cart.getCartItems().clear();
        cartRepository.save(cart);

        deliveryService.initiateDeliverySearch(savedOrder);

        log.info("Order placed successfully with ID: {} for amount: {}", savedOrder.getId(), totalAmount);
        return mapToResponse(savedOrder);
    }

    public List<OrderResponse> getUserOrders(String email) {
        log.info("Fetching orders for customer: {}", email);
        return orderRepository.findByUserEmail(email).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<OrderResponse> getRestaurantOrders(String ownerEmail) {
        log.info("Fetching orders for restaurant owner: {}", ownerEmail);
        return orderRepository.findByRestaurantOwnerEmail(ownerEmail).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public OrderResponse getOrderById(String email, Long orderId) {
        log.info("Fetching details for order ID: {}", orderId);
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with ID: " + orderId));

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));

        // Check if authorized (Customer, Restaurant Owner, Delivery Partner, Admin)
        boolean isCustomer = order.getUser().getEmail().equals(email);
        boolean isOwner = order.getRestaurant().getOwner().getEmail().equals(email);
        boolean isAllowedRole = user.getRole() == Role.ADMIN || user.getRole() == Role.DELIVERY_PARTNER;

        if (!isCustomer && !isOwner && !isAllowedRole) {
            throw new AccessDeniedException("You are not authorized to view this order");
        }

        return mapToResponse(order);
    }

    @Transactional
    public OrderResponse updateOrderStatus(String email, Long orderId, OrderStatus status) {
        log.info("Updating order ID: {} status to: {} by: {}", orderId, status, email);
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with ID: " + orderId));

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));

        // Validate Role-Based transitions
        boolean isAdmin = user.getRole() == Role.ADMIN;
        boolean isOwner = order.getRestaurant().getOwner().getEmail().equals(email);
        boolean isDelivery = user.getRole() == Role.DELIVERY_PARTNER;

        if (!isAdmin && !isOwner && !isDelivery) {
            throw new AccessDeniedException("You are not authorized to update this order status");
        }

        order.setStatus(status);
        Order updated = orderRepository.save(order);
        log.info("Order ID: {} status updated successfully to: {}", orderId, status);
        return mapToResponse(updated);
    }

    private OrderResponse mapToResponse(Order order) {
        List<OrderItemResponse> itemResponses = order.getOrderItems().stream()
                .map(item -> OrderItemResponse.builder()
                        .id(item.getId())
                        .menuItemId(item.getMenuItem() != null ? item.getMenuItem().getId() : null)
                        .name(item.getName())
                        .price(item.getPrice())
                        .quantity(item.getQuantity())
                        .build())
                .collect(Collectors.toList());

        return OrderResponse.builder()
                .id(order.getId())
                .userId(order.getUser().getId())
                .restaurantId(order.getRestaurant().getId())
                .restaurantName(order.getRestaurant().getName())
                .addressId(order.getAddress().getId())
                .totalAmount(order.getTotalAmount())
                .status(order.getStatus().name())
                .items(itemResponses)
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .build();
    }
}
