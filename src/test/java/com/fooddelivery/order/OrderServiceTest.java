package com.fooddelivery.order;

import com.fooddelivery.address.model.Address;
import com.fooddelivery.address.repository.AddressRepository;
import com.fooddelivery.order.dto.OrderRequest;
import com.fooddelivery.order.dto.OrderResponse;
import com.fooddelivery.order.model.*;
import com.fooddelivery.order.repository.CartItemRepository;
import com.fooddelivery.order.repository.CartRepository;
import com.fooddelivery.order.repository.OrderItemRepository;
import com.fooddelivery.order.repository.OrderRepository;
import com.fooddelivery.order.service.OrderService;
import com.fooddelivery.restaurant.model.MenuItem;
import com.fooddelivery.restaurant.model.Restaurant;
import com.fooddelivery.user.model.Role;
import com.fooddelivery.user.model.User;
import com.fooddelivery.user.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class OrderServiceTest {

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private OrderItemRepository orderItemRepository;

    @Mock
    private CartRepository cartRepository;

    @Mock
    private CartItemRepository cartItemRepository;

    @Mock
    private AddressRepository addressRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private com.fooddelivery.delivery.service.DeliveryService deliveryService;

    @InjectMocks
    private OrderService orderService;

    @Test
    void checkoutAndPlaceOrder_success() {
        String email = "fahad@gmail.com";
        OrderRequest request = OrderRequest.builder().addressId(30L).build();

        User user = User.builder().id(1L).email(email).build();
        Restaurant restaurant = Restaurant.builder().id(10L).name("Pizza Palace").build();
        Address address = Address.builder().id(30L).user(user).build();
        MenuItem menuItem = MenuItem.builder().id(20L).name("Burger").price(BigDecimal.valueOf(150.0)).restaurant(restaurant).build();

        Cart cart = Cart.builder().id(5L).user(user).cartItems(new ArrayList<>()).build();
        CartItem cartItem = CartItem.builder().id(100L).cart(cart).menuItem(menuItem).quantity(2).build();
        cart.getCartItems().add(cartItem);

        Order order = Order.builder()
                .id(50L)
                .user(user)
                .restaurant(restaurant)
                .address(address)
                .totalAmount(BigDecimal.valueOf(300.0))
                .status(OrderStatus.PLACED)
                .orderItems(new ArrayList<>())
                .build();

        when(userRepository.findByEmail(email)).thenReturn(Optional.of(user));
        when(cartRepository.findByUserId(user.getId())).thenReturn(Optional.of(cart));
        when(addressRepository.findByIdAndUserEmail(30L, email)).thenReturn(Optional.of(address));
        when(orderRepository.save(any(Order.class))).thenReturn(order);
        doNothing().when(deliveryService).initiateDeliverySearch(any(Order.class));

        OrderResponse response = orderService.checkoutAndPlaceOrder(email, request);

        assertNotNull(response);
        assertEquals(50L, response.getId());
        assertEquals(BigDecimal.valueOf(300.0), response.getTotalAmount());
        assertEquals("PLACED", response.getStatus());
        verify(cartItemRepository, times(1)).deleteByCartId(cart.getId());
        verify(deliveryService, times(1)).initiateDeliverySearch(any(Order.class));
    }

    @Test
    void getUserOrders_returnsList() {
        String email = "fahad@gmail.com";
        User user = User.builder().id(1L).email(email).build();
        Restaurant restaurant = Restaurant.builder().id(10L).name("Pizza Palace").build();
        Address address = Address.builder().id(30L).build();

        Order order = Order.builder()
                .id(50L)
                .user(user)
                .restaurant(restaurant)
                .address(address)
                .totalAmount(BigDecimal.valueOf(300.0))
                .status(OrderStatus.PLACED)
                .build();

        when(orderRepository.findByUserEmail(email)).thenReturn(List.of(order));

        List<OrderResponse> result = orderService.getUserOrders(email);

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(50L, result.get(0).getId());
    }

    @Test
    void updateOrderStatus_success() {
        String email = "owner@gmail.com";
        Long orderId = 50L;

        User owner = User.builder().id(2L).email(email).role(Role.RESTAURANT_OWNER).build();
        Restaurant restaurant = Restaurant.builder().id(10L).owner(owner).name("Pizza Palace").build();
        User customer = User.builder().id(1L).email("fahad@gmail.com").build();
        Address address = Address.builder().id(30L).build();

        Order order = Order.builder()
                .id(orderId)
                .user(customer)
                .restaurant(restaurant)
                .address(address)
                .totalAmount(BigDecimal.valueOf(300.0))
                .status(OrderStatus.PLACED)
                .build();

        when(orderRepository.findById(orderId)).thenReturn(Optional.of(order));
        when(userRepository.findByEmail(email)).thenReturn(Optional.of(owner));
        when(orderRepository.save(any(Order.class))).thenReturn(order);

        OrderResponse response = orderService.updateOrderStatus(email, orderId, OrderStatus.PREPARING);

        assertNotNull(response);
        assertEquals("PREPARING", response.getStatus());
    }
}
