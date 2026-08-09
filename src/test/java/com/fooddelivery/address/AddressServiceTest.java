package com.fooddelivery.address;

import com.fooddelivery.address.dto.AddressRequest;
import com.fooddelivery.address.dto.AddressResponse;
import com.fooddelivery.address.model.Address;
import com.fooddelivery.address.repository.AddressRepository;
import com.fooddelivery.address.service.AddressService;
import com.fooddelivery.user.model.Role;
import com.fooddelivery.user.model.User;
import com.fooddelivery.user.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AddressServiceTest {

    @Mock
    private AddressRepository addressRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private AddressService addressService;

    @Test
    void addAddress_success() {
        String email = "fahad@gmail.com";
        AddressRequest request = AddressRequest.builder()
                .label("Home")
                .street("123 Main St")
                .city("Mumbai")
                .pincode("400001")
                .latitude(BigDecimal.valueOf(19.076))
                .longitude(BigDecimal.valueOf(72.8777))
                .isDefault(true)
                .build();

        User user = User.builder()
                .id(1L)
                .email(email)
                .name("Fahad")
                .role(Role.CUSTOMER)
                .build();

        Address address = Address.builder()
                .id(10L)
                .user(user)
                .label("Home")
                .street("123 Main St")
                .city("Mumbai")
                .pincode("400001")
                .latitude(BigDecimal.valueOf(19.076))
                .longitude(BigDecimal.valueOf(72.8777))
                .isDefault(true)
                .build();

        when(userRepository.findByEmail(email)).thenReturn(Optional.of(user));
        when(addressRepository.findByUser(user)).thenReturn(new ArrayList<>());
        when(addressRepository.save(any(Address.class))).thenReturn(address);

        AddressResponse response = addressService.addAddress(email, request);

        assertNotNull(response);
        assertEquals(10L, response.getId());
        assertEquals("Home", response.getLabel());
        assertTrue(response.isDefault());
        verify(addressRepository, times(1)).save(any(Address.class));
    }

    @Test
    void getAddresses_returnsList() {
        String email = "fahad@gmail.com";
        User user = User.builder().id(1L).email(email).build();
        Address address = Address.builder().id(10L).user(user).label("Home").build();

        when(addressRepository.findByUserEmail(email)).thenReturn(List.of(address));

        List<AddressResponse> result = addressService.getAddresses(email);

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(10L, result.get(0).getId());
    }

    @Test
    void updateAddress_success() {
        String email = "fahad@gmail.com";
        Long addressId = 10L;
        AddressRequest request = AddressRequest.builder()
                .label("Office")
                .street("456 Corporate Rd")
                .city("Mumbai")
                .pincode("400002")
                .isDefault(false)
                .build();

        User user = User.builder().id(1L).email(email).build();
        Address existingAddress = Address.builder()
                .id(addressId)
                .user(user)
                .label("Home")
                .street("123 Main St")
                .city("Mumbai")
                .pincode("400001")
                .isDefault(true)
                .build();

        Address updatedAddress = Address.builder()
                .id(addressId)
                .user(user)
                .label("Office")
                .street("456 Corporate Rd")
                .city("Mumbai")
                .pincode("400002")
                .isDefault(false)
                .build();

        when(addressRepository.findByIdAndUserEmail(addressId, email)).thenReturn(Optional.of(existingAddress));
        when(addressRepository.save(any(Address.class))).thenReturn(updatedAddress);

        AddressResponse response = addressService.updateAddress(email, addressId, request);

        assertNotNull(response);
        assertEquals("Office", response.getLabel());
        assertFalse(response.isDefault());
    }

    @Test
    void deleteAddress_success() {
        String email = "fahad@gmail.com";
        Long addressId = 10L;
        Address address = Address.builder().id(addressId).build();

        when(addressRepository.findByIdAndUserEmail(addressId, email)).thenReturn(Optional.of(address));
        doNothing().when(addressRepository).delete(address);

        assertDoesNotThrow(() -> addressService.deleteAddress(email, addressId));
        verify(addressRepository, times(1)).delete(address);
    }

    @Test
    void setDefaultAddress_success() {
        String email = "fahad@gmail.com";
        Long addressId = 10L;

        User user = User.builder().id(1L).email(email).build();
        Address address = Address.builder().id(addressId).user(user).isDefault(false).build();

        when(userRepository.findByEmail(email)).thenReturn(Optional.of(user));
        when(addressRepository.findByIdAndUserEmail(addressId, email)).thenReturn(Optional.of(address));
        when(addressRepository.findByUser(user)).thenReturn(List.of(address));
        when(addressRepository.save(any(Address.class))).thenReturn(address);

        AddressResponse response = addressService.setDefaultAddress(email, addressId);

        assertNotNull(response);
        assertTrue(address.isDefault());
    }
}
