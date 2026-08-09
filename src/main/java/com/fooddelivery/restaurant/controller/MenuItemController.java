package com.fooddelivery.restaurant.controller;

import com.fooddelivery.common.response.ApiResponse;
import com.fooddelivery.restaurant.dto.MenuItemRequest;
import com.fooddelivery.restaurant.dto.MenuItemResponse;
import com.fooddelivery.restaurant.service.MenuItemService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/restaurants/{restaurantId}/menu")
public class MenuItemController {

    private final MenuItemService menuItemService;

    public MenuItemController(MenuItemService menuItemService) {
        this.menuItemService = menuItemService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('RESTAURANT_OWNER', 'ADMIN')")
    public ResponseEntity<ApiResponse<MenuItemResponse>> addMenuItem(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long restaurantId,
            @Valid @RequestBody MenuItemRequest request
    ) {
        MenuItemResponse response = menuItemService.addMenuItem(userDetails.getUsername(), restaurantId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Menu item added successfully", response));
    }

    @PutMapping("/{itemId}")
    @PreAuthorize("hasAnyRole('RESTAURANT_OWNER', 'ADMIN')")
    public ResponseEntity<ApiResponse<MenuItemResponse>> updateMenuItem(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long restaurantId,
            @PathVariable Long itemId,
            @Valid @RequestBody MenuItemRequest request
    ) {
        MenuItemResponse response = menuItemService.updateMenuItem(userDetails.getUsername(), restaurantId, itemId, request);
        return ResponseEntity.ok(ApiResponse.success("Menu item updated successfully", response));
    }

    @DeleteMapping("/{itemId}")
    @PreAuthorize("hasAnyRole('RESTAURANT_OWNER', 'ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteMenuItem(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long restaurantId,
            @PathVariable Long itemId
    ) {
        menuItemService.deleteMenuItem(userDetails.getUsername(), restaurantId, itemId);
        return ResponseEntity.ok(ApiResponse.success("Menu item deleted successfully", null));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<MenuItemResponse>>> getMenu(@PathVariable Long restaurantId) {
        List<MenuItemResponse> responses = menuItemService.getMenu(restaurantId);
        return ResponseEntity.ok(ApiResponse.success("Menu retrieved successfully", responses));
    }
}
