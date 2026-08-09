package com.fooddelivery.user;

import com.fooddelivery.common.exception.ResourceNotFoundException;
import com.fooddelivery.user.dto.UpdateProfileRequest;
import com.fooddelivery.user.dto.UserDto;
import com.fooddelivery.user.model.Role;
import com.fooddelivery.user.model.User;
import com.fooddelivery.user.repository.UserRepository;
import com.fooddelivery.user.service.UserService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private UserService userService;

    @Test
    void getCurrentUser_returnsUserProfile() {
        String email = "fahad@gmail.com";
        User user = User.builder()
                .id(1L)
                .name("Fahad Shaikh")
                .email(email)
                .role(Role.CUSTOMER)
                .isActive(true)
                .build();

        when(userRepository.findByEmail(email)).thenReturn(Optional.of(user));

        UserDto result = userService.getUserByEmail(email);

        assertNotNull(result);
        assertEquals(email, result.getEmail());
        assertEquals("Fahad Shaikh", result.getName());
        assertEquals(Role.CUSTOMER, result.getRole());
        assertTrue(result.isActive());
        verify(userRepository, times(1)).findByEmail(email);
    }

    @Test
    void getCurrentUser_userNotFound_throwsException() {
        String email = "nonexistent@gmail.com";
        when(userRepository.findByEmail(email)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> userService.getUserByEmail(email));
    }

    @Test
    void updateProfile_validData_updatesSuccessfully() {
        String currentEmail = "fahad@gmail.com";
        UpdateProfileRequest request = UpdateProfileRequest.builder()
                .name("Fahad S")
                .email("fahad.new@gmail.com")
                .build();

        User user = User.builder()
                .id(1L)
                .name("Fahad Shaikh")
                .email(currentEmail)
                .role(Role.CUSTOMER)
                .isActive(true)
                .build();

        User updatedUser = User.builder()
                .id(1L)
                .name("Fahad S")
                .email("fahad.new@gmail.com")
                .role(Role.CUSTOMER)
                .isActive(true)
                .build();

        when(userRepository.findByEmail(currentEmail)).thenReturn(Optional.of(user));
        when(userRepository.existsByEmail("fahad.new@gmail.com")).thenReturn(false);
        when(userRepository.save(any(User.class))).thenReturn(updatedUser);

        UserDto result = userService.updateProfile(currentEmail, request);

        assertNotNull(result);
        assertEquals("fahad.new@gmail.com", result.getEmail());
        assertEquals("Fahad S", result.getName());
        verify(userRepository, times(1)).save(any(User.class));
    }
}
