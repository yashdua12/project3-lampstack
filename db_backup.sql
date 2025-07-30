-- GlowCart Database Schema and Sample Data
-- MySQL 8.0+ compatible

-- Create database
CREATE DATABASE IF NOT EXISTS glowcart CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE glowcart;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    stock_quantity INT NOT NULL DEFAULT 0,
    category VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create cart_items table
CREATE TABLE IF NOT EXISTS cart_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_product (user_id, product_id)
);

-- Insert sample users
INSERT INTO users (email, name, password) VALUES
('john.doe@example.com', 'John Doe', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'), -- password: password
('jane.smith@example.com', 'Jane Smith', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'), -- password: password
('admin@glowcart.com', 'Admin User', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'); -- password: password

-- Insert sample products
INSERT INTO products (name, description, price, image_url, stock_quantity, category) VALUES
('Wireless Bluetooth Headphones', 'Premium wireless headphones with noise cancellation and 30-hour battery life. Perfect for music lovers and professionals.', 129.99, '/static/images/headphones.jpg', 50, 'Electronics'),
('Organic Cotton T-Shirt', 'Comfortable 100% organic cotton t-shirt available in multiple colors. Sustainable and stylish.', 24.99, '/static/images/tshirt.jpg', 100, 'Clothing'),
('Smart Fitness Watch', 'Advanced fitness tracking with heart rate monitor, GPS, and 7-day battery life. Track your workouts and health metrics.', 199.99, '/static/images/smartwatch.jpg', 25, 'Electronics'),
('Ceramic Coffee Mug Set', 'Beautiful handcrafted ceramic coffee mugs, set of 4. Microwave and dishwasher safe.', 39.99, '/static/images/mugs.jpg', 75, 'Home & Kitchen'),
('Wireless Charging Pad', 'Fast wireless charging pad compatible with all Qi-enabled devices. Sleek design with LED indicator.', 49.99, '/static/images/charger.jpg', 60, 'Electronics'),
('Yoga Mat Premium', 'Non-slip yoga mat made from eco-friendly materials. Perfect for yoga, pilates, and fitness activities.', 34.99, '/static/images/yogamat.jpg', 40, 'Sports & Fitness'),
('Stainless Steel Water Bottle', 'Insulated stainless steel water bottle keeps drinks cold for 24 hours or hot for 12 hours. 32oz capacity.', 29.99, '/static/images/waterbottle.jpg', 80, 'Sports & Fitness'),
('Bluetooth Speaker Portable', 'Waterproof portable Bluetooth speaker with 360-degree sound. Perfect for outdoor activities and parties.', 79.99, '/static/images/speaker.jpg', 35, 'Electronics'),
('Organic Face Moisturizer', 'Natural face moisturizer with hyaluronic acid and vitamin E. Suitable for all skin types.', 19.99, '/static/images/moisturizer.jpg', 90, 'Beauty & Health'),
('Smart LED Light Bulb', 'WiFi-enabled smart LED bulb with 16 million colors. Control with your smartphone or voice assistant.', 15.99, '/static/images/lightbulb.jpg', 120, 'Home & Kitchen'),
('Leather Wallet Minimalist', 'Genuine leather wallet with RFID protection. Slim design with multiple card slots and coin pocket.', 44.99, '/static/images/wallet.jpg', 55, 'Accessories'),
('Wireless Earbuds Sport', 'Sweat-resistant wireless earbuds with secure fit for sports and workouts. 8-hour battery life.', 89.99, '/static/images/earbuds.jpg', 45, 'Electronics'),
('Bamboo Cutting Board', 'Sustainable bamboo cutting board with juice groove. Perfect for meal prep and serving.', 22.99, '/static/images/cuttingboard.jpg', 70, 'Home & Kitchen'),
('Resistance Bands Set', 'Professional resistance bands set for strength training and rehabilitation. Includes 5 different resistance levels.', 18.99, '/static/images/resistancebands.jpg', 85, 'Sports & Fitness'),
('Aromatherapy Diffuser', 'Ultrasonic essential oil diffuser with LED mood lighting. Perfect for relaxation and stress relief.', 27.99, '/static/images/diffuser.jpg', 65, 'Home & Kitchen');

-- Insert sample cart items (for user ID 1)
INSERT INTO cart_items (user_id, product_id, quantity) VALUES
(1, 1, 1),
(1, 3, 2),
(1, 7, 1);

-- Create indexes for better performance
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_name ON products(name);
CREATE INDEX idx_cart_items_user ON cart_items(user_id);
CREATE INDEX idx_cart_items_product ON cart_items(product_id);

-- Create view for cart summary
CREATE VIEW cart_summary AS
SELECT 
    ci.user_id,
    u.name as user_name,
    p.name as product_name,
    p.price,
    ci.quantity,
    (p.price * ci.quantity) as total_price
FROM cart_items ci
JOIN users u ON ci.user_id = u.id
JOIN products p ON ci.product_id = p.id;

-- Grant permissions (adjust as needed for your environment)
-- CREATE USER 'glowcart_user'@'localhost' IDENTIFIED BY 'glowcart_password';
-- GRANT ALL PRIVILEGES ON glowcart.* TO 'glowcart_user'@'localhost';
-- FLUSH PRIVILEGES; 