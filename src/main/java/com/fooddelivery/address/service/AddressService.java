package com.fooddelivery.address.service;

import com.fooddelivery.address.dto.AddressRequest;
import com.fooddelivery.address.dto.AddressResponse;
import com.fooddelivery.address.model.Address;
import com.fooddelivery.address.repository.AddressRepository;
import com.fooddelivery.common.exception.ResourceNotFoundException;
import com.fooddelivery.user.model.User;
import com.fooddelivery.user.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Slf4j
public class AddressService {

    private final AddressRepository addressRepository;
    private final UserRepository userRepository;

    public AddressService(AddressRepository addressRepository, UserRepository userRepository) {
        this.addressRepository = addressRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public AddressResponse addAddress(String email, AddressRequest request) {
        log.info("Adding address for user email: {}", email);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));

        boolean isDefault = Boolean.TRUE.equals(request.getIsDefault());
        if (isDefault) {
            unsetDefaults(user);
        }

        Address address = Address.builder()
                .user(user)
                .label(request.getLabel())
                .street(request.getStreet())
                .city(request.getCity())
                .pincode(request.getPincode())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .isDefault(isDefault)
                .build();

        Address savedAddress = addressRepository.save(address);
        log.info("Address added successfully with ID: {}", savedAddress.getId());
        return mapToResponse(savedAddress);
    }

    public List<AddressResponse> getAddresses(String email) {
        log.info("Retrieving all addresses for user email: {}", email);
        List<Address> addresses = addressRepository.findByUserEmail(email);
        return addresses.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public AddressResponse updateAddress(String email, Long addressId, AddressRequest request) {
        log.info("Updating address ID: {} for user: {}", addressId, email);
        Address address = addressRepository.findByIdAndUserEmail(addressId, email)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found with ID: " + addressId + " for user: " + email));

        boolean isDefault = Boolean.TRUE.equals(request.getIsDefault());
        if (isDefault && !address.isDefault()) {
            unsetDefaults(address.getUser());
        }

        address.setLabel(request.getLabel());
        address.setStreet(request.getStreet());
        address.setCity(request.getCity());
        address.setPincode(request.getPincode());
        address.setLatitude(request.getLatitude());
        address.setLongitude(request.getLongitude());
        address.setDefault(isDefault);

        Address updatedAddress = addressRepository.save(address);
        log.info("Address ID: {} updated successfully", addressId);
        return mapToResponse(updatedAddress);
    }

    @Transactional
    public void deleteAddress(String email, Long addressId) {
        log.info("Deleting address ID: {} for user: {}", addressId, email);
        Address address = addressRepository.findByIdAndUserEmail(addressId, email)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found with ID: " + addressId + " for user: " + email));

        addressRepository.delete(address);
        log.info("Address ID: {} deleted successfully", addressId);
    }

    @Transactional
    public AddressResponse setDefaultAddress(String email, Long addressId) {
        log.info("Setting address ID: {} as default for user: {}", addressId, email);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));

        Address address = addressRepository.findByIdAndUserEmail(addressId, email)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found with ID: " + addressId + " for user: " + email));

        unsetDefaults(user);
        address.setDefault(true);
        Address updatedAddress = addressRepository.save(address);
        log.info("Address ID: {} set as default successfully", addressId);
        return mapToResponse(updatedAddress);
    }

    private void unsetDefaults(User user) {
        List<Address> addresses = addressRepository.findByUser(user);
        for (Address addr : addresses) {
            if (addr.isDefault()) {
                addr.setDefault(false);
            }
        }
        addressRepository.saveAll(addresses);
    }

    private AddressResponse mapToResponse(Address address) {
        return AddressResponse.builder()
                .id(address.getId())
                .userId(address.getUser().getId())
                .label(address.getLabel())
                .street(address.getStreet())
                .city(address.getCity())
                .pincode(address.getPincode())
                .latitude(address.getLatitude())
                .longitude(address.getLongitude())
                .isDefault(address.isDefault())
                .createdAt(address.getCreatedAt())
                .build();
    }
}
