document.addEventListener("DOMContentLoaded", () => {
    let cart = [];
    let allProducts = [];
    let currentUser = null;
    const API_URL = 'http://localhost:3000/api';

    // DOM elements
    const cartModal = document.getElementById("cartModal");
    const cartCount = document.getElementById("cartCount");
    const totalPrice = document.getElementById("totalPrice");
    const snackbar = document.getElementById("snackbar");
    const gridContainer = document.querySelector(".featured-grid .grid");
    const userGreetingSpan = document.getElementById("userGreeting");
    const userInfoLoggedIn = document.getElementById("userInfoLoggedIn");
    const userNameSpan = document.getElementById("userName");

    // Check login status (no redirect)
    function checkLoginStatus() {
        const userStr = localStorage.getItem('currentUser');
        if (userStr) {
            currentUser = JSON.parse(userStr);
            if (userGreetingSpan) userGreetingSpan.style.display = 'none';
            if (userInfoLoggedIn) userInfoLoggedIn.style.display = 'inline';
            if (userNameSpan) userNameSpan.textContent = currentUser.username;
        } else {
            currentUser = null;
            if (userGreetingSpan) userGreetingSpan.style.display = 'inline';
            if (userInfoLoggedIn) userInfoLoggedIn.style.display = 'none';
        }
        updateCartButtonState();
    }

    window.logout = () => {
        if (confirm('Logout?')) {
            localStorage.removeItem('currentUser');
            window.location.reload();
        }
    };

    function updateCartButtonState() {
        const buttons = document.querySelectorAll(".featured-grid .card .add-to-cart");
        buttons.forEach(btn => {
            if (!currentUser) {
                btn.disabled = true;
                btn.style.opacity = '0.6';
                btn.style.cursor = 'not-allowed';
                btn.title = 'Login to add items';
                btn.onclick = (e) => {
                    e.preventDefault();
                    showSnackbar('Please login or register to add items to cart');
                    setTimeout(() => window.location.href = '/auth.html', 1500);
                };
            } else {
                btn.disabled = false;
                btn.style.opacity = '1';
                btn.style.cursor = 'pointer';
                btn.onclick = (e) => {
                    e.preventDefault();
                    const card = btn.closest(".card");
                    if (!card) return;
                    const productId = parseInt(card.dataset.productId);
                    const name = card.querySelector(".product-name").textContent;
                    const price = parseInt(card.querySelector(".product-price").textContent.replace('₱', ''));
                    const existing = cart.find(item => item.id === productId);
                    if (existing) existing.quantity++;
                    else cart.push({ id: productId, name, price, quantity: 1 });
                    updateCartUI();
                    showSnackbar(`${name} added to cart!`);
                };
            }
        });
    }

    async function loadProducts() {
        try {
            const response = await fetch(`${API_URL}/products`);
            allProducts = await response.json();
            if (gridContainer) {
                renderProducts();
                setTimeout(() => updateCartButtonState(), 100);
            }
        } catch (error) {
            showSnackbar('Error loading products');
        }
    }

    function renderProducts() {
        if (!gridContainer) return;
        gridContainer.innerHTML = '';
        allProducts.forEach(product => {
            const card = document.createElement('article');
            card.className = 'card';
            card.dataset.productId = product.id;
            card.innerHTML = `
                <img src="${product.image}" alt="${product.name}">
                <div class="card-body">
                    <p class="product-name">${product.name}</p>
                    <p class="product-price">₱${product.price}</p>
                    <button class="add-to-cart" type="button">Add to Cart</button>
                </div>
            `;
            gridContainer.appendChild(card);
        });
    }

    function updateCartUI() {
        if (cartCount) {
            const qty = cart.reduce((sum, i) => sum + i.quantity, 0);
            cartCount.textContent = qty;
        }
        const container = document.getElementById("cartItems");
        if (!container) return;
        if (cart.length === 0) {
            container.innerHTML = '<p class="empty-msg">Your basket is empty.</p>';
            if (totalPrice) totalPrice.textContent = '₱0';
            return;
        }
        container.innerHTML = '';
        let total = 0;
        cart.forEach((item, idx) => {
            total += item.price * item.quantity;
            const div = document.createElement("div");
            div.className = "cart-item";
            div.innerHTML = `
                <div class="item-details">
                    <h4>${item.name}</h4>
                    <p>₱${item.price} each</p>
                    <button class="remove-item" onclick="window.removeItem(${idx})">Remove</button>
                </div>
                <div class="quantity-controls">
                    <button class="qty-btn" onclick="window.changeQuantity(${idx}, -1)">-</button>
                    <span>${item.quantity}</span>
                    <button class="qty-btn" onclick="window.changeQuantity(${idx}, 1)">+</button>
                </div>
            `;
            container.appendChild(div);
        });
        if (totalPrice) totalPrice.textContent = `₱${total}`;
    }

    window.changeQuantity = (idx, delta) => {
        if (cart[idx]) {
            cart[idx].quantity += delta;
            if (cart[idx].quantity <= 0) cart.splice(idx, 1);
            updateCartUI();
        }
    };
    window.removeItem = (idx) => {
        cart.splice(idx, 1);
        updateCartUI();
    };

    function showSnackbar(msg) {
        if (!snackbar) return;
        snackbar.textContent = msg;
        snackbar.classList.add("show");
        setTimeout(() => snackbar.classList.remove("show"), 3000);
    }

    // Cart modal
    const viewCartBtn = document.getElementById("viewCart");
    const closeCartBtn = document.getElementById("closeCart");
    if (viewCartBtn) viewCartBtn.onclick = () => cartModal?.classList.add("open");
    if (closeCartBtn) closeCartBtn.onclick = () => cartModal?.classList.remove("open");
    if (cartModal) cartModal.onclick = (e) => { if (e.target === cartModal) cartModal.classList.remove("open"); };

    // Checkout – requires login
    const checkoutBtn = document.getElementById("checkoutBtn");
    if (checkoutBtn) {
        checkoutBtn.onclick = async () => {
            if (!currentUser) {
                alert('Please login to place an order');
                window.location.href = '/auth.html';
                return;
            }
            if (cart.length === 0) {
                alert("Your basket is empty!");
                return;
            }
            const total = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
            const paymentMethod = document.getElementById("paymentMethod")?.value || "Cash on Delivery";
            try {
                const response = await fetch(`${API_URL}/orders`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        items: cart,
                        total,
                        payment_method: paymentMethod,
                        customer_name: currentUser.username,
                        customer_email: currentUser.email,
                        customer_phone: '',
                        user_id: currentUser.id
                    })
                });
                const result = await response.json();
                if (result.success) {
                    showSnackbar('✅ Order placed successfully!');
                    cart = [];
                    updateCartUI();
                    cartModal?.classList.remove("open");
                } else {
                    showSnackbar('❌ Order failed: ' + result.error);
                }
            } catch (error) {
                showSnackbar('❌ Error: ' + error.message);
            }
        };
    }

    // Auto-load reorder items if present
    const reorderData = localStorage.getItem('reorderItems');
    if (reorderData) {
        try {
            cart = JSON.parse(reorderData);
            updateCartUI();
            localStorage.removeItem('reorderItems');
            showSnackbar('Items added from previous order!');
        } catch(e) {}
    }

    checkLoginStatus();
    loadProducts();
});