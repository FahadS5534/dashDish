package com.fooddelivery.restaurant.controller;

import com.fooddelivery.common.response.ApiResponse;
import com.fooddelivery.restaurant.dto.RestaurantRequest;
import com.fooddelivery.restaurant.dto.RestaurantResponse;
import com.fooddelivery.restaurant.service.RestaurantService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/restaurants")
public class RestaurantController {

    private final RestaurantService restaurantService;

    public RestaurantController(RestaurantService restaurantService) {
        this.restaurantService = restaurantService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('RESTAURANT_OWNER', 'ADMIN')")
    public ResponseEntity<ApiResponse<RestaurantResponse>> createRestaurant(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody RestaurantRequest request
    ) {
        RestaurantResponse response = restaurantService.createRestaurant(userDetails.getUsername(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Restaurant created successfully", response));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('RESTAURANT_OWNER', 'ADMIN')")
    public ResponseEntity<ApiResponse<RestaurantResponse>> updateRestaurant(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id,
            @Valid @RequestBody RestaurantRequest request
    ) {
        RestaurantResponse response = restaurantService.updateRestaurant(userDetails.getUsername(), id, request);
        return ResponseEntity.ok(ApiResponse.success("Restaurant updated successfully", response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<RestaurantResponse>> getRestaurantById(@PathVariable Long id) {
        RestaurantResponse response = restaurantService.getRestaurantById(id);
        return ResponseEntity.ok(ApiResponse.success("Restaurant details retrieved successfully", response));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<RestaurantResponse>>> getActiveRestaurants() {
        List<RestaurantResponse> responses = restaurantService.getActiveRestaurants();
        return ResponseEntity.ok(ApiResponse.success("Active restaurants retrieved successfully", responses));
    }

    @GetMapping("/city/{city}")
    public ResponseEntity<ApiResponse<List<RestaurantResponse>>> getActiveRestaurantsByCity(@PathVariable String city) {
        List<RestaurantResponse> responses = restaurantService.getActiveRestaurantsByCity(city);
        return ResponseEntity.ok(ApiResponse.success("Active restaurants in " + city + " retrieved successfully", responses));
    }
}
