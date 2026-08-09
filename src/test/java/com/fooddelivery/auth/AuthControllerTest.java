package com.fooddelivery.auth;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fooddelivery.auth.controller.AuthController;
import com.fooddelivery.auth.dto.AuthResponse;
import com.fooddelivery.auth.dto.LoginRequest;
import com.fooddelivery.auth.dto.RegisterRequest;
import com.fooddelivery.auth.service.AuthService;
import com.fooddelivery.common.util.JwtUtil;
import com.fooddelivery.security.UserDetailsServiceImpl;
import com.fooddelivery.user.dto.UserDto;
import com.fooddelivery.user.model.Role;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AuthController.class)
@AutoConfigureMockMvc(addFilters = false)
public class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private AuthService authService;

    @MockBean
    private JwtUtil jwtUtil;

    @MockBean
    private UserDetailsServiceImpl userDetailsService;

    @MockBean
    private RedisTemplate<String, String> redisTemplate;

    @MockBean
    private AuthenticationProvider authenticationProvider;

    @Test
    void register_validRequest_returns201() throws Exception {
        RegisterRequest request = RegisterRequest.builder()
                .name("Fahad Shaikh")
                .email("fahad@gmail.com")
                .password("password123")
                .role(Role.CUSTOMER)
                .build();

        UserDto userDto = UserDto.builder()
                .id(1L)
                .name("Fahad Shaikh")
                .email("fahad@gmail.com")
                .role(Role.CUSTOMER)
                .isActive(true)
                .build();

        when(authService.registerUser(any(RegisterRequest.class))).thenReturn(userDto);

        mockMvc.perform(post("/api/v1/auth/register")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("User registered successfully"))
                .andExpect(jsonPath("$.data.email").value("fahad@gmail.com"))
                .andExpect(jsonPath("$.data.name").value("Fahad Shaikh"));
    }

    @Test
    void register_missingFields_returns400() throws Exception {
        RegisterRequest request = RegisterRequest.builder()
                .name("") // blank name
                .email("invalid-email") // invalid email
                .password("short") // too short password
                .role(null) // null role
                .build();

        mockMvc.perform(post("/api/v1/auth/register")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    void login_validCredentials_returns200WithToken() throws Exception {
        LoginRequest request = LoginRequest.builder()
                .email("fahad@gmail.com")
                .password("password123")
                .build();

        AuthResponse authResponse = AuthResponse.builder()
                .token("mocked_token")
                .email("fahad@gmail.com")
                .role("CUSTOMER")
                .build();

        when(authService.loginUser(any(LoginRequest.class))).thenReturn(authResponse);

        mockMvc.perform(post("/api/v1/auth/login")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.token").value("mocked_token"))
                .andExpect(jsonPath("$.data.email").value("fahad@gmail.com"));
    }

    @Test
    void login_invalidCredentials_returns401() throws Exception {
        LoginRequest request = LoginRequest.builder()
                .email("fahad@gmail.com")
                .password("wrongpassword")
                .build();

        when(authService.loginUser(any(LoginRequest.class))).thenThrow(new BadCredentialsException("Invalid password"));

        mockMvc.perform(post("/api/v1/auth/login")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Invalid password"));
    }
}
