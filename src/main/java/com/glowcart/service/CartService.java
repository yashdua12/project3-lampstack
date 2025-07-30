package com.glowcart.service;

import com.glowcart.entity.CartItem;
import com.glowcart.entity.Product;
import com.glowcart.entity.User;
import com.glowcart.repository.CartItemRepository;
import com.glowcart.repository.ProductRepository;
import com.glowcart.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Service
public class CartService {
    
    @Autowired
    private CartItemRepository cartItemRepository;
    
    @Autowired
    private ProductRepository productRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    public List<CartItem> getCartItems(Long userId) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            throw new RuntimeException("User not found");
        }
        return cartItemRepository.findByUser(user);
    }
    
    public CartItem addToCart(Long userId, Long productId, Integer quantity) {
        User user = userRepository.findById(userId).orElse(null);
        Product product = productRepository.findById(productId).orElse(null);
        
        if (user == null) {
            throw new RuntimeException("User not found");
        }
        if (product == null) {
            throw new RuntimeException("Product not found");
        }
        if (product.getStockQuantity() < quantity) {
            throw new RuntimeException("Insufficient stock");
        }
        
        // Check if item already exists in cart
        Optional<CartItem> existingItem = cartItemRepository.findByUserAndProductId(user, productId);
        
        if (existingItem.isPresent()) {
            CartItem item = existingItem.get();
            item.setQuantity(item.getQuantity() + quantity);
            return cartItemRepository.save(item);
        } else {
            CartItem newItem = new CartItem(user, product, quantity);
            return cartItemRepository.save(newItem);
        }
    }
    
    public void removeFromCart(Long userId, Long productId) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            throw new RuntimeException("User not found");
        }
        cartItemRepository.deleteByUserAndProductId(user, productId);
    }
    
    public void updateCartItemQuantity(Long userId, Long productId, Integer quantity) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            throw new RuntimeException("User not found");
        }
        
        Optional<CartItem> cartItem = cartItemRepository.findByUserAndProductId(user, productId);
        if (cartItem.isPresent()) {
            CartItem item = cartItem.get();
            if (quantity <= 0) {
                cartItemRepository.delete(item);
            } else {
                item.setQuantity(quantity);
                cartItemRepository.save(item);
            }
        }
    }
    
    public void clearCart(Long userId) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            throw new RuntimeException("User not found");
        }
        cartItemRepository.deleteByUser(user);
    }
    
    public BigDecimal getCartTotal(Long userId) {
        List<CartItem> cartItems = getCartItems(userId);
        return cartItems.stream()
                .map(CartItem::getTotalPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
} 