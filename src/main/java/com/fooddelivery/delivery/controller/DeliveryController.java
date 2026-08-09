package com.fooddelivery.delivery.controller;

import com.fooddelivery.common.response.ApiResponse;
import com.fooddelivery.delivery.dto.DeliveryAssignmentResponse;
import com.fooddelivery.delivery.model.DeliveryStatus;
import com.fooddelivery.delivery.service.DeliveryService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/deliveries")
public class DeliveryController {

    private final DeliveryService deliveryService;

    public DeliveryController(DeliveryService deliveryService) {
        this.deliveryService = deliveryService;
    }

    @GetMapping("/available")
    @PreAuthorize("hasAnyRole('DELIVERY_PARTNER', 'ADMIN')")
    public ResponseEntity<ApiResponse<List<DeliveryAssignmentResponse>>> getAvailableDeliveries() {
        List<DeliveryAssignmentResponse> responses = deliveryService.getAvailableDeliveries();
        return ResponseEntity.ok(ApiResponse.success("Available deliveries retrieved successfully", responses));
    }

    @PutMapping("/{id}/accept")
    @PreAuthorize("hasAnyRole('DELIVERY_PARTNER', 'ADMIN')")
    public ResponseEntity<ApiResponse<DeliveryAssignmentResponse>> acceptDelivery(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id
    ) {
        DeliveryAssignmentResponse response = deliveryService.acceptDelivery(userDetails.getUsername(), id);
        return ResponseEntity.ok(ApiResponse.success("Delivery assignment accepted successfully", response));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('DELIVERY_PARTNER', 'ADMIN')")
    public ResponseEntity<ApiResponse<DeliveryAssignmentResponse>> updateDeliveryStatus(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id,
            @RequestParam DeliveryStatus status
    ) {
        DeliveryAssignmentResponse response = deliveryService.updateDeliveryStatus(userDetails.getUsername(), id, status);
        return ResponseEntity.ok(ApiResponse.success("Delivery status updated successfully", response));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('DELIVERY_PARTNER', 'ADMIN')")
    public ResponseEntity<ApiResponse<List<DeliveryAssignmentResponse>>> getPartnerDeliveries(
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        List<DeliveryAssignmentResponse> responses = deliveryService.getPartnerDeliveries(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Delivery history retrieved successfully", responses));
    }
}
