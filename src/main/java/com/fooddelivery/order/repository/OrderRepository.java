package com.fooddelivery.order.repository;

import com.fooddelivery.order.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByUserEmail(String email);

    @Query("SELECT o FROM Order o WHERE o.restaurant.owner.email = :email")
    List<Order> findByRestaurantOwnerEmail(@Param("email") String email);

    List<Order> findByRestaurantId(Long restaurantId);
}
