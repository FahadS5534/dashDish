package com.fooddelivery.restaurant.service;

import com.fooddelivery.common.exception.ResourceNotFoundException;
import com.fooddelivery.restaurant.dto.MenuItemRequest;
import com.fooddelivery.restaurant.dto.MenuItemResponse;
import com.fooddelivery.restaurant.model.MenuItem;
import com.fooddelivery.restaurant.model.Restaurant;
import com.fooddelivery.restaurant.repository.MenuItemRepository;
import com.fooddelivery.restaurant.repository.RestaurantRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Slf4j
public class MenuItemService {

    private final MenuItemRepository menuItemRepository;
    private final RestaurantRepository restaurantRepository;

    public MenuItemService(MenuItemRepository menuItemRepository, RestaurantRepository restaurantRepository) {
        this.menuItemRepository = menuItemRepository;
        this.restaurantRepository = restaurantRepository;
    }

    @Transactional
    public MenuItemResponse addMenuItem(String ownerEmail, Long restaurantId, MenuItemRequest request) {
        log.info("Adding menu item: {} to restaurant: {}", request.getName(), restaurantId);
        Restaurant restaurant = restaurantRepository.findByIdAndOwnerEmail(restaurantId, ownerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant not found with ID: " + restaurantId + " for owner: " + ownerEmail));

        MenuItem menuItem = MenuItem.builder()
                .restaurant(restaurant)
                .name(request.getName())
                .description(request.getDescription())
                .price(request.getPrice())
                .isVeg(request.getIsVeg() == null || request.getIsVeg())
                .isAvailable(request.getIsAvailable() == null || request.getIsAvailable())
                .category(request.getCategory())
                .build();

        MenuItem savedItem = menuItemRepository.save(menuItem);
        log.info("Menu item added successfully with ID: {}", savedItem.getId());
        return mapToResponse(savedItem);
    }

    @Transactional
    public MenuItemResponse updateMenuItem(String ownerEmail, Long restaurantId, Long itemId, MenuItemRequest request) {
        log.info("Updating menu item ID: {} for restaurant: {}", itemId, restaurantId);
        // Verify owner owns the restaurant
        restaurantRepository.findByIdAndOwnerEmail(restaurantId, ownerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant not found with ID: " + restaurantId + " for owner: " + ownerEmail));

        MenuItem menuItem = menuItemRepository.findByIdAndRestaurantId(itemId, restaurantId)
                .orElseThrow(() -> new ResourceNotFoundException("Menu item not found with ID: " + itemId + " for restaurant: " + restaurantId));

        menuItem.setName(request.getName());
        menuItem.setDescription(request.getDescription());
        menuItem.setPrice(request.getPrice());
        if (request.getIsVeg() != null) {
            menuItem.setVeg(request.getIsVeg());
        }
        if (request.getIsAvailable() != null) {
            menuItem.setAvailable(request.getIsAvailable());
        }
        menuItem.setCategory(request.getCategory());

        MenuItem updatedItem = menuItemRepository.save(menuItem);
        log.info("Menu item ID: {} updated successfully", itemId);
        return mapToResponse(updatedItem);
    }

    @Transactional
    public void deleteMenuItem(String ownerEmail, Long restaurantId, Long itemId) {
        log.info("Deleting menu item ID: {} from restaurant: {}", itemId, restaurantId);
        // Verify owner owns the restaurant
        restaurantRepository.findByIdAndOwnerEmail(restaurantId, ownerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant not found with ID: " + restaurantId + " for owner: " + ownerEmail));

        MenuItem menuItem = menuItemRepository.findByIdAndRestaurantId(itemId, restaurantId)
                .orElseThrow(() -> new ResourceNotFoundException("Menu item not found with ID: " + itemId + " for restaurant: " + restaurantId));

        menuItemRepository.delete(menuItem);
        log.info("Menu item ID: {} deleted successfully", itemId);
    }

    public List<MenuItemResponse> getMenu(Long restaurantId) {
        log.info("Retrieving menu for restaurant ID: {}", restaurantId);
        return menuItemRepository.findByRestaurantId(restaurantId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private MenuItemResponse mapToResponse(MenuItem m) {
        return MenuItemResponse.builder()
                .id(m.getId())
                .restaurantId(m.getRestaurant().getId())
                .name(m.getName())
                .description(m.getDescription())
                .price(m.getPrice())
                .isVeg(m.isVeg())
                .isAvailable(m.isAvailable())
                .category(m.getCategory())
                .createdAt(m.getCreatedAt())
                .updatedAt(m.getUpdatedAt())
                .build();
    }
}
