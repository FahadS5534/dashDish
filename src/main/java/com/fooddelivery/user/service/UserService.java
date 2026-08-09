package com.fooddelivery.user.service;

import com.fooddelivery.common.exception.DuplicateEmailException;
import com.fooddelivery.common.exception.ResourceNotFoundException;
import com.fooddelivery.user.dto.UpdateProfileRequest;
import com.fooddelivery.user.dto.UserDto;
import com.fooddelivery.user.model.User;
import com.fooddelivery.user.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Slf4j
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public UserDto getUserByEmail(String email) {
        log.info("Fetching user profile for email: {}", email);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));

        return mapToDto(user);
    }

    @Transactional
    public UserDto updateProfile(String currentEmail, UpdateProfileRequest request) {
        log.info("Updating user profile for email: {}", currentEmail);

        User user = userRepository.findByEmail(currentEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + currentEmail));

        // If email is changing, check if the new email is already in use
        if (!user.getEmail().equalsIgnoreCase(request.getEmail())) {
            if (userRepository.existsByEmail(request.getEmail())) {
                throw new DuplicateEmailException("Email already exists");
            }
            user.setEmail(request.getEmail());
        }

        user.setName(request.getName());
        User updatedUser = userRepository.save(user);
        log.info("User profile updated successfully for email: {}", updatedUser.getEmail());

        return mapToDto(updatedUser);
    }

    private UserDto mapToDto(User user) {
        return UserDto.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .isActive(user.isActive())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }
}
