package com.fooddelivery.restaurant;

import com.fooddelivery.common.exception.ResourceNotFoundException;
import com.fooddelivery.restaurant.dto.RestaurantRequest;
import com.fooddelivery.restaurant.dto.RestaurantResponse;
import com.fooddelivery.restaurant.model.Restaurant;
import com.fooddelivery.restaurant.repository.RestaurantRepository;
import com.fooddelivery.restaurant.service.RestaurantService;
import com.fooddelivery.user.model.Role;
import com.fooddelivery.user.model.User;
import com.fooddelivery.user.repository.UserRepository;
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
public class RestaurantServiceTest {

    @Mock
    private RestaurantRepository restaurantRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private RestaurantService restaurantService;

    @Test
    void createRestaurant_success() {
        String email = "owner@gmail.com";
        RestaurantRequest request = RestaurantRequest.builder()
                .name("Pizza Palace")
                .description("Tasty Pizzas")
                .address("123 Food Street")
                .city("Mumbai")
                .latitude(BigDecimal.valueOf(19.076))
                .longitude(BigDecimal.valueOf(72.877))
                .isActive(true)
                .build();

        User owner = User.builder().id(1L).email(email).role(Role.RESTAURANT_OWNER).build();
        Restaurant restaurant = Restaurant.builder()
                .id(10L)
                .owner(owner)
                .name("Pizza Palace")
                .description("Tasty Pizzas")
                .address("123 Food Street")
                .city("Mumbai")
                .latitude(BigDecimal.valueOf(19.076))
                .longitude(BigDecimal.valueOf(72.877))
                .isActive(true)
                .build();

        when(userRepository.findByEmail(email)).thenReturn(Optional.of(owner));
        when(restaurantRepository.save(any(Restaurant.class))).thenReturn(restaurant);

        RestaurantResponse response = restaurantService.createRestaurant(email, request);

        assertNotNull(response);
        assertEquals(10L, response.getId());
        assertEquals("Pizza Palace", response.getName());
        verify(restaurantRepository, times(1)).save(any(Restaurant.class));
    }

    @Test
    void updateRestaurant_success() {
        String email = "owner@gmail.com";
        Long restaurantId = 10L;
        RestaurantRequest request = RestaurantRequest.builder()
                .name("Pizza Palace Updated")
                .description("Updated Tasty Pizzas")
                .address("123 Food Street")
                .city("Mumbai")
                .isActive(true)
                .build();

        User owner = User.builder().id(1L).email(email).build();
        Restaurant existing = Restaurant.builder()
                .id(restaurantId)
                .owner(owner)
                .name("Pizza Palace")
                .build();

        Restaurant updated = Restaurant.builder()
                .id(restaurantId)
                .owner(owner)
                .name("Pizza Palace Updated")
                .description("Updated Tasty Pizzas")
                .address("123 Food Street")
                .city("Mumbai")
                .isActive(true)
                .build();

        when(restaurantRepository.findByIdAndOwnerEmail(restaurantId, email)).thenReturn(Optional.of(existing));
        when(restaurantRepository.save(any(Restaurant.class))).thenReturn(updated);

        RestaurantResponse response = restaurantService.updateRestaurant(email, restaurantId, request);

        assertNotNull(response);
        assertEquals("Pizza Palace Updated", response.getName());
        assertEquals("Updated Tasty Pizzas", response.getDescription());
    }

    @Test
    void getRestaurantById_success() {
        Long id = 10L;
        User owner = User.builder().id(1L).build();
        Restaurant restaurant = Restaurant.builder().id(id).owner(owner).name("Pizza Palace").build();

        when(restaurantRepository.findById(id)).thenReturn(Optional.of(restaurant));

        RestaurantResponse response = restaurantService.getRestaurantById(id);

        assertNotNull(response);
        assertEquals("Pizza Palace", response.getName());
    }

    @Test
    void getRestaurantById_notFound_throwsException() {
        Long id = 99L;
        when(restaurantRepository.findById(id)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> restaurantService.getRestaurantById(id));
    }

    @Test
    void getActiveRestaurants_returnsList() {
        User owner = User.builder().id(1L).build();
        Restaurant restaurant = Restaurant.builder().id(10L).owner(owner).name("Pizza Palace").isActive(true).build();

        when(restaurantRepository.findByIsActiveTrue()).thenReturn(List.of(restaurant));

        List<RestaurantResponse> list = restaurantService.getActiveRestaurants();

        assertNotNull(list);
        assertEquals(1, list.size());
        assertEquals("Pizza Palace", list.get(0).getName());
    }

    @Test
    void getActiveRestaurantsByCity_returnsList() {
        User owner = User.builder().id(1L).build();
        Restaurant restaurant = Restaurant.builder().id(10L).owner(owner).name("Pizza Palace").city("Mumbai").isActive(true).build();

        when(restaurantRepository.findByCityAndIsActiveTrue("Mumbai")).thenReturn(List.of(restaurant));

        List<RestaurantResponse> list = restaurantService.getActiveRestaurantsByCity("Mumbai");

        assertNotNull(list);
        assertEquals(1, list.size());
        assertEquals("Pizza Palace", list.get(0).getName());
    }
}
