package com.fooddelivery.user.controller;

import com.fooddelivery.common.response.ApiResponse;
import com.fooddelivery.user.dto.UpdateProfileRequest;
import com.fooddelivery.user.dto.UserDto;
import com.fooddelivery.user.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserDto>> getCurrentUser(@AuthenticationPrincipal UserDetails userDetails) {
        UserDto userDto = userService.getUserByEmail(userDetails.getUsername());
        ApiResponse<UserDto> response = ApiResponse.success("User profile retrieved successfully", userDto);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/me")
    public ResponseEntity<ApiResponse<UserDto>> updateProfile(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody UpdateProfileRequest request
    ) {
        UserDto userDto = userService.updateProfile(userDetails.getUsername(), request);
        ApiResponse<UserDto> response = ApiResponse.success("Profile updated successfully", userDto);
        return ResponseEntity.ok(response);
    }
}
