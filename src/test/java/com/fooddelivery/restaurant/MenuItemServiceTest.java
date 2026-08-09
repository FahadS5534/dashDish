package com.fooddelivery.restaurant;

import com.fooddelivery.restaurant.dto.MenuItemRequest;
import com.fooddelivery.restaurant.dto.MenuItemResponse;
import com.fooddelivery.restaurant.model.MenuItem;
import com.fooddelivery.restaurant.model.Restaurant;
import com.fooddelivery.restaurant.repository.MenuItemRepository;
import com.fooddelivery.restaurant.repository.RestaurantRepository;
import com.fooddelivery.restaurant.service.MenuItemService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class MenuItemServiceTest {

    @Mock
    private MenuItemRepository menuItemRepository;

    @Mock
    private RestaurantRepository restaurantRepository;

    @InjectMocks
    private MenuItemService menuItemService;

    @Test
    void addMenuItem_success() {
        String email = "owner@gmail.com";
        Long restaurantId = 10L;
        MenuItemRequest request = MenuItemRequest.builder()
                .name("Margherita Pizza")
                .description("Cheesy cheese pizza")
                .price(BigDecimal.valueOf(299.00))
                .category("Pizza")
                .isVeg(true)
                .isAvailable(true)
                .build();

        Restaurant restaurant = Restaurant.builder().id(restaurantId).name("Pizza Palace").build();
        MenuItem menuItem = MenuItem.builder()
                .id(20L)
                .restaurant(restaurant)
                .name("Margherita Pizza")
                .description("Cheesy cheese pizza")
                .price(BigDecimal.valueOf(299.00))
                .category("Pizza")
                .isVeg(true)
                .isAvailable(true)
                .build();

        when(restaurantRepository.findByIdAndOwnerEmail(restaurantId, email)).thenReturn(Optional.of(restaurant));
        when(menuItemRepository.save(any(MenuItem.class))).thenReturn(menuItem);

        MenuItemResponse response = menuItemService.addMenuItem(email, restaurantId, request);

        assertNotNull(response);
        assertEquals(20L, response.getId());
        assertEquals("Margherita Pizza", response.getName());
        verify(menuItemRepository, times(1)).save(any(MenuItem.class));
    }

    @Test
    void updateMenuItem_success() {
        String email = "owner@gmail.com";
        Long restaurantId = 10L;
        Long itemId = 20L;
        MenuItemRequest request = MenuItemRequest.builder()
                .name("Margherita Pizza Double Cheese")
                .description("Double Cheesy cheese pizza")
                .price(BigDecimal.valueOf(349.00))
                .category("Pizza")
                .isVeg(true)
                .isAvailable(true)
                .build();

        Restaurant restaurant = Restaurant.builder().id(restaurantId).name("Pizza Palace").build();
        MenuItem existing = MenuItem.builder()
                .id(itemId)
                .restaurant(restaurant)
                .name("Margherita Pizza")
                .build();

        MenuItem updated = MenuItem.builder()
                .id(itemId)
                .restaurant(restaurant)
                .name("Margherita Pizza Double Cheese")
                .description("Double Cheesy cheese pizza")
                .price(BigDecimal.valueOf(349.00))
                .category("Pizza")
                .isVeg(true)
                .isAvailable(true)
                .build();

        when(restaurantRepository.findByIdAndOwnerEmail(restaurantId, email)).thenReturn(Optional.of(restaurant));
        when(menuItemRepository.findByIdAndRestaurantId(itemId, restaurantId)).thenReturn(Optional.of(existing));
        when(menuItemRepository.save(any(MenuItem.class))).thenReturn(updated);

        MenuItemResponse response = menuItemService.updateMenuItem(email, restaurantId, itemId, request);

        assertNotNull(response);
        assertEquals("Margherita Pizza Double Cheese", response.getName());
        assertEquals(BigDecimal.valueOf(349.00), response.getPrice());
    }

    @Test
    void deleteMenuItem_success() {
        String email = "owner@gmail.com";
        Long restaurantId = 10L;
        Long itemId = 20L;

        Restaurant restaurant = Restaurant.builder().id(restaurantId).name("Pizza Palace").build();
        MenuItem item = MenuItem.builder().id(itemId).restaurant(restaurant).build();

        when(restaurantRepository.findByIdAndOwnerEmail(restaurantId, email)).thenReturn(Optional.of(restaurant));
        when(menuItemRepository.findByIdAndRestaurantId(itemId, restaurantId)).thenReturn(Optional.of(item));
        doNothing().when(menuItemRepository).delete(item);

        assertDoesNotThrow(() -> menuItemService.deleteMenuItem(email, restaurantId, itemId));
        verify(menuItemRepository, times(1)).delete(item);
    }

    @Test
    void getMenu_returnsList() {
        Long restaurantId = 10L;
        Restaurant restaurant = Restaurant.builder().id(restaurantId).build();
        MenuItem item = MenuItem.builder().id(20L).restaurant(restaurant).name("Margherita Pizza").build();

        when(menuItemRepository.findByRestaurantId(restaurantId)).thenReturn(List.of(item));

        List<MenuItemResponse> list = menuItemService.getMenu(restaurantId);

        assertNotNull(list);
        assertEquals(1, list.size());
        assertEquals("Margherita Pizza", list.get(0).getName());
    }
}
