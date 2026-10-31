package com.fooddelivery.common.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.Map;

@RestController
public class RootController {

    @GetMapping("/")
    public ResponseEntity<Map<String, Object>> root() {
        return ResponseEntity.ok(Map.of(
            "app", "DashDish Food Delivery Platform API",
            "status", "UP",
            "version", "1.0.0",
            "timestamp", Instant.now().toString(),
            "endpoints", Map.of(
                "health", "/actuator/health",
                "restaurants", "/api/v1/restaurants",
                "authLogin", "/api/v1/auth/login",
                "authRegister", "/api/v1/auth/register"
            )
        ));
    }
}

