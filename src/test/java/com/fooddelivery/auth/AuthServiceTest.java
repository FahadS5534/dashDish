package com.fooddelivery.auth;

import com.fooddelivery.auth.dto.AuthResponse;
import com.fooddelivery.auth.dto.LoginRequest;
import com.fooddelivery.auth.dto.RegisterRequest;
import com.fooddelivery.auth.service.AuthService;
import com.fooddelivery.common.exception.DuplicateEmailException;
import com.fooddelivery.common.exception.ResourceNotFoundException;
import com.fooddelivery.common.util.JwtUtil;
import com.fooddelivery.security.UserDetailsServiceImpl;
import com.fooddelivery.user.dto.UserDto;
import com.fooddelivery.user.model.Role;
import com.fooddelivery.user.model.User;
import com.fooddelivery.user.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ValueOperations;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;
import java.util.concurrent.TimeUnit;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtUtil jwtUtil;

    @Mock
    private UserDetailsServiceImpl userDetailsService;

    @Mock
    private RedisTemplate<String, String> redisTemplate;

    @Mock
    private ValueOperations<String, String> valueOperations;

    @InjectMocks
    private AuthService authService;

    @Test
    void registerUser_success() {
        RegisterRequest request = RegisterRequest.builder()
                .name("Fahad Shaikh")
                .email("fahad@gmail.com")
                .password("password123")
                .role(Role.CUSTOMER)
                .build();

        User savedUser = User.builder()
                .id(1L)
                .name("Fahad Shaikh")
                .email("fahad@gmail.com")
                .password("hashed_password")
                .role(Role.CUSTOMER)
                .isActive(true)
                .build();

        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("hashed_password");
        when(userRepository.save(any(User.class))).thenReturn(savedUser);

        UserDto result = authService.registerUser(request);

        assertNotNull(result);
        assertEquals("fahad@gmail.com", result.getEmail());
        assertEquals("Fahad Shaikh", result.getName());
        assertEquals(Role.CUSTOMER, result.getRole());
        assertTrue(result.isActive());
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    void registerUser_duplicateEmail_throwsException() {
        RegisterRequest request = RegisterRequest.builder()
                .name("Fahad Shaikh")
                .email("fahad@gmail.com")
                .password("password123")
                .role(Role.CUSTOMER)
                .build();

        when(userRepository.existsByEmail("fahad@gmail.com")).thenReturn(true);

        assertThrows(DuplicateEmailException.class, () -> authService.registerUser(request));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void loginUser_validCredentials_returnsToken() {
        LoginRequest request = LoginRequest.builder()
                .email("fahad@gmail.com")
                .password("password123")
                .build();

        User user = User.builder()
                .id(1L)
                .name("Fahad Shaikh")
                .email("fahad@gmail.com")
                .password("hashed_password")
                .role(Role.CUSTOMER)
                .isActive(true)
                .build();

        UserDetails userDetails = org.springframework.security.core.userdetails.User.builder()
                .username("fahad@gmail.com")
                .password("hashed_password")
                .authorities("ROLE_CUSTOMER")
                .build();

        when(userRepository.findByEmail("fahad@gmail.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("password123", "hashed_password")).thenReturn(true);
        when(userDetailsService.loadUserByUsername("fahad@gmail.com")).thenReturn(userDetails);
        when(jwtUtil.generateToken(userDetails)).thenReturn("mocked_jwt_token");

        AuthResponse result = authService.loginUser(request);

        assertNotNull(result);
        assertEquals("mocked_jwt_token", result.getToken());
        assertEquals("fahad@gmail.com", result.getEmail());
        assertEquals("CUSTOMER", result.getRole());
    }

    @Test
    void loginUser_invalidPassword_throwsException() {
        LoginRequest request = LoginRequest.builder()
                .email("fahad@gmail.com")
                .password("wrongpassword")
                .build();

        User user = User.builder()
                .id(1L)
                .name("Fahad Shaikh")
                .email("fahad@gmail.com")
                .password("hashed_password")
                .role(Role.CUSTOMER)
                .isActive(true)
                .build();

        when(userRepository.findByEmail("fahad@gmail.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrongpassword", "hashed_password")).thenReturn(false);

        assertThrows(BadCredentialsException.class, () -> authService.loginUser(request));
    }

    @Test
    void loginUser_userNotFound_throwsException() {
        LoginRequest request = LoginRequest.builder()
                .email("nonexistent@gmail.com")
                .password("password123")
                .build();

        when(userRepository.findByEmail("nonexistent@gmail.com")).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> authService.loginUser(request));
    }

    @Test
    void logout_addsTokenToRedisBlacklist() {
        String authHeader = "Bearer some_jwt_token";
        when(jwtUtil.getExpirationTimeInMillis("some_jwt_token")).thenReturn(5000L);
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);

        authService.logout(authHeader);

        verify(valueOperations, times(1)).set(
                eq("blacklisted_token:some_jwt_token"),
                eq("true"),
                eq(5000L),
                eq(TimeUnit.MILLISECONDS)
        );
    }
}
