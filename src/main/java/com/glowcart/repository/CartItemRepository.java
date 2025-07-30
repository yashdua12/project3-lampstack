package com.glowcart.repository;

import com.glowcart.entity.CartItem;
import com.glowcart.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem, Long> {
    
    List<CartItem> findByUser(User user);
    
    Optional<CartItem> findByUserAndProductId(User user, Long productId);
    
    void deleteByUserAndProductId(User user, Long productId);
    
    void deleteByUser(User user);
} 