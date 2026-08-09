package com.fooddelivery.address.repository;

import com.fooddelivery.address.model.Address;
import com.fooddelivery.user.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AddressRepository extends JpaRepository<Address, Long> {
    List<Address> findByUserEmail(String email);
    Optional<Address> findByIdAndUserEmail(Long id, String email);
    List<Address> findByUser(User user);
}
