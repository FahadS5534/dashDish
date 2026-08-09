package com.fooddelivery.address.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AddressResponse {
    private Long id;
    private Long userId;
    private String label;
    private String street;
    private String city;
    private String pincode;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private boolean isDefault;
    private LocalDateTime createdAt;
}
