package com.glowcart.repository;

import com.glowcart.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    
    List<Product> findByCategory(String category);
    
    List<Product> findByNameContainingIgnoreCase(String name);
    
    List<Product> findByPriceBetween(java.math.BigDecimal minPrice, java.math.BigDecimal maxPrice);
} 