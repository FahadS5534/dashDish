package com.fooddelivery.config;

import com.fooddelivery.address.model.Address;
import com.fooddelivery.address.repository.AddressRepository;
import com.fooddelivery.restaurant.model.MenuItem;
import com.fooddelivery.restaurant.model.Restaurant;
import com.fooddelivery.restaurant.repository.MenuItemRepository;
import com.fooddelivery.restaurant.repository.RestaurantRepository;
import com.fooddelivery.user.model.Role;
import com.fooddelivery.user.model.User;
import com.fooddelivery.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final AddressRepository addressRepository;
    private final RestaurantRepository restaurantRepository;
    private final MenuItemRepository menuItemRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        try {
            initUsersAndData();
        } catch (Exception e) {
            log.warn("Database initialization skipped or encountered non-critical notice: {}", e.getMessage());
        }
    }

    private void initUsersAndData() {
        // 1. Seed Customer: Elena Rostova
        User elena = userRepository.findByEmail("elena.rostova@epicurean.com").orElseGet(() -> {
            User user = User.builder()
                    .name("Elena Rostova")
                    .email("elena.rostova@epicurean.com")
                    .password(passwordEncoder.encode("password123"))
                    .role(Role.CUSTOMER)
                    .isActive(true)
                    .build();
            user = userRepository.save(user);
            log.info("Seeded default customer: elena.rostova@epicurean.com (password123)");

            // Add default addresses for Elena
            Address home = Address.builder()
                    .user(user)
                    .label("Home")
                    .street("742 Evergreen Terrace, Apt 14B")
                    .city("Portland")
                    .pincode("97201")
                    .latitude(new BigDecimal("45.5152"))
                    .longitude(new BigDecimal("-122.6784"))
                    .isDefault(true)
                    .build();

            Address work = Address.builder()
                    .user(user)
                    .label("Work")
                    .street("100 SW Market St, Suite 400")
                    .city("Portland")
                    .pincode("97201")
                    .latitude(new BigDecimal("45.5160"))
                    .longitude(new BigDecimal("-122.6790"))
                    .isDefault(false)
                    .build();

            addressRepository.saveAll(List.of(home, work));
            return user;
        });

        // 2. Seed Restaurant Owner: Chef Carlo Moretti
        User carlo = userRepository.findByEmail("carlo@osteriadelsole.it").orElseGet(() -> {
            User user = User.builder()
                    .name("Chef Carlo Moretti")
                    .email("carlo@osteriadelsole.it")
                    .password(passwordEncoder.encode("password123"))
                    .role(Role.RESTAURANT_OWNER)
                    .isActive(true)
                    .build();
            user = userRepository.save(user);
            log.info("Seeded default owner: carlo@osteriadelsole.it (password123)");
            return user;
        });

        // 3. Seed Admin: DashDish Admin
        if (userRepository.findByEmail("admin@dashdish.com").isEmpty()) {
            User admin = User.builder()
                    .name("DashDish Admin")
                    .email("admin@dashdish.com")
                    .password(passwordEncoder.encode("password123"))
                    .role(Role.ADMIN)
                    .isActive(true)
                    .build();
            userRepository.save(admin);
            log.info("Seeded default admin: admin@dashdish.com (password123)");
        }

        // 4. Seed Restaurant: Osteria Del Sole if not exists
        if (restaurantRepository.count() == 0) {
            Restaurant osteria = Restaurant.builder()
                    .name("Osteria Del Sole")
                    .owner(carlo)
                    .description("Michelin 3-Star Contemporary Tuscan & Wood-Fired Hearth")
                    .address("42 Mercer St, Soho")
                    .city("New York")
                    .latitude(new BigDecimal("40.7223"))
                    .longitude(new BigDecimal("-74.0001"))
                    .isActive(true)
                    .build();
            osteria = restaurantRepository.save(osteria);
            log.info("Seeded restaurant: Osteria Del Sole");

            // Seed Menu Items
            MenuItem dish1 = MenuItem.builder()
                    .restaurant(osteria)
                    .name("Tagliolini al Tartufo Bianco")
                    .description("Handmade 36-yolk egg ribbon pasta, mountain butter emulsion, freshly shaved Alba white truffle.")
                    .price(new BigDecimal("46.00"))
                    .category("Primi Piatti")
                    .isVeg(true)
                    .isAvailable(true)
                    .build();

            MenuItem dish2 = MenuItem.builder()
                    .restaurant(osteria)
                    .name("Wood-Fired Bistecca Fiorentina")
                    .description("Dry-aged 45-day Chianina beef, rosemary sea salt, charred lemon, cold-pressed Tuscan olive oil.")
                    .price(new BigDecimal("78.00"))
                    .category("Secondi")
                    .isVeg(false)
                    .isAvailable(true)
                    .build();

            MenuItem dish3 = MenuItem.builder()
                    .restaurant(osteria)
                    .name("Burrata Campana con Pesche")
                    .description("Heirloom tomatoes, scorched white peaches, 25-year aged balsamic di Modena, wild arugula.")
                    .price(new BigDecimal("24.00"))
                    .category("Antipasti")
                    .isVeg(true)
                    .isAvailable(true)
                    .build();

            MenuItem dish4 = MenuItem.builder()
                    .restaurant(osteria)
                    .name("Tiramisù Tradizionale al Mascarpone")
                    .description("Single-origin espresso ladyfingers, velvety whipped mascarpone, Valrhona 70% cocoa dusting.")
                    .price(new BigDecimal("18.00"))
                    .category("Dolci")
                    .isVeg(true)
                    .isAvailable(true)
                    .build();

            menuItemRepository.saveAll(List.of(dish1, dish2, dish3, dish4));
            log.info("Seeded menu items for Osteria Del Sole");
        }
    }
}
