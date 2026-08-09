package com.fooddelivery.restaurant.repository;

import com.fooddelivery.restaurant.model.Restaurant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RestaurantRepository extends JpaRepository<Restaurant, Long> {
    List<Restaurant> findByIsActiveTrue();
    List<Restaurant> findByCityAndIsActiveTrue(String city);
    List<Restaurant> findByOwnerId(Long ownerId);
    Optional<Restaurant> findByIdAndOwnerEmail(Long id, String ownerEmail);
}
