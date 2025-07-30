// GlowCart E-commerce JavaScript
class GlowCart {
    constructor() {
        this.cart = [];
        this.currentUser = 1; // Default user ID for demo
        this.products = [];
        this.currentProduct = null;
        this.init();
    }

    async init() {
        await this.loadProducts();
        await this.loadCart();
        this.setupEventListeners();
        this.renderProducts();
        this.updateCartCount();
    }

    setupEventListeners() {
        // Close modals when clicking outside
        window.onclick = (event) => {
            const cartModal = document.getElementById('cartModal');
            const productModal = document.getElementById('productModal');
            
            if (event.target === cartModal) {
                this.closeCart();
            }
            if (event.target === productModal) {
                this.closeProductModal();
            }
        };

        // Close modals with Escape key
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                this.closeCart();
                this.closeProductModal();
            }
        });
    }

    async loadProducts() {
        try {
            const response = await fetch('/api/products');
            if (response.ok) {
                this.products = await response.json();
            } else {
                console.error('Failed to load products');
                this.products = this.getDefaultProducts();
            }
        } catch (error) {
            console.error('Error loading products:', error);
            this.products = this.getDefaultProducts();
        }
    }

    async loadCart() {
        try {
            const response = await fetch(`/api/cart/${this.currentUser}`);
            if (response.ok) {
                const cartItems = await response.json();
                this.cart = cartItems.map(item => ({
                    id: item.id,
                    productId: item.product.id,
                    name: item.product.name,
                    price: item.product.price,
                    imageUrl: item.product.imageUrl,
                    quantity: item.quantity
                }));
            }
        } catch (error) {
            console.error('Error loading cart:', error);
        }
    }

    renderProducts() {
        const productsGrid = document.getElementById('productsGrid');
        if (!productsGrid) return;

        productsGrid.innerHTML = this.products.map(product => `
            <div class="product-card" onclick="glowCart.showProductDetail(${product.id})">
                <div class="product-image">
                    <img src="${product.imageUrl}" alt="${product.name}" onerror="this.style.display='none'">
                    <div class="product-image-placeholder">
                        <i class="fas fa-image"></i>
                    </div>
                </div>
                <div class="product-info">
                    <h3 class="product-name">${product.name}</h3>
                    <p class="product-description">${product.description}</p>
                    <div class="product-price">$${product.price}</div>
                    <button class="add-to-cart-btn" onclick="event.stopPropagation(); glowCart.addToCart(${product.id}, 1)">
                        <i class="fas fa-cart-plus"></i> Add to Cart
                    </button>
                </div>
            </div>
        `).join('');
    }

    showProductDetail(productId) {
        const product = this.products.find(p => p.id === productId);
        if (!product) return;

        this.currentProduct = product;
        
        document.getElementById('productModalTitle').textContent = product.name;
        document.getElementById('productModalImage').src = product.imageUrl;
        document.getElementById('productModalName').textContent = product.name;
        document.getElementById('productModalDescription').textContent = product.description;
        document.getElementById('productModalPrice').textContent = product.price;
        document.getElementById('productQuantity').value = 1;

        document.getElementById('productModal').style.display = 'block';
    }

    closeProductModal() {
        document.getElementById('productModal').style.display = 'none';
        this.currentProduct = null;
    }

    openCart() {
        this.renderCart();
        document.getElementById('cartModal').style.display = 'block';
    }

    closeCart() {
        document.getElementById('cartModal').style.display = 'none';
    }

    renderCart() {
        const cartItems = document.getElementById('cartItems');
        const cartTotal = document.getElementById('cartTotal');
        
        if (this.cart.length === 0) {
            cartItems.innerHTML = '<p style="text-align: center; color: #6b7280;">Your cart is empty</p>';
            cartTotal.textContent = '0.00';
            return;
        }

        cartItems.innerHTML = this.cart.map(item => `
            <div class="cart-item">
                <div class="cart-item-image">
                    <img src="${item.imageUrl}" alt="${item.name}" onerror="this.style.display='none'">
                    <i class="fas fa-image"></i>
                </div>
                <div class="cart-item-info">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-price">$${item.price}</div>
                    <div class="cart-item-quantity">
                        <button class="quantity-btn" onclick="glowCart.updateQuantity(${item.productId}, ${item.quantity - 1})">-</button>
                        <span>${item.quantity}</span>
                        <button class="quantity-btn" onclick="glowCart.updateQuantity(${item.productId}, ${item.quantity + 1})">+</button>
                    </div>
                </div>
                <button class="cart-item-remove" onclick="glowCart.removeFromCart(${item.productId})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `).join('');

        const total = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        cartTotal.textContent = total.toFixed(2);
    }

    async addToCart(productId, quantity = 1) {
        try {
            const response = await fetch('/api/cart/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: `userId=${this.currentUser}&productId=${productId}&quantity=${quantity}`
            });

            if (response.ok) {
                await this.loadCart();
                this.updateCartCount();
                this.showNotification('Product added to cart!', 'success');
            } else {
                this.showNotification('Failed to add product to cart', 'error');
            }
        } catch (error) {
            console.error('Error adding to cart:', error);
            this.showNotification('Error adding to cart', 'error');
        }
    }

    async removeFromCart(productId) {
        try {
            const response = await fetch('/api/cart/remove', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: `userId=${this.currentUser}&productId=${productId}`
            });

            if (response.ok) {
                await this.loadCart();
                this.renderCart();
                this.updateCartCount();
                this.showNotification('Product removed from cart!', 'success');
            } else {
                this.showNotification('Failed to remove product from cart', 'error');
            }
        } catch (error) {
            console.error('Error removing from cart:', error);
            this.showNotification('Error removing from cart', 'error');
        }
    }

    async updateQuantity(productId, newQuantity) {
        if (newQuantity <= 0) {
            await this.removeFromCart(productId);
            return;
        }

        try {
            const response = await fetch('/api/cart/update', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: `userId=${this.currentUser}&productId=${productId}&quantity=${newQuantity}`
            });

            if (response.ok) {
                await this.loadCart();
                this.renderCart();
                this.updateCartCount();
            } else {
                this.showNotification('Failed to update quantity', 'error');
            }
        } catch (error) {
            console.error('Error updating quantity:', error);
            this.showNotification('Error updating quantity', 'error');
        }
    }

    async clearCart() {
        try {
            const response = await fetch(`/api/cart/clear/${this.currentUser}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                this.cart = [];
                this.renderCart();
                this.updateCartCount();
                this.showNotification('Cart cleared!', 'success');
            } else {
                this.showNotification('Failed to clear cart', 'error');
            }
        } catch (error) {
            console.error('Error clearing cart:', error);
            this.showNotification('Error clearing cart', 'error');
        }
    }

    updateCartCount() {
        const cartCount = document.getElementById('cartCount');
        const totalItems = this.cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = totalItems;
    }

    addToCartFromModal() {
        const quantity = parseInt(document.getElementById('productQuantity').value);
        if (this.currentProduct) {
            this.addToCart(this.currentProduct.id, quantity);
            this.closeProductModal();
        }
    }

    increaseQuantity() {
        const input = document.getElementById('productQuantity');
        input.value = parseInt(input.value) + 1;
    }

    decreaseQuantity() {
        const input = document.getElementById('productQuantity');
        const newValue = parseInt(input.value) - 1;
        if (newValue >= 1) {
            input.value = newValue;
        }
    }

    checkout() {
        if (this.cart.length === 0) {
            this.showNotification('Your cart is empty!', 'error');
            return;
        }
        
        this.showNotification('Checkout functionality coming soon!', 'info');
        // In a real application, this would redirect to a checkout page
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            color: white;
            font-weight: 600;
            z-index: 3000;
            animation: slideIn 0.3s ease;
        `;

        // Set background color based on type
        const colors = {
            success: '#059669',
            error: '#dc2626',
            info: '#3b82f6'
        };
        notification.style.backgroundColor = colors[type] || colors.info;

        // Add to page
        document.body.appendChild(notification);

        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    getDefaultProducts() {
        return [
            {
                id: 1,
                name: "Wireless Bluetooth Headphones",
                description: "Premium wireless headphones with noise cancellation and 30-hour battery life.",
                price: 129.99,
                imageUrl: "/static/images/headphones.jpg",
                category: "Electronics"
            },
            {
                id: 2,
                name: "Organic Cotton T-Shirt",
                description: "Comfortable 100% organic cotton t-shirt available in multiple colors.",
                price: 24.99,
                imageUrl: "/static/images/tshirt.jpg",
                category: "Clothing"
            },
            {
                id: 3,
                name: "Smart Fitness Watch",
                description: "Advanced fitness tracking with heart rate monitor, GPS, and 7-day battery life.",
                price: 199.99,
                imageUrl: "/static/images/smartwatch.jpg",
                category: "Electronics"
            },
            {
                id: 4,
                name: "Ceramic Coffee Mug Set",
                description: "Beautiful handcrafted ceramic coffee mugs, set of 4. Microwave and dishwasher safe.",
                price: 39.99,
                imageUrl: "/static/images/mugs.jpg",
                category: "Home & Kitchen"
            },
            {
                id: 5,
                name: "Wireless Charging Pad",
                description: "Fast wireless charging pad compatible with all Qi-enabled devices.",
                price: 49.99,
                imageUrl: "/static/images/charger.jpg",
                category: "Electronics"
            },
            {
                id: 6,
                name: "Yoga Mat Premium",
                description: "Non-slip yoga mat made from eco-friendly materials. Perfect for yoga and pilates.",
                price: 34.99,
                imageUrl: "/static/images/yogamat.jpg",
                category: "Sports & Fitness"
            }
        ];
    }
}

// Global functions for HTML onclick handlers
function openCart() {
    glowCart.openCart();
}

function closeCart() {
    glowCart.closeCart();
}

function closeProductModal() {
    glowCart.closeProductModal();
}

function scrollToProducts() {
    document.getElementById('products').scrollIntoView({ behavior: 'smooth' });
}

function clearCart() {
    glowCart.clearCart();
}

function checkout() {
    glowCart.checkout();
}

function addToCartFromModal() {
    glowCart.addToCartFromModal();
}

function increaseQuantity() {
    glowCart.increaseQuantity();
}

function decreaseQuantity() {
    glowCart.decreaseQuantity();
}

// Add CSS animations for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Initialize the application
let glowCart;
document.addEventListener('DOMContentLoaded', () => {
    glowCart = new GlowCart();
}); 