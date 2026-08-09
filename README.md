# DashDish - Real-Time Food Delivery Platform Backend

DashDish is a production-ready, high-performance food delivery platform backend built using **Spring Boot 3.3.2**, **Java 21**, **PostgreSQL**, and **Redis**. It provides secure JWT-based authentication, user profile management, address handling, single-restaurant cart constraints, checkout order processing with price snapshotting, and delivery partner assignment tracking.

---

## 🛠️ Tech Stack & Architecture

* **Core Framework**: Java 21 & Spring Boot 3.3.2 (Spring MVC, Spring Data JPA, Spring Security 6.x)
* **Databases**: PostgreSQL (Relational persistence) & Redis (Token blacklisting cache)
* **Security**: Stateless JWT-based authentication & Method-level Role Authorization
* **Build Tool**: Maven
* **Testing**: JUnit 5 & Mockito

---

## ✨ Features Implemented

1. **JWT Auth & Session Revocation**: Hashed password registration (BCrypt), JWT generation with a 24-hour expiration, and secure stateless logout via dynamic TTL blacklisting in Redis.
2. **User Profile & Address Management**: Profile retrieval and updates, address CRUD, and dynamic default address switching.
3. **Restaurant & Menu Management**: Exposes endpoints to add/update restaurants and dishes. Includes validation rules and category queries.
4. **Single-Restaurant Cart Rule**: Enforces that users can only add menu items belonging to the same restaurant to their cart at one time.
5. **Checkout & Price Snapshotting**: Transfers active cart items into placed orders. Snapshots product pricing at checkout to ensure history integrity regardless of future menu edits.
6. **Delivery Partner Assignments**: Places unassigned orders in a delivery queue. Delivery partners can pick up, accept, and update delivery statuses (which syncs back to update order statuses).

---

## 📁 Project Structure

```
src/
├── main/
│   ├── java/com/fooddelivery/
│   │   ├── FoodDeliveryApplication.java
│   │   ├── config/             # SecurityConfig, RedisConfig, ApplicationConfig
│   │   ├── auth/               # Registration, Login, Logout, JWT Filter
│   │   ├── user/               # Users, Profiles, Roles (CUSTOMER, RESTAURANT_OWNER, etc)
│   │   ├── address/            # User Addresses
│   │   ├── restaurant/         # Restaurants & Menu Inventory
│   │   ├── order/              # Carts & Checkout Orders
│   │   ├── delivery/           # Delivery Assignment & Tracking
│   │   └── common/             # Global Exceptions, Standard Response, JWT Utilities
│   └── resources/
│       ├── application.yml
│       └── application-dev.yml
└── test/
    └── java/com/fooddelivery/  # 40 Mockito Unit and Integration Test cases
```

---

## 🚦 Getting Started

### 1. Prerequisites
Make sure you have Docker running locally to spin up the required databases:
```bash
# Start PostgreSQL Database
docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=postgres postgres

# Start Redis Cache
docker run -d -p 6379:6379 redis
```

### 2. Configure Environment Properties
Database and secret properties are predefined in `src/main/resources/application.yml`. If your PostgreSQL or Redis credentials differ, edit the properties accordingly.

### 3. Run the Unit and Integration Tests
```bash
# Windows
.\mvnw clean test

# Unix/macOS
./mvnw clean test
```

### 4. Start the Application Server
```bash
# Windows
.\mvnw spring-boot:run

# Unix/macOS
./mvnw spring-boot:run
```
The server will start on port `8080`.

---

## 📡 API Reference

### Auth Endpoint (`/api/v1/auth/**`)
* `POST /api/v1/auth/register` - Create user.
* `POST /api/v1/auth/login` - Login, returns Bearer token.
* `POST /api/v1/auth/logout` - Logout, revokes token in Redis.

### Users & Address Endpoint (`/api/v1/users/**`)
* `GET /api/v1/users/me` - Profile info.
* `PUT /api/v1/users/me` - Update profile details.
* `GET /api/v1/users/me/addresses` - List addresses.
* `POST /api/v1/users/me/addresses` - Create address.
* `PUT /api/v1/users/me/addresses/{id}` - Edit address.
* `DELETE /api/v1/users/me/addresses/{id}` - Remove address.
* `PUT /api/v1/users/me/addresses/{id}/default` - Set default.

### Restaurants & Menus Endpoint (`/api/v1/restaurants/**`)
* `POST /api/v1/restaurants` - Add restaurant (`RESTAURANT_OWNER` or `ADMIN`).
* `PUT /api/v1/restaurants/{id}` - Update restaurant details (`RESTAURANT_OWNER` or `ADMIN`).
* `GET /api/v1/restaurants` - List active restaurants.
* `GET /api/v1/restaurants/{id}` - Get details.
* `GET /api/v1/restaurants/city/{city}` - Get restaurants in a city.
* `POST /api/v1/restaurants/{id}/menu` - Add menu item (`RESTAURANT_OWNER` or `ADMIN`).
* `PUT /api/v1/restaurants/{id}/menu/{itemId}` - Edit item (`RESTAURANT_OWNER` or `ADMIN`).
* `DELETE /api/v1/restaurants/{id}/menu/{itemId}` - Delete item (`RESTAURANT_OWNER` or `ADMIN`).
* `GET /api/v1/restaurants/{id}/menu` - View active menu.

### Cart & Orders Endpoint (`/api/v1/cart/**` & `/api/v1/orders/**`)
* `GET /api/v1/cart` - View cart.
* `POST /api/v1/cart/items` - Add/Update item quantity (restricts to single restaurant).
* `DELETE /api/v1/cart/items/{itemId}` - Delete cart item.
* `DELETE /api/v1/cart` - Clear cart.
* `POST /api/v1/orders` - Checkout cart & place order.
* `GET /api/v1/orders` - Get customer orders.
* `GET /api/v1/orders/owner` - Get orders placed to the owner's restaurants.
* `GET /api/v1/orders/{id}` - Get order details.
* `PUT /api/v1/orders/{id}/status` - Update order status.

### Delivery Endpoint (`/api/v1/deliveries/**`)
* `GET /api/v1/deliveries/available` - Get unassigned orders (`DELIVERY_PARTNER` or `ADMIN`).
* `PUT /api/v1/deliveries/{id}/accept` - Accept delivery offer (`DELIVERY_PARTNER` or `ADMIN`).
* `PUT /api/v1/deliveries/{id}/status` - Update delivery status (Syncs tracking with the parent `Order`).
* `GET /api/v1/deliveries` - View delivery assignments.
