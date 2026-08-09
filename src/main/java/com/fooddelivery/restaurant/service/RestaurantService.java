package com.fooddelivery.restaurant.service;

import com.fooddelivery.common.exception.ResourceNotFoundException;
import com.fooddelivery.restaurant.dto.RestaurantRequest;
import com.fooddelivery.restaurant.dto.RestaurantResponse;
import com.fooddelivery.restaurant.model.Restaurant;
import com.fooddelivery.restaurant.repository.RestaurantRepository;
import com.fooddelivery.user.model.User;
import com.fooddelivery.user.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Slf4j
public class RestaurantService {

    private final RestaurantRepository restaurantRepository;
    private final UserRepository userRepository;

    public RestaurantService(RestaurantRepository restaurantRepository, UserRepository userRepository) {
        this.restaurantRepository = restaurantRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public RestaurantResponse createRestaurant(String ownerEmail, RestaurantRequest request) {
        log.info("Creating restaurant with name: {} for owner: {}", request.getName(), ownerEmail);
        User owner = userRepository.findByEmail(ownerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + ownerEmail));

        Restaurant restaurant = Restaurant.builder()
                .owner(owner)
                .name(request.getName())
                .description(request.getDescription())
                .address(request.getAddress())
                .city(request.getCity())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .isActive(request.getIsActive() == null || request.getIsActive())
                .build();

        Restaurant savedRestaurant = restaurantRepository.save(restaurant);
        log.info("Restaurant created successfully with ID: {}", savedRestaurant.getId());
        return mapToResponse(savedRestaurant);
    }

    @Transactional
    public RestaurantResponse updateRestaurant(String ownerEmail, Long restaurantId, RestaurantRequest request) {
        log.info("Updating restaurant ID: {} by owner: {}", restaurantId, ownerEmail);
        Restaurant restaurant = restaurantRepository.findByIdAndOwnerEmail(restaurantId, ownerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant not found with ID: " + restaurantId + " for owner: " + ownerEmail));

        restaurant.setName(request.getName());
        restaurant.setDescription(request.getDescription());
        restaurant.setAddress(request.getAddress());
        restaurant.setCity(request.getCity());
        restaurant.setLatitude(request.getLatitude());
        restaurant.setLongitude(request.getLongitude());
        if (request.getIsActive() != null) {
            restaurant.setActive(request.getIsActive());
        }

        Restaurant updatedRestaurant = restaurantRepository.save(restaurant);
        log.info("Restaurant ID: {} updated successfully", restaurantId);
        return mapToResponse(updatedRestaurant);
    }

    public RestaurantResponse getRestaurantById(Long id) {
        log.info("Retrieving restaurant details for ID: {}", id);
        Restaurant restaurant = restaurantRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant not found with ID: " + id));

        return mapToResponse(restaurant);
    }

    public List<RestaurantResponse> getActiveRestaurants() {
        log.info("Retrieving all active restaurants");
        return restaurantRepository.findByIsActiveTrue().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<RestaurantResponse> getActiveRestaurantsByCity(String city) {
        log.info("Retrieving all active restaurants in city: {}", city);
        return restaurantRepository.findByCityAndIsActiveTrue(city).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private RestaurantResponse mapToResponse(Restaurant r) {
        return RestaurantResponse.builder()
                .id(r.getId())
                .ownerId(r.getOwner().getId())
                .name(r.getName())
                .description(r.getDescription())
                .address(r.getAddress())
                .city(r.getCity())
                .latitude(r.getLatitude())
                .longitude(r.getLongitude())
                .isActive(r.isActive())
                .createdAt(r.getCreatedAt())
                .updatedAt(r.getUpdatedAt())
                .build();
    }
}
