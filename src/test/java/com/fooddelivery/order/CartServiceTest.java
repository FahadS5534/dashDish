package com.fooddelivery.order;

import com.fooddelivery.order.dto.CartItemRequest;
import com.fooddelivery.order.dto.CartResponse;
import com.fooddelivery.order.model.Cart;
import com.fooddelivery.order.model.CartItem;
import com.fooddelivery.order.repository.CartItemRepository;
import com.fooddelivery.order.repository.CartRepository;
import com.fooddelivery.order.service.CartService;
import com.fooddelivery.restaurant.model.MenuItem;
import com.fooddelivery.restaurant.model.Restaurant;
import com.fooddelivery.restaurant.repository.MenuItemRepository;
import com.fooddelivery.user.model.User;
import com.fooddelivery.user.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class CartServiceTest {

    @Mock
    private CartRepository cartRepository;

    @Mock
    private CartItemRepository cartItemRepository;

    @Mock
    private MenuItemRepository menuItemRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private CartService cartService;

    @Test
    void getCart_returnsCartResponse() {
        String email = "fahad@gmail.com";
        User user = User.builder().id(1L).email(email).build();
        Cart cart = Cart.builder().id(5L).user(user).cartItems(new ArrayList<>()).build();

        when(userRepository.findByEmail(email)).thenReturn(Optional.of(user));
        when(cartRepository.findByUserId(user.getId())).thenReturn(Optional.of(cart));

        CartResponse response = cartService.getCart(email);

        assertNotNull(response);
        assertEquals(5L, response.getId());
    }

    @Test
    void addItemToCart_new_addsSuccessfully() {
        String email = "fahad@gmail.com";
        CartItemRequest request = CartItemRequest.builder().menuItemId(20L).quantity(2).build();

        User user = User.builder().id(1L).email(email).build();
        Restaurant restaurant = Restaurant.builder().id(10L).build();
        MenuItem menuItem = MenuItem.builder().id(20L).restaurant(restaurant).name("Burger").price(BigDecimal.valueOf(150.0)).isAvailable(true).build();
        Cart cart = Cart.builder().id(5L).user(user).cartItems(new ArrayList<>()).build();

        when(userRepository.findByEmail(email)).thenReturn(Optional.of(user));
        when(menuItemRepository.findById(20L)).thenReturn(Optional.of(menuItem));
        when(cartRepository.findByUserId(user.getId())).thenReturn(Optional.of(cart));
        when(cartRepository.save(any(Cart.class))).thenReturn(cart);

        CartResponse response = cartService.addItemToCart(email, request);

        assertNotNull(response);
        assertEquals(1, response.getItems().size());
        assertEquals("Burger", response.getItems().get(0).getMenuItemName());
        assertEquals(2, response.getItems().get(0).getQuantity());
    }

    @Test
    void addItemToCart_differentRestaurant_throwsException() {
        String email = "fahad@gmail.com";
        CartItemRequest request = CartItemRequest.builder().menuItemId(20L).quantity(2).build();

        User user = User.builder().id(1L).email(email).build();
        Restaurant restaurant1 = Restaurant.builder().id(10L).build();
        Restaurant restaurant2 = Restaurant.builder().id(11L).build();

        MenuItem itemInCart = MenuItem.builder().id(19L).restaurant(restaurant1).name("Fries").price(BigDecimal.valueOf(80.0)).build();
        MenuItem newMenuItem = MenuItem.builder().id(20L).restaurant(restaurant2).name("Burger").price(BigDecimal.valueOf(150.0)).isAvailable(true).build();

        Cart cart = Cart.builder().id(5L).user(user).cartItems(new ArrayList<>()).build();
        CartItem cartItem = CartItem.builder().id(100L).cart(cart).menuItem(itemInCart).quantity(1).build();
        cart.getCartItems().add(cartItem);

        when(userRepository.findByEmail(email)).thenReturn(Optional.of(user));
        when(menuItemRepository.findById(20L)).thenReturn(Optional.of(newMenuItem));
        when(cartRepository.findByUserId(user.getId())).thenReturn(Optional.of(cart));

        assertThrows(IllegalArgumentException.class, () -> cartService.addItemToCart(email, request));
    }

    @Test
    void removeItemFromCart_removesSuccessfully() {
        String email = "fahad@gmail.com";
        Long cartItemId = 100L;

        User user = User.builder().id(1L).email(email).build();
        Cart cart = Cart.builder().id(5L).user(user).cartItems(new ArrayList<>()).build();
        MenuItem menuItem = MenuItem.builder().id(20L).name("Burger").price(BigDecimal.valueOf(150.0)).build();
        CartItem cartItem = CartItem.builder().id(cartItemId).cart(cart).menuItem(menuItem).quantity(1).build();
        cart.getCartItems().add(cartItem);

        when(userRepository.findByEmail(email)).thenReturn(Optional.of(user));
        when(cartRepository.findByUserId(user.getId())).thenReturn(Optional.of(cart));
        doNothing().when(cartItemRepository).delete(cartItem);

        CartResponse response = cartService.removeItemFromCart(email, cartItemId);

        assertNotNull(response);
        assertTrue(response.getItems().isEmpty());
        verify(cartItemRepository, times(1)).delete(cartItem);
    }
}
