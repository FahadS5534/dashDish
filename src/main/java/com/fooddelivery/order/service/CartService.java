package com.fooddelivery.order.service;

import com.fooddelivery.common.exception.ResourceNotFoundException;
import com.fooddelivery.order.dto.CartItemRequest;
import com.fooddelivery.order.dto.CartItemResponse;
import com.fooddelivery.order.dto.CartResponse;
import com.fooddelivery.order.model.Cart;
import com.fooddelivery.order.model.CartItem;
import com.fooddelivery.order.repository.CartItemRepository;
import com.fooddelivery.order.repository.CartRepository;
import com.fooddelivery.restaurant.model.MenuItem;
import com.fooddelivery.restaurant.repository.MenuItemRepository;
import com.fooddelivery.user.model.User;
import com.fooddelivery.user.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Slf4j
public class CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final MenuItemRepository menuItemRepository;
    private final UserRepository userRepository;

    public CartService(
            CartRepository cartRepository,
            CartItemRepository cartItemRepository,
            MenuItemRepository menuItemRepository,
            UserRepository userRepository
    ) {
        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
        this.menuItemRepository = menuItemRepository;
        this.userRepository = userRepository;
    }

    private Cart getOrCreateCartEntity(User user) {
        return cartRepository.findByUserId(user.getId())
                .orElseGet(() -> cartRepository.save(Cart.builder().user(user).cartItems(new ArrayList<>()).build()));
    }

    @Transactional
    public CartResponse getCart(String email) {
        log.info("Fetching cart for user: {}", email);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));

        Cart cart = getOrCreateCartEntity(user);
        return mapToResponse(cart);
    }

    @Transactional
    public CartResponse addItemToCart(String email, CartItemRequest request) {
        log.info("Adding menu item ID: {} to user cart: {}", request.getMenuItemId(), email);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));

        MenuItem menuItem = menuItemRepository.findById(request.getMenuItemId())
                .orElseThrow(() -> new ResourceNotFoundException("Menu item not found with ID: " + request.getMenuItemId()));

        if (!menuItem.isAvailable()) {
            throw new IllegalArgumentException("Menu item is not available");
        }

        Cart cart = getOrCreateCartEntity(user);

        // Validate single restaurant rule
        if (!cart.getCartItems().isEmpty()) {
            Long currentRestId = cart.getCartItems().get(0).getMenuItem().getRestaurant().getId();
            Long newRestId = menuItem.getRestaurant().getId();
            if (!currentRestId.equals(newRestId)) {
                throw new IllegalArgumentException("Cart contains items from another restaurant. Please clear your cart first.");
            }
        }

        Optional<CartItem> existingItem = cart.getCartItems().stream()
                .filter(item -> item.getMenuItem().getId().equals(menuItem.getId()))
                .findFirst();

        if (existingItem.isPresent()) {
            CartItem cartItem = existingItem.get();
            cartItem.setQuantity(request.getQuantity());
            cartItemRepository.save(cartItem);
        } else {
            CartItem cartItem = CartItem.builder()
                    .cart(cart)
                    .menuItem(menuItem)
                    .quantity(request.getQuantity())
                    .build();
            cart.getCartItems().add(cartItem);
            cartRepository.save(cart);
        }

        return mapToResponse(cart);
    }

    @Transactional
    public CartResponse removeItemFromCart(String email, Long itemId) {
        log.info("Removing cart item ID: {} from user cart: {}", itemId, email);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));

        Cart cart = cartRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Cart not found for user: " + email));

        CartItem cartItem = cart.getCartItems().stream()
                .filter(item -> item.getId().equals(itemId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found with ID: " + itemId));

        cart.getCartItems().remove(cartItem);
        cartItemRepository.delete(cartItem);
        cartRepository.save(cart);

        return mapToResponse(cart);
    }

    @Transactional
    public void clearCart(String email) {
        log.info("Clearing cart for user: {}", email);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));

        Cart cart = cartRepository.findByUserId(user.getId())
                .orElse(null);

        if (cart != null && !cart.getCartItems().isEmpty()) {
            cartItemRepository.deleteByCartId(cart.getId());
            cart.getCartItems().clear();
            cartRepository.save(cart);
        }
    }

    private CartResponse mapToResponse(Cart cart) {
        BigDecimal total = BigDecimal.ZERO;
        java.util.List<CartItemResponse> itemResponses = new java.util.ArrayList<>();

        if (cart.getCartItems() != null) {
            for (CartItem item : cart.getCartItems()) {
                BigDecimal itemCost = item.getMenuItem().getPrice().multiply(BigDecimal.valueOf(item.getQuantity()));
                total = total.add(itemCost);

                itemResponses.add(CartItemResponse.builder()
                        .id(item.getId())
                        .menuItemId(item.getMenuItem().getId())
                        .menuItemName(item.getMenuItem().getName())
                        .price(item.getMenuItem().getPrice())
                        .quantity(item.getQuantity())
                        .build());
            }
        }

        return CartResponse.builder()
                .id(cart.getId())
                .userId(cart.getUser().getId())
                .items(itemResponses)
                .totalPrice(total)
                .build();
    }
}
