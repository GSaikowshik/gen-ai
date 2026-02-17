/* ═══════════════════════════════════════════════════════════════
   NOVAMART — Main JavaScript
   ═══════════════════════════════════════════════════════════════ */

// ─── State ──────────────────────────────────────────────────────
let cart = JSON.parse(localStorage.getItem('novamart_cart') || '[]');
let currentCategory = 'All';

// ─── DOM Elements ───────────────────────────────────────────────
const productsGrid = document.getElementById('products-grid');
const loadingSpinner = document.getElementById('loading-spinner');
const noResults = document.getElementById('no-results');
const cartCount = document.getElementById('cart-count');
const cartBtn = document.getElementById('cart-btn');
const cartSidebar = document.getElementById('cart-sidebar');
const cartOverlay = document.getElementById('cart-overlay');
const cartClose = document.getElementById('cart-close');
const cartItemsEl = document.getElementById('cart-items');
const cartEmpty = document.getElementById('cart-empty');
const cartFooter = document.getElementById('cart-footer');
const cartTotalPrice = document.getElementById('cart-total-price');
const checkoutBtn = document.getElementById('checkout-btn');
const searchInput = document.getElementById('search-input');
const themeToggle = document.getElementById('theme-toggle');
const navbar = document.getElementById('navbar');
const toastContainer = document.getElementById('toast-container');

// ─── Placeholder images (since we can't generate real ones) ────
const placeholderImages = {
    '/images/headphones.png': 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=450&fit=crop',
    '/images/watch.png': 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=450&fit=crop',
    '/images/sneakers.png': 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=450&fit=crop',
    '/images/backpack.png': 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=450&fit=crop',
    '/images/speaker.png': 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&h=450&fit=crop',
    '/images/mugs.png': 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=600&h=450&fit=crop',
    '/images/keyboard.png': 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=600&h=450&fit=crop',
    '/images/yogamat.png': 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=600&h=450&fit=crop',
};

function getImageUrl(path) {
    return placeholderImages[path] || path;
}

// ═══════════════════════════════════════════════════════════════
//  THEME
// ═══════════════════════════════════════════════════════════════
function initTheme() {
    const saved = localStorage.getItem('novamart_theme');
    if (saved === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
    }
}

themeToggle.addEventListener('click', () => {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    if (isDark) {
        document.documentElement.removeAttribute('data-theme');
        localStorage.setItem('novamart_theme', 'light');
    } else {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('novamart_theme', 'dark');
    }
});

// ═══════════════════════════════════════════════════════════════
//  NAVBAR SCROLL EFFECT
// ═══════════════════════════════════════════════════════════════
window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// ═══════════════════════════════════════════════════════════════
//  FETCH & RENDER PRODUCTS
// ═══════════════════════════════════════════════════════════════
async function fetchProducts(category = 'All', search = '') {
    productsGrid.innerHTML = '';
    loadingSpinner.style.display = 'block';
    noResults.style.display = 'none';

    try {
        let url = '/api/products';
        const params = new URLSearchParams();
        if (category && category !== 'All') params.append('category', category);
        if (search) params.append('search', search);
        if (params.toString()) url += '?' + params.toString();

        const res = await fetch(url);
        const products = await res.json();

        loadingSpinner.style.display = 'none';

        if (products.length === 0) {
            noResults.style.display = 'block';
            return;
        }

        renderProducts(products);
    } catch (err) {
        loadingSpinner.style.display = 'none';
        noResults.style.display = 'block';
        console.error('Failed to fetch products:', err);
    }
}

function renderStars(rating) {
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5 ? 1 : 0;
    const empty = 5 - full - half;
    return '★'.repeat(full) + (half ? '★' : '') + '☆'.repeat(empty);
}

function renderProducts(products) {
    productsGrid.innerHTML = products.map(product => `
        <div class="product-card" id="product-${product.id}">
            <div class="product-image-wrapper">
                <span class="product-category-badge">${product.category}</span>
                <img src="${getImageUrl(product.image)}" alt="${product.name}" loading="lazy">
            </div>
            <div class="product-info">
                <h3 class="product-name">${product.name}</h3>
                <p class="product-description">${product.description}</p>
                <div class="product-rating">
                    <span class="stars">${renderStars(product.rating)}</span>
                    <span class="rating-text">${product.rating} (${product.reviews.toLocaleString()})</span>
                </div>
                <div class="product-bottom">
                    <span class="product-price">$${product.price.toFixed(2)}</span>
                    <button class="add-to-cart-btn" id="add-btn-${product.id}" onclick="addToCart(${product.id}, '${product.name.replace(/'/g, "\\'")}', ${product.price}, '${product.image}')">
                        Add to Cart
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// ═══════════════════════════════════════════════════════════════
//  CATEGORY FILTER
// ═══════════════════════════════════════════════════════════════
document.querySelectorAll('.cat-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentCategory = btn.dataset.category;
        fetchProducts(currentCategory, searchInput.value.trim());
    });
});

// ═══════════════════════════════════════════════════════════════
//  SEARCH
// ═══════════════════════════════════════════════════════════════
let searchTimeout;
searchInput.addEventListener('input', () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        fetchProducts(currentCategory, searchInput.value.trim());
    }, 350);
});

// ═══════════════════════════════════════════════════════════════
//  CART LOGIC
// ═══════════════════════════════════════════════════════════════
function addToCart(id, name, price, image) {
    const existing = cart.find(item => item.id === id);
    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({ id, name, price, image, quantity: 1 });
    }
    saveCart();
    updateCartUI();
    showToast(`✅ ${name} added to cart!`, 'success');

    // Button feedback
    const btn = document.getElementById(`add-btn-${id}`);
    if (btn) {
        btn.textContent = 'Added!';
        btn.classList.add('added');
        setTimeout(() => {
            btn.textContent = 'Add to Cart';
            btn.classList.remove('added');
        }, 1200);
    }
}

function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    saveCart();
    updateCartUI();
    renderCartItems();
}

function updateQuantity(id, delta) {
    const item = cart.find(i => i.id === id);
    if (!item) return;
    item.quantity += delta;
    if (item.quantity <= 0) {
        removeFromCart(id);
        return;
    }
    saveCart();
    updateCartUI();
    renderCartItems();
}

function saveCart() {
    localStorage.setItem('novamart_cart', JSON.stringify(cart));
}

function updateCartUI() {
    const total = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = total;

    if (total > 0) {
        cartCount.classList.add('show');
        cartCount.classList.remove('bump');
        // Trigger reflow for animation
        void cartCount.offsetWidth;
        cartCount.classList.add('bump');
    } else {
        cartCount.classList.remove('show');
    }
}

function renderCartItems() {
    if (cart.length === 0) {
        cartItemsEl.innerHTML = `
            <div class="cart-empty">
                <p>🛒</p>
                <p>Your cart is empty</p>
            </div>`;
        cartFooter.style.display = 'none';
        return;
    }

    cartFooter.style.display = 'block';
    const totalPrice = cart.reduce((s, i) => s + i.price * i.quantity, 0);
    cartTotalPrice.textContent = `$${totalPrice.toFixed(2)}`;

    cartItemsEl.innerHTML = cart.map(item => `
        <div class="cart-item" id="cart-item-${item.id}">
            <img class="cart-item-image" src="${getImageUrl(item.image)}" alt="${item.name}">
            <div class="cart-item-details">
                <div class="cart-item-name">${item.name}</div>
                <div class="cart-item-price">$${(item.price * item.quantity).toFixed(2)}</div>
                <div class="cart-item-controls">
                    <button class="qty-btn" onclick="updateQuantity(${item.id}, -1)">−</button>
                    <span class="cart-item-qty">${item.quantity}</span>
                    <button class="qty-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
                    <button class="cart-item-remove" onclick="removeFromCart(${item.id})">Remove</button>
                </div>
            </div>
        </div>
    `).join('');
}

// ═══════════════════════════════════════════════════════════════
//  CART SIDEBAR OPEN / CLOSE
// ═══════════════════════════════════════════════════════════════
function openCart() {
    renderCartItems();
    cartSidebar.classList.add('open');
    cartOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
}

function closeCart() {
    cartSidebar.classList.remove('open');
    cartOverlay.classList.remove('open');
    document.body.style.overflow = '';
}

cartBtn.addEventListener('click', openCart);
cartClose.addEventListener('click', closeCart);
cartOverlay.addEventListener('click', closeCart);

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeCart();
});

// ═══════════════════════════════════════════════════════════════
//  CHECKOUT
// ═══════════════════════════════════════════════════════════════
checkoutBtn.addEventListener('click', async () => {
    if (cart.length === 0) return;

    checkoutBtn.disabled = true;
    checkoutBtn.textContent = 'Processing...';

    try {
        const res = await fetch('/api/checkout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ items: cart })
        });
        const data = await res.json();

        if (data.success) {
            showToast(`🎉 ${data.message} (Order: ${data.order_id}) — Total: $${data.total.toFixed(2)}`, 'success');
            cart = [];
            saveCart();
            updateCartUI();
            renderCartItems();
            setTimeout(closeCart, 1500);
        } else {
            showToast(`❌ ${data.error || 'Checkout failed.'}`, 'error');
        }
    } catch (err) {
        showToast('❌ Network error. Please try again.', 'error');
    }

    checkoutBtn.disabled = false;
    checkoutBtn.innerHTML = `
        Proceed to Checkout
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
            <path d="M5 12h14M12 5l7 7-7 7"/>
        </svg>`;
});

// ═══════════════════════════════════════════════════════════════
//  TOAST NOTIFICATION
// ═══════════════════════════════════════════════════════════════
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    toastContainer.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('removing');
        toast.addEventListener('animationend', () => toast.remove());
    }, 3000);
}

// ═══════════════════════════════════════════════════════════════
//  INIT
// ═══════════════════════════════════════════════════════════════
initTheme();
updateCartUI();
fetchProducts();
