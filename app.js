// Krishna Kirana Shop - Daily Sales Tracker JS Core

// Default Product Catalog (Fallback to prevent CORS errors on file:// protocol)
const DEFAULT_PRODUCTS = [
  { "id": "prod_atta_5kg", "name": "Ashirvaad Shudh Chakki Atta", "category": "Grains & Pulses", "cost_price": 210.00, "selling_price": 245.00, "unit": "pack", "initial_stock": 25, "reorder_level": 5 },
  { "id": "prod_rice_5kg", "name": "Daawat Rozana Basmati Rice", "category": "Grains & Pulses", "cost_price": 320.00, "selling_price": 375.00, "unit": "pack", "initial_stock": 20, "reorder_level": 4 },
  { "id": "prod_toor_dal_1kg", "name": "Tata Sampann Toor Dal", "category": "Grains & Pulses", "cost_price": 135.00, "selling_price": 160.00, "unit": "kg", "initial_stock": 30, "reorder_level": 6 },
  { "id": "prod_chana_1kg", "name": "Tata Sampann Kabuli Chana", "category": "Grains & Pulses", "cost_price": 110.00, "selling_price": 130.00, "unit": "kg", "initial_stock": 25, "reorder_level": 5 },
  { "id": "prod_tata_salt", "name": "Tata Salt", "category": "Grains & Pulses", "cost_price": 22.00, "selling_price": 28.00, "unit": "kg", "initial_stock": 50, "reorder_level": 10 },
  { "id": "prod_mustard_oil", "name": "Fortune Mustard Oil", "category": "Oils & Ghee", "cost_price": 140.00, "selling_price": 165.00, "unit": "litre", "initial_stock": 20, "reorder_level": 5 },
  { "id": "prod_soya_oil", "name": "Fortune Soya Health Oil", "category": "Oils & Ghee", "cost_price": 115.00, "selling_price": 135.00, "unit": "litre", "initial_stock": 24, "reorder_level": 6 },
  { "id": "prod_amul_ghee", "name": "Amul Pure Ghee", "category": "Oils & Ghee", "cost_price": 570.00, "selling_price": 630.00, "unit": "litre", "initial_stock": 15, "reorder_level": 3 },
  { "id": "prod_amul_milk", "name": "Amul Gold Milk", "category": "Dairy & Eggs", "cost_price": 60.00, "selling_price": 66.00, "unit": "litre", "initial_stock": 40, "reorder_level": 8 },
  { "id": "prod_amul_butter", "name": "Amul Butter", "category": "Dairy & Eggs", "cost_price": 235.00, "selling_price": 260.00, "unit": "pack", "initial_stock": 18, "reorder_level": 4 },
  { "id": "prod_amul_paneer", "name": "Amul Taaza Paneer", "category": "Dairy & Eggs", "cost_price": 72.00, "selling_price": 85.00, "unit": "pack", "initial_stock": 20, "reorder_level": 5 },
  { "id": "prod_tata_tea", "name": "Tata Tea Premium", "category": "Beverages", "cost_price": 180.00, "selling_price": 215.00, "unit": "pack", "initial_stock": 15, "reorder_level": 4 },
  { "id": "prod_bru_coffee", "name": "Bru Instant Coffee", "category": "Beverages", "cost_price": 145.00, "selling_price": 175.00, "unit": "pack", "initial_stock": 15, "reorder_level": 3 },
  { "id": "prod_coke_1.25", "name": "Coca Cola 1.25L", "category": "Beverages", "cost_price": 55.00, "selling_price": 70.00, "unit": "piece", "initial_stock": 30, "reorder_level": 8 },
  { "id": "prod_bisleri_1l", "name": "Bisleri Water Bottle 1L", "category": "Beverages", "cost_price": 12.00, "selling_price": 20.00, "unit": "piece", "initial_stock": 100, "reorder_level": 20 },
  { "id": "prod_maggi_12p", "name": "Maggi 2-Min Noodles 12p", "category": "Snacks & Foods", "cost_price": 144.00, "selling_price": 168.00, "unit": "pack", "initial_stock": 25, "reorder_level": 5 },
  { "id": "prod_marie_gold", "name": "Britannia Marie Gold 250g", "category": "Snacks & Foods", "cost_price": 28.00, "selling_price": 35.00, "unit": "pack", "initial_stock": 40, "reorder_level": 8 },
  { "id": "prod_lays_salted", "name": "Lay's Classic Salted 50g", "category": "Snacks & Foods", "cost_price": 16.00, "selling_price": 20.00, "unit": "pack", "initial_stock": 50, "reorder_level": 10 },
  { "id": "prod_kurkure", "name": "Kurkure Masala Munch 90g", "category": "Snacks & Foods", "cost_price": 16.00, "selling_price": 20.00, "unit": "pack", "initial_stock": 50, "reorder_level": 10 },
  { "id": "prod_haldirams_bhujia", "name": "Haldiram's Bhujia Sev 150g", "category": "Snacks & Foods", "cost_price": 38.00, "selling_price": 45.00, "unit": "pack", "initial_stock": 30, "reorder_level": 6 },
  { "id": "prod_ketchup_1kg", "name": "Kissan Tomato Ketchup 1kg", "category": "Snacks & Foods", "cost_price": 110.00, "selling_price": 135.00, "unit": "pack", "initial_stock": 15, "reorder_level": 3 },
  { "id": "prod_dairy_milk", "name": "Cadbury Dairy Milk Silk 60g", "category": "Snacks & Foods", "cost_price": 58.00, "selling_price": 70.00, "unit": "piece", "initial_stock": 30, "reorder_level": 6 },
  { "id": "prod_dettol_wash", "name": "Dettol Liquid Handwash", "category": "Personal Care", "cost_price": 75.00, "selling_price": 90.00, "unit": "piece", "initial_stock": 25, "reorder_level": 5 },
  { "id": "prod_lifebuoy_soap", "name": "Lifebuoy Total Soap 125g", "category": "Personal Care", "cost_price": 28.00, "selling_price": 34.00, "unit": "piece", "initial_stock": 50, "reorder_level": 10 },
  { "id": "prod_colgate", "name": "Colgate MaxFresh 150g", "category": "Personal Care", "cost_price": 82.00, "selling_price": 98.00, "unit": "piece", "initial_stock": 30, "reorder_level": 6 },
  { "id": "prod_shampoo", "name": "Clinic Plus Shampoo 175ml", "category": "Personal Care", "cost_price": 95.00, "selling_price": 110.00, "unit": "piece", "initial_stock": 20, "reorder_level": 4 },
  { "id": "prod_hair_oil", "name": "Parachute Coconut Oil 250ml", "category": "Personal Care", "cost_price": 98.00, "selling_price": 115.00, "unit": "piece", "initial_stock": 25, "reorder_level": 5 },
  { "id": "prod_pears_soap", "name": "Pears Pure & Gentle Soap", "category": "Personal Care", "cost_price": 45.00, "selling_price": 55.00, "unit": "piece", "initial_stock": 30, "reorder_level": 6 },
  { "id": "prod_vim_liquid", "name": "Vim Dishwash Liquid 500ml", "category": "Household Care", "cost_price": 90.00, "selling_price": 105.00, "unit": "piece", "initial_stock": 20, "reorder_level": 4 },
  { "id": "prod_surf_excel", "name": "Surf Excel Easy Wash 1kg", "category": "Household Care", "cost_price": 125.00, "selling_price": 148.00, "unit": "pack", "initial_stock": 20, "reorder_level": 4 },
  { "id": "prod_harpic", "name": "Harpic Toilet Cleaner 500m", "category": "Household Care", "cost_price": 80.00, "selling_price": 95.00, "unit": "piece", "initial_stock": 25, "reorder_level": 5 },
  { "id": "prod_lizol", "name": "Lizol Floor Cleaner 500ml", "category": "Household Care", "cost_price": 88.00, "selling_price": 105.00, "unit": "piece", "initial_stock": 20, "reorder_level": 4 },
  { "id": "prod_exo_bar", "name": "Exo Round Dishwash Bar 250", "category": "Household Care", "cost_price": 24.00, "selling_price": 30.00, "unit": "piece", "initial_stock": 40, "reorder_level": 8 },
  { "id": "prod_notebook_a4", "name": "Classmate Notebook A4", "category": "Stationery & Misc", "cost_price": 50.00, "selling_price": 65.00, "unit": "piece", "initial_stock": 35, "reorder_level": 7 },
  { "id": "prod_pencils_10p", "name": "Nataraj Pencils 10-pack", "category": "Stationery & Misc", "cost_price": 40.00, "selling_price": 50.00, "unit": "pack", "initial_stock": 20, "reorder_level": 4 },
  { "id": "prod_agarbatti", "name": "Mysore Sandal Agarbatti", "category": "Stationery & Misc", "cost_price": 60.00, "selling_price": 75.00, "unit": "pack", "initial_stock": 30, "reorder_level": 6 }
];

// Application State
let products = [];
let cart = []; // Array of { productId, quantity }
let transactions = []; // Array of completed transactions

// UI Filter States
let posCategoryFilter = "all";
let posSearchQuery = "";
let inventorySearchQuery = "";
let inventoryCategoryFilter = "all";
let inventoryStockFilter = "all";
let inventorySortField = "name";
let inventorySortOrder = "asc"; // "asc" or "desc"

// Chart references
let trendChartInstance = null;
let categoryChartInstance = null;

// App Initialization
document.addEventListener("DOMContentLoaded", () => {
    initApp();
});

async function initApp() {
    // 1. Load data from localStorage or fetch products.json
    await loadDatabase();

    // 2. Attach UI Events
    setupNavigation();
    setupPOSInputEvents();
    setupCartControls();
    setupInventoryControls();
    setupSimulatorControls();
    setupReceiptModalControls();

    // 3. Start clocks & system variables
    startClock();
    
    // 4. Initial rendering
    renderCategories();
    renderPOSProducts();
    updateCartUI();
    renderInventory();
    renderTransactionsTable();
    updateAnalytics();
}

// Database loader
async function loadDatabase() {
    const cachedProducts = localStorage.getItem("krishna_kirana_products");
    const cachedTrans = localStorage.getItem("krishna_kirana_transactions");

    if (cachedProducts && cachedTrans) {
        products = JSON.parse(cachedProducts);
        transactions = JSON.parse(cachedTrans);
    } else {
        // Fallback strategy: try fetching products.json first. If failure (like CORS in file://), use DEFAULT_PRODUCTS
        try {
            const response = await fetch("products.json");
            if (response.ok) {
                const fetchedProducts = await response.json();
                // Map current stock levels to initial_stock on first boot
                products = fetchedProducts.map(p => ({
                    ...p,
                    current_stock: p.initial_stock,
                    units_sold: 0,
                    revenue_earned: 0,
                    profit_earned: 0
                }));
            } else {
                throw new Error("Unable to fetch JSON, using default local data");
            }
        } catch (e) {
            console.warn("Product loading fallback initialized:", e.message);
            products = DEFAULT_PRODUCTS.map(p => ({
                ...p,
                current_stock: p.initial_stock,
                units_sold: 0,
                revenue_earned: 0,
                profit_earned: 0
            }));
        }

        // Initialize empty transaction set
        transactions = [];
        saveToLocalStorage();
    }
    
    // Recompute current sales stats for products to verify synchronicity
    recomputeProductAggregates();
}

function recomputeProductAggregates() {
    // Reset all products to 0 sold aggregates
    products.forEach(p => {
        p.current_stock = p.initial_stock;
        p.units_sold = 0;
        p.revenue_earned = 0;
        p.profit_earned = 0;
    });

    // Deduct stock and accumulate aggregates based on transaction history
    transactions.forEach(t => {
        t.items.forEach(item => {
            const prod = products.find(p => p.id === item.id);
            if (prod) {
                prod.current_stock -= item.quantity;
                prod.units_sold += item.quantity;
                
                // Account for proportionate discount in calculated margins
                const itemRevenue = item.total_selling;
                const itemCost = item.total_cost;
                const itemProfit = itemRevenue - itemCost;
                
                prod.revenue_earned += itemRevenue;
                prod.profit_earned += itemProfit;
            }
        });
    });
    
    saveToLocalStorage();
}

function saveToLocalStorage() {
    localStorage.setItem("krishna_kirana_products", JSON.stringify(products));
    localStorage.setItem("krishna_kirana_transactions", JSON.stringify(transactions));
}

// Live Clock functionality
function startClock() {
    const updateTime = () => {
        const now = new Date();
        const dateOptions = { year: 'numeric', month: 'long', day: 'numeric' };
        document.getElementById("live-date").innerText = now.toLocaleDateString('en-US', dateOptions);
        document.getElementById("live-time").innerText = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    };
    updateTime();
    setInterval(updateTime, 1000);
}

// NAVIGATION HANDLER
function setupNavigation() {
    const navButtons = document.querySelectorAll("#sidebar-nav .nav-btn");
    const screens = document.querySelectorAll(".screen");
    const headerTitle = document.getElementById("header-title");
    const headerSubtitle = document.getElementById("header-subtitle");

    const headerDetails = {
        pos: { title: "Sales POS Desk", subtitle: "Process customers orders and print receipts" },
        dashboard: { title: "Analytics Dashboard", subtitle: "Real-time revenue, profit analysis and sales trends" },
        products: { title: "Inventory & Stock Levels", subtitle: "Track pricing, inventory status and product performance" },
        transactions: { title: "Transaction Invoice Records", subtitle: "History of all bills generated in the store" },
        settings: { title: "System Settings & Simulator", subtitle: "Setup simulated data logs or reset databases" }
    };

    navButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            const tabId = btn.getAttribute("data-tab");

            // Toggle active classes on side nav
            navButtons.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");

            // Toggle active classes on screen panels
            screens.forEach(scr => {
                if (scr.id === `screen-${tabId}`) {
                    scr.classList.add("active");
                } else {
                    scr.classList.remove("active");
                }
            });

            // Update Header titles
            headerTitle.innerText = headerDetails[tabId].title;
            headerSubtitle.innerText = headerDetails[tabId].subtitle;

            // Trigger canvas charts redrawing when opening dashboard
            if (tabId === "dashboard") {
                renderDashboardCharts();
            } else if (tabId === "products") {
                renderInventory();
            }
            
            // Auto refresh Lucide Icons on view changes
            lucide.createIcons();
        });
    });
}

// RENDER POS CATEGORY TAGS
function renderCategories() {
    const categories = [...new Set(products.map(p => p.category))];
    const catContainer = document.getElementById("pos-category-tabs");
    
    // Clear dynamic categories (keep "All Items" tab)
    const allTab = document.getElementById("tab-cat-all");
    catContainer.innerHTML = "";
    catContainer.appendChild(allTab);

    categories.forEach(cat => {
        const btn = document.createElement("button");
        btn.className = "category-tab";
        btn.setAttribute("data-category", cat);
        btn.innerText = cat;
        btn.addEventListener("click", () => {
            document.querySelectorAll(".category-tab").forEach(t => t.classList.remove("active"));
            btn.classList.add("active");
            posCategoryFilter = cat;
            renderPOSProducts();
        });
        catContainer.appendChild(btn);
    });

    // Reset default all tab handler
    allTab.addEventListener("click", () => {
        document.querySelectorAll(".category-tab").forEach(t => t.classList.remove("active"));
        allTab.classList.add("active");
        posCategoryFilter = "all";
        renderPOSProducts();
    });
}

// RENDER POS PRODUCT CARDS
function renderPOSProducts() {
    const grid = document.getElementById("pos-products-grid");
    grid.innerHTML = "";

    const filtered = products.filter(p => {
        const matchesCategory = posCategoryFilter === "all" || p.category === posCategoryFilter;
        const matchesSearch = p.name.toLowerCase().includes(posSearchQuery.toLowerCase()) ||
                              p.category.toLowerCase().includes(posSearchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    if (filtered.length === 0) {
        grid.innerHTML = `
            <div class="empty-cart-state" style="grid-column: 1/-1;">
                <i data-lucide="search-code"></i>
                <p>No products found</p>
                <span>Try refining your search terms</span>
            </div>
        `;
        lucide.createIcons();
        return;
    }

    filtered.forEach(p => {
        const cartItem = cart.find(item => item.productId === p.id);
        const qtyInCart = cartItem ? cartItem.quantity : 0;
        const cardActive = qtyInCart > 0 ? "in-cart-active" : "";
        
        // Stock Status Label
        let stockLabel = "Healthy";
        let stockClass = "healthy";
        if (p.current_stock <= 0) {
            stockLabel = "Out of Stock";
            stockClass = "out";
        } else if (p.current_stock <= p.reorder_level) {
            stockLabel = `Low (${p.current_stock} left)`;
            stockClass = "low";
        } else {
            stockLabel = `${p.current_stock} ${p.unit}s`;
        }

        const card = document.createElement("div");
        card.className = `product-card ${cardActive}`;
        card.innerHTML = `
            ${qtyInCart > 0 ? `<div class="cart-qty-badge">${qtyInCart}</div>` : ""}
            <div class="product-card-header">
                <span class="product-category">${p.category}</span>
                <span class="product-stock-badge ${stockClass}">${stockLabel}</span>
            </div>
            <div class="product-name" title="${p.name}">${p.name}</div>
            <div class="product-unit">Unit: 1 ${p.unit}</div>
            <div class="product-card-footer">
                <div class="product-price">₹${p.selling_price.toFixed(2)}</div>
                <button class="btn-add-product" data-id="${p.id}" ${p.current_stock <= 0 ? "disabled style='opacity:0.3; cursor:not-allowed'" : ""} title="Add to Cart">
                    <i data-lucide="plus"></i>
                </button>
            </div>
        `;
        
        // Wire add button
        card.querySelector(".btn-add-product").addEventListener("click", (e) => {
            e.stopPropagation();
            addToCart(p.id);
        });

        grid.appendChild(card);
    });

    lucide.createIcons();
}

// SETUP SEARCH BAR ON POS
function setupPOSInputEvents() {
    const searchInput = document.getElementById("pos-search-input");
    const clearBtn = document.getElementById("pos-search-clear");

    searchInput.addEventListener("input", (e) => {
        posSearchQuery = e.target.value.trim();
        if (posSearchQuery.length > 0) {
            clearBtn.style.display = "flex";
        } else {
            clearBtn.style.display = "none";
        }
        renderPOSProducts();
    });

    clearBtn.addEventListener("click", () => {
        searchInput.value = "";
        posSearchQuery = "";
        clearBtn.style.display = "none";
        renderPOSProducts();
    });
}

// CART ACTIONS
function addToCart(productId) {
    const prod = products.find(p => p.id === productId);
    if (!prod) return;

    if (prod.current_stock <= 0) {
        alert(`Sorry! ${prod.name} is currently out of stock.`);
        return;
    }

    const cartItemIndex = cart.findIndex(item => item.productId === productId);
    if (cartItemIndex > -1) {
        const nextQty = cart[cartItemIndex].quantity + 1;
        if (nextQty > prod.current_stock) {
            alert(`Stock Limit Reached! Only ${prod.current_stock} units available.`);
            return;
        }
        cart[cartItemIndex].quantity = nextQty;
    } else {
        cart.push({ productId: productId, quantity: 1 });
    }

    updateCartUI();
    renderPOSProducts();
}

function updateCartQty(productId, inputVal) {
    const prod = products.find(p => p.id === productId);
    const qty = parseInt(inputVal);

    if (isNaN(qty) || qty <= 0) {
        // Zero or negative quantities remove the item from the cart
        removeFromCart(productId);
        return;
    }

    if (qty > prod.current_stock) {
        alert(`Stock Limit Reached! Only ${prod.current_stock} units available.`);
        const cartItem = cart.find(item => item.productId === productId);
        if (cartItem) {
            document.getElementById(`cart-input-${productId}`).value = cartItem.quantity;
        }
        return;
    }

    const cartItem = cart.find(item => item.productId === productId);
    if (cartItem) {
        cartItem.quantity = qty;
        updateCartUI();
        renderPOSProducts();
    }
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.productId !== productId);
    updateCartUI();
    renderPOSProducts();
}

function setupCartControls() {
    document.getElementById("btn-clear-cart").addEventListener("click", () => {
        cart = [];
        updateCartUI();
        renderPOSProducts();
    });

    document.getElementById("cart-discount-input").addEventListener("input", () => {
        let val = parseInt(document.getElementById("cart-discount-input").value);
        if (isNaN(val) || val < 0) {
            document.getElementById("cart-discount-input").value = 0;
        } else if (val > 100) {
            document.getElementById("cart-discount-input").value = 100;
        }
        updateCartUI();
    });

    document.getElementById("btn-checkout").addEventListener("click", () => {
        triggerCheckout();
    });
}

// UPDATE CART COMPONENT UI
function updateCartUI() {
    const container = document.getElementById("cart-items-container");
    const emptyState = document.getElementById("empty-cart-state");
    const itemsCountEl = document.getElementById("summary-items-count");
    const subtotalEl = document.getElementById("summary-subtotal");
    const discountEl = document.getElementById("summary-discount");
    const grandTotalEl = document.getElementById("summary-grand-total");
    const checkoutBtn = document.getElementById("btn-checkout");

    // Remove old cart item lines
    const oldRows = container.querySelectorAll(".cart-item");
    oldRows.forEach(row => row.remove());

    if (cart.length === 0) {
        emptyState.style.display = "flex";
        itemsCountEl.innerText = "0 items";
        subtotalEl.innerText = "₹0.00";
        discountEl.innerText = "-₹0.00";
        grandTotalEl.innerText = "₹0.00";
        checkoutBtn.disabled = true;
        checkoutBtn.innerText = "Complete Checkout (₹0.00)";
        return;
    }

    emptyState.style.display = "none";
    checkoutBtn.disabled = false;

    let subtotal = 0;
    let totalItems = 0;

    cart.forEach(item => {
        const prod = products.find(p => p.id === item.productId);
        if (!prod) return;

        const rowTotal = prod.selling_price * item.quantity;
        subtotal += rowTotal;
        totalItems += item.quantity;

        const row = document.createElement("div");
        row.className = "cart-item";
        row.innerHTML = `
            <div class="cart-item-details">
                <div class="cart-item-name" title="${prod.name}">${prod.name}</div>
                <div class="cart-item-meta">₹${prod.selling_price.toFixed(2)} / ${prod.unit}</div>
            </div>
            <div class="cart-item-actions">
                <button class="qty-btn btn-qty-minus" data-id="${prod.id}">-</button>
                <input type="number" class="cart-item-qty" id="cart-input-${prod.id}" value="${item.quantity}" min="1" max="${prod.current_stock}">
                <button class="qty-btn btn-qty-plus" data-id="${prod.id}">+</button>
            </div>
            <div class="cart-item-total">₹${rowTotal.toFixed(2)}</div>
            <button class="btn-remove-item" data-id="${prod.id}" title="Remove Item">
                <i data-lucide="trash-2"></i>
            </button>
        `;

        // Action Bindings inside Row
        row.querySelector(".btn-qty-minus").addEventListener("click", () => {
            updateCartQty(prod.id, item.quantity - 1);
        });
        row.querySelector(".btn-qty-plus").addEventListener("click", () => {
            updateCartQty(prod.id, item.quantity + 1);
        });
        row.querySelector(".cart-item-qty").addEventListener("change", (e) => {
            updateCartQty(prod.id, e.target.value);
        });
        row.querySelector(".btn-remove-item").addEventListener("click", () => {
            removeFromCart(prod.id);
        });

        // Insert before emptyState
        container.appendChild(row);
    });

    // Discount & Totals calculation
    const discountPercent = parseInt(document.getElementById("cart-discount-input").value) || 0;
    const discountAmount = subtotal * (discountPercent / 100);
    const grandTotal = subtotal - discountAmount;

    itemsCountEl.innerText = `${totalItems} units`;
    subtotalEl.innerText = `₹${subtotal.toFixed(2)}`;
    discountEl.innerText = `-₹${discountAmount.toFixed(2)}`;
    grandTotalEl.innerText = `₹${grandTotal.toFixed(2)}`;
    checkoutBtn.innerText = `Complete Checkout (₹${grandTotal.toFixed(2)})`;

    lucide.createIcons();
}

// CHECKOUT OPERATION
function triggerCheckout() {
    if (cart.length === 0) return;

    // Double check inventory bounds
    for (const item of cart) {
        const prod = products.find(p => p.id === item.productId);
        if (item.quantity > prod.current_stock) {
            alert(`Oops! Stock level updated. We only have ${prod.current_stock} of ${prod.name} in stock.`);
            return;
        }
        if (item.quantity <= 0) {
            alert(`Error: Negative or zero quantities detected. Please update cart.`);
            return;
        }
    }

    const discountPercent = parseInt(document.getElementById("cart-discount-input").value) || 0;
    const billId = transactions.length + 1001;
    const timestamp = new Date();

    // Compile items for transaction report
    let subtotal = 0;
    let totalCost = 0;
    const billItems = [];

    cart.forEach(item => {
        const prod = products.find(p => p.id === item.productId);
        const itemSellingTotal = prod.selling_price * item.quantity;
        const itemCostTotal = prod.cost_price * item.quantity;

        subtotal += itemSellingTotal;
        totalCost += itemCostTotal;

        billItems.push({
            id: prod.id,
            name: prod.name,
            category: prod.category,
            quantity: item.quantity,
            cost_price: prod.cost_price,
            selling_price: prod.selling_price,
            unit: prod.unit,
            total_selling: itemSellingTotal,
            total_cost: itemCostTotal
        });
    });

    const discountAmount = subtotal * (discountPercent / 100);
    const grandTotal = subtotal - discountAmount;
    
    // Profit margin computation adjustments matching discount rate
    // Deduct discount from profits proportionately
    const totalProfit = grandTotal - totalCost;

    const newTransaction = {
        id: `#${billId}`,
        timestamp: timestamp.toISOString(),
        items: billItems,
        subtotal: subtotal,
        discountPercent: discountPercent,
        discountAmount: discountAmount,
        grandTotal: grandTotal,
        totalCost: totalCost,
        totalProfit: totalProfit,
        totalItems: billItems.reduce((acc, current) => acc + current.quantity, 0)
    };

    // Add transaction to log
    transactions.push(newTransaction);

    // Save & Recompute stocks
    recomputeProductAggregates();
    
    // Reset active cart
    cart = [];
    document.getElementById("cart-discount-input").value = 0;

    // Refresh application screens
    updateCartUI();
    renderPOSProducts();
    renderInventory();
    renderTransactionsTable();
    updateAnalytics();

    // Show thermal bill print receipt in Modal
    showReceiptModal(newTransaction);
}

// MODAL DISPLAY THERMAL RECEIPT
function showReceiptModal(tx) {
    document.getElementById("bill-id").innerText = tx.id;
    document.getElementById("bill-date").innerText = new Date(tx.timestamp).toLocaleString("en-IN");

    const itemsBody = document.getElementById("bill-items-body");
    itemsBody.innerHTML = "";

    tx.items.forEach(item => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${item.name}</td>
            <td>${item.quantity}</td>
            <td>₹${item.selling_price.toFixed(0)}</td>
            <td>₹${item.total_selling.toFixed(0)}</td>
        `;
        itemsBody.appendChild(row);
    });

    document.getElementById("bill-subtotal").innerText = `₹${tx.subtotal.toFixed(2)}`;
    
    const discRow = document.getElementById("bill-discount-row");
    if (tx.discountAmount > 0) {
        discRow.style.display = "flex";
        document.getElementById("bill-discount").innerText = `-₹${tx.discountAmount.toFixed(2)}`;
    } else {
        discRow.style.display = "none";
    }

    document.getElementById("bill-total").innerText = `₹${tx.grandTotal.toFixed(2)}`;

    // Open Modal window
    document.getElementById("bill-modal").classList.add("active");
    lucide.createIcons();
}

function setupReceiptModalControls() {
    const modal = document.getElementById("bill-modal");
    const closeBtn = document.getElementById("btn-close-modal");
    const closeDoneBtn = document.getElementById("btn-close-bill-modal");
    const printBtn = document.getElementById("btn-print-bill");

    const closeModalFunc = () => {
        modal.classList.remove("active");
    };

    closeBtn.addEventListener("click", closeModalFunc);
    closeDoneBtn.addEventListener("click", closeModalFunc);

    printBtn.addEventListener("click", () => {
        const receiptContent = document.getElementById("thermal-receipt").outerHTML;
        const printWindow = window.open("", "_blank", "width=400,height=600");
        printWindow.document.write(`
            <html>
            <head>
                <title>Krishna Kirana Shop Bill Receipt</title>
                <style>
                    body {
                        font-family: 'JetBrains Mono', monospace;
                        padding: 20px;
                        margin: 0;
                        display: flex;
                        justify-content: center;
                    }
                    .thermal-receipt {
                        width: 300px;
                        font-size: 11px;
                    }
                    .receipt-header { text-align: center; margin-bottom: 12px; }
                    .receipt-header h2 { font-size: 14px; font-weight: 700; margin-bottom: 4px; }
                    .receipt-header p { font-size: 10px; margin-bottom: 2px; }
                    .receipt-meta-row { display: flex; justify-content: space-between; font-size: 10px; margin: 2px 0; }
                    .receipt-divider { letter-spacing: -1px; margin: 6px 0; }
                    .receipt-table { width: 100%; border-collapse: collapse; }
                    .receipt-table th { text-align: left; font-weight: 700; padding-bottom: 6px; border-bottom: 1px dashed #000; }
                    .receipt-table td { padding: 6px 0; font-size: 10px; }
                    .receipt-table th:nth-child(2), .receipt-table td:nth-child(2) { text-align: center; }
                    .receipt-table th:nth-child(3), .receipt-table td:nth-child(3),
                    .receipt-table th:nth-child(4), .receipt-table td:nth-child(4) { text-align: right; }
                    .receipt-summary { display: flex; flex-direction: column; gap: 4px; margin-top: 8px; }
                    .receipt-summary-row { display: flex; justify-content: space-between; }
                    .bill-grand-total { font-weight: 700; font-size: 13px; border-top: 1px dashed #000; padding-top: 6px; margin-top: 4px; }
                    .receipt-footer { text-align: center; margin-top: 12px; }
                </style>
            </head>
            <body>
                ${receiptContent}
                <script>
                    window.onload = function() {
                        window.print();
                        setTimeout(function() { window.close(); }, 500);
                    };
                </script>
            </body>
            </html>
        `);
        printWindow.document.close();
    });
}

// INVENTORY (PRODUCT PERFORMANCE SCREEN) RENDER
function renderInventory() {
    const tableBody = document.getElementById("inventory-table-body");
    tableBody.innerHTML = "";

    // 1. Filter
    let filtered = products.filter(p => {
        const matchesCategory = inventoryCategoryFilter === "all" || p.category === inventoryCategoryFilter;
        const matchesSearch = p.name.toLowerCase().includes(inventorySearchQuery.toLowerCase()) ||
                              p.category.toLowerCase().includes(inventorySearchQuery.toLowerCase());
        
        let matchesStock = true;
        if (inventoryStockFilter === "low") {
            matchesStock = p.current_stock > 0 && p.current_stock <= p.reorder_level;
        } else if (inventoryStockFilter === "out") {
            matchesStock = p.current_stock <= 0;
        } else if (inventoryStockFilter === "healthy") {
            matchesStock = p.current_stock > p.reorder_level;
        }
        
        return matchesCategory && matchesSearch && matchesStock;
    });

    // 2. Sort
    filtered.sort((a, b) => {
        let valA, valB;
        if (inventorySortField === "name") {
            valA = a.name;
            valB = b.name;
        } else if (inventorySortField === "category") {
            valA = a.category;
            valB = b.category;
        } else if (inventorySortField === "stock") {
            valA = a.current_stock;
            valB = b.current_stock;
        } else if (inventorySortField === "units") {
            valA = a.units_sold;
            valB = b.units_sold;
        } else if (inventorySortField === "revenue") {
            valA = a.revenue_earned;
            valB = b.revenue_earned;
        } else if (inventorySortField === "margin") {
            // Profit margin percentage computation
            const marginA = a.revenue_earned > 0 ? (a.profit_earned / a.revenue_earned) * 100 : ((a.selling_price - a.cost_price) / a.selling_price) * 100;
            const marginB = b.revenue_earned > 0 ? (b.profit_earned / b.revenue_earned) * 100 : ((b.selling_price - b.cost_price) / b.selling_price) * 100;
            valA = marginA;
            valB = marginB;
        }

        if (typeof valA === "string") {
            return inventorySortOrder === "asc" ? valA.localeCompare(valB) : valB.localeCompare(valA);
        } else {
            return inventorySortOrder === "asc" ? valA - valB : valB - valA;
        }
    });

    if (filtered.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="8" style="text-align:center; padding: 40px; color: var(--text-muted)">
                    No products found matching active inventory search filter criteria
                </td>
            </tr>
        `;
        return;
    }

    filtered.forEach(p => {
        const row = document.createElement("tr");
        
        // Stock progress percentage
        const stockPct = Math.min((p.current_stock / p.initial_stock) * 100, 100);
        let stockClass = "healthy";
        let rowAlertClass = "";
        
        if (p.current_stock <= 0) {
            stockClass = "out";
            rowAlertClass = "low-stock-critical-row";
        } else if (p.current_stock <= p.reorder_level) {
            stockClass = "low";
            rowAlertClass = "low-stock-warning-row";
        }

        // Margin Calculations
        const nominalMargin = ((p.selling_price - p.cost_price) / p.selling_price) * 100;
        const actualMargin = p.revenue_earned > 0 ? (p.profit_earned / p.revenue_earned) * 100 : nominalMargin;
        let marginBadgeClass = "medium";
        if (actualMargin >= 20) marginBadgeClass = "high";

        row.className = rowAlertClass;
        row.innerHTML = `
            <td><strong>${p.name}</strong></td>
            <td><span class="product-category">${p.category}</span></td>
            <td>
                <div style="font-size:12px; color:var(--text-muted)">CP: ₹${p.cost_price.toFixed(2)}</div>
                <div style="font-weight:600">SP: ₹${p.selling_price.toFixed(2)}</div>
            </td>
            <td>
                <div class="stock-cell-flex">
                    <div class="stock-labels">
                        <span>${p.current_stock} / ${p.initial_stock} ${p.unit}</span>
                        <span>${stockPct.toFixed(0)}%</span>
                    </div>
                    <div class="stock-bar-bg">
                        <div class="stock-bar-fill ${stockClass}" style="width: ${stockPct}%"></div>
                    </div>
                </div>
            </td>
            <td>${p.units_sold}</td>
            <td><strong>₹${p.revenue_earned.toFixed(2)}</strong></td>
            <td>
                <span class="margin-badge ${marginBadgeClass}">${actualMargin.toFixed(1)}%</span>
            </td>
            <td>
                <button class="restock-quick-btn" data-id="${p.id}">
                    +10 Restock
                </button>
            </td>
        `;

        row.querySelector(".restock-quick-btn").addEventListener("click", () => {
            quickRestockProduct(p.id, 10);
        });

        tableBody.appendChild(row);
    });
}

function quickRestockProduct(productId, amount) {
    const prod = products.find(p => p.id === productId);
    if (prod) {
        prod.current_stock += amount;
        saveToLocalStorage();
        renderInventory();
        renderPOSProducts();
        updateAnalytics();
    }
}

function setupInventoryControls() {
    const searchInput = document.getElementById("inventory-search-input");
    const catFilter = document.getElementById("inventory-category-filter");
    const stockFilter = document.getElementById("inventory-stock-filter");

    // Populate category dropdown
    const categories = [...new Set(DEFAULT_PRODUCTS.map(p => p.category))];
    categories.forEach(cat => {
        const opt = document.createElement("option");
        opt.value = cat;
        opt.innerText = cat;
        catFilter.appendChild(opt);
    });

    searchInput.addEventListener("input", (e) => {
        inventorySearchQuery = e.target.value.trim();
        renderInventory();
    });

    catFilter.addEventListener("change", (e) => {
        inventoryCategoryFilter = e.target.value;
        renderInventory();
    });

    stockFilter.addEventListener("change", (e) => {
        inventoryStockFilter = e.target.value;
        renderInventory();
    });

    // Column Sorting
    const sortHeaders = document.querySelectorAll("#inventory-table th.sortable");
    sortHeaders.forEach(th => {
        th.addEventListener("click", () => {
            const field = th.getAttribute("data-sort");
            if (inventorySortField === field) {
                inventorySortOrder = inventorySortOrder === "asc" ? "desc" : "asc";
            } else {
                inventorySortField = field;
                inventorySortOrder = "asc";
            }
            renderInventory();
        });
    });
}

// TRANSACTIONS LOG TABLE RENDER
function renderTransactionsTable() {
    const tableBody = document.getElementById("transactions-table-body");
    const emptyState = document.getElementById("empty-transactions-state");
    
    tableBody.innerHTML = "";

    if (transactions.length === 0) {
        emptyState.style.display = "flex";
        return;
    }

    emptyState.style.display = "none";

    // Show newest first
    const sortedTrans = [...transactions].reverse();

    sortedTrans.forEach(t => {
        const row = document.createElement("tr");
        
        // Compile items list string summary
        const itemsStr = t.items.map(item => `${item.name} (${item.quantity})`).join(", ");

        row.innerHTML = `
            <td><strong>${t.id}</strong></td>
            <td><span style="font-size:12px">${new Date(t.timestamp).toLocaleString("en-IN")}</span></td>
            <td style="max-width: 250px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${itemsStr}">
                ${itemsStr}
            </td>
            <td>${t.totalItems}</td>
            <td>₹${t.subtotal.toFixed(2)}</td>
            <td style="color:var(--danger)">-₹${t.discountAmount.toFixed(2)} (${t.discountPercent}%)</td>
            <td><strong>₹${t.grandTotal.toFixed(2)}</strong></td>
            <td style="color:var(--primary)"><strong>₹${t.totalProfit.toFixed(2)}</strong></td>
            <td>
                <button class="sec-action-btn view-bill-row-btn" data-id="${t.id}">
                    <i data-lucide="eye"></i> Invoice
                </button>
            </td>
        `;

        row.querySelector(".view-bill-row-btn").addEventListener("click", () => {
            const tx = transactions.find(item => item.id === t.id);
            if (tx) showReceiptModal(tx);
        });

        tableBody.appendChild(row);
    });

    lucide.createIcons();
}

// UPDATE CORE DASHBOARD STATS AND CHARTS
function updateAnalytics() {
    const totalSalesEl = document.getElementById("dashboard-total-sales");
    const totalTransEl = document.getElementById("dashboard-total-trans");
    const totalProfitEl = document.getElementById("dashboard-total-profit");
    const avgMarginEl = document.getElementById("dashboard-avg-margin");

    if (transactions.length === 0) {
        totalSalesEl.innerText = "₹0.00";
        totalTransEl.innerText = "0";
        totalProfitEl.innerText = "₹0.00";
        avgMarginEl.innerText = "0.0%";
        
        // Stock Alerts
        renderDashboardStockAlerts();
        renderInsights();
        return;
    }

    let grandTotalSales = 0;
    let grandTotalProfit = 0;

    transactions.forEach(t => {
        grandTotalSales += t.grandTotal;
        grandTotalProfit += t.totalProfit;
    });

    const netMarginPct = grandTotalSales > 0 ? (grandTotalProfit / grandTotalSales) * 100 : 0;

    totalSalesEl.innerText = `₹${grandTotalSales.toFixed(2)}`;
    totalTransEl.innerText = transactions.length.toString();
    totalProfitEl.innerText = `₹${grandTotalProfit.toFixed(2)}`;
    avgMarginEl.innerText = `${netMarginPct.toFixed(1)}%`;

    // Render alerts & dynamic text suggestions
    renderDashboardStockAlerts();
    renderInsights();
}

// RENDER DASHBOARD CRITICAL LOW STOCK WARNINGS LIST
function renderDashboardStockAlerts() {
    const alertList = document.getElementById("dashboard-stock-alerts");
    alertList.innerHTML = "";

    const warnings = products.filter(p => p.current_stock <= p.reorder_level);
    document.getElementById("stock-warning-count").innerText = `${warnings.length} items`;

    if (warnings.length === 0) {
        alertList.innerHTML = `
            <div class="empty-alerts-state">
                <i data-lucide="check-check"></i>
                <p>All stock levels are healthy!</p>
            </div>
        `;
        lucide.createIcons();
        return;
    }

    warnings.forEach(w => {
        const alertClass = w.current_stock <= 0 ? "danger-status" : "warning-status";
        const div = document.createElement("div");
        div.className = `stock-alert-item ${alertClass}`;
        div.innerHTML = `
            <span class="stock-alert-text">${w.name}</span>
            <span class="stock-alert-qty">${w.current_stock <= 0 ? "OUT OF STOCK" : `${w.current_stock} left (${w.unit})`}</span>
        `;
        alertList.appendChild(div);
    });
}

// GENERATE DYNAMIC INSIGHTS IN THE BOTTOM BOARD
function renderInsights() {
    const container = document.getElementById("insights-container");
    container.innerHTML = "";

    if (transactions.length === 0) {
        container.innerHTML = `
            <p class="loading-text">No sale records available yet. Log sales transactions to produce reports.</p>
        `;
        return;
    }

    // 1. Find Best-Selling Day
    const dateGroups = {};
    transactions.forEach(t => {
        const dateStr = new Date(t.timestamp).toLocaleDateString("en-IN", { month: "short", day: "numeric" });
        dateGroups[dateStr] = (dateGroups[dateStr] || 0) + t.grandTotal;
    });

    let bestDay = "N/A";
    let maxSales = 0;
    for (const [day, revenue] of Object.entries(dateGroups)) {
        if (revenue > maxSales) {
            maxSales = revenue;
            bestDay = day;
        }
    }

    // 2. Identify top product by revenue
    let topProduct = null;
    let maxProdRevenue = 0;
    products.forEach(p => {
        if (p.revenue_earned > maxProdRevenue) {
            maxProdRevenue = p.revenue_earned;
            topProduct = p;
        }
    });

    // 3. Stock warning count
    const criticalStockCount = products.filter(p => p.current_stock <= p.reorder_level).length;

    // Create 3 insight card slots
    const block1 = document.createElement("div");
    block1.className = "insight-block";
    block1.innerHTML = `
        <h4><i data-lucide="crown"></i> Peak Store Performance</h4>
        <p>Your highest revenue day was <strong>${bestDay}</strong> netting <strong>₹${maxSales.toFixed(2)}</strong>. Design special marketing offers around this day's timing.</p>
    `;

    const block2 = document.createElement("div");
    block2.className = "insight-block";
    block2.innerHTML = `
        <h4><i data-lucide="award"></i> Best-Selling Product</h4>
        <p>${topProduct ? `<strong>${topProduct.name}</strong> contributed the most to your store, generating <strong>₹${topProduct.revenue_earned.toFixed(2)}</strong> in sales revenue.` : "No sales items logged yet."}</p>
    `;

    const block3 = document.createElement("div");
    block3.className = "insight-block";
    block3.innerHTML = `
        <h4><i data-lucide="shield-alert"></i> Restocking Guidance</h4>
        <p>${criticalStockCount > 0 ? `Alert! <strong>${criticalStockCount} products</strong> have hit warnings. Go to the "Product & Stock" page to replenish stock.` : "Congratulations! Inventory levels for all items are within safe operational limits."}</p>
    `;

    container.appendChild(block1);
    container.appendChild(block2);
    container.appendChild(block3);

    lucide.createIcons();
}

// CHART.JS INTEGRATIONS
function renderDashboardCharts() {
    renderTrendChart();
    renderCategoryChart();
}

// Chart 1: Sales and Profit lines trend over days
function renderTrendChart() {
    const ctx = document.getElementById("trend-chart").getContext("2d");

    // Group sales and profit by day
    const dayRecords = {};
    
    // Sort transactions by date asc
    const sortedTx = [...transactions].sort((a,b) => new Date(a.timestamp) - new Date(b.timestamp));

    sortedTx.forEach(t => {
        const dateStr = new Date(t.timestamp).toLocaleDateString("en-IN", { month: "short", day: "numeric" });
        if (!dayRecords[dateStr]) {
            dayRecords[dateStr] = { sales: 0, profit: 0 };
        }
        dayRecords[dateStr].sales += t.grandTotal;
        dayRecords[dateStr].profit += t.totalProfit;
    });

    const labels = Object.keys(dayRecords);
    const salesData = labels.map(lbl => dayRecords[lbl].sales);
    const profitData = labels.map(lbl => dayRecords[lbl].profit);

    if (trendChartInstance) {
        trendChartInstance.destroy();
    }

    trendChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels.length > 0 ? labels : ["No Data"],
            datasets: [
                {
                    label: 'Store Sales (Revenue)',
                    data: salesData.length > 0 ? salesData : [0],
                    borderColor: '#10b981', // Emerald
                    backgroundColor: 'rgba(16, 185, 129, 0.05)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.3
                },
                {
                    label: 'Net Profits',
                    data: profitData.length > 0 ? profitData : [0],
                    borderColor: '#6366f1', // Indigo
                    backgroundColor: 'rgba(99, 102, 241, 0.05)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.3
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        font: { family: 'Outfit', size: 12 }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: '#f1f5f9' },
                    ticks: {
                        callback: function(value) { return '₹' + value; },
                        font: { family: 'Outfit' }
                    }
                },
                x: {
                    grid: { display: false },
                    ticks: { font: { family: 'Outfit' } }
                }
            }
        }
    });
}

// Chart 2: Category Breakdown
function renderCategoryChart() {
    const ctx = document.getElementById("category-chart").getContext("2d");

    const categorySales = {};
    transactions.forEach(t => {
        t.items.forEach(item => {
            categorySales[item.category] = (categorySales[item.category] || 0) + item.total_selling;
        });
    });

    const labels = Object.keys(categorySales);
    const data = Object.values(categorySales);

    if (categoryChartInstance) {
        categoryChartInstance.destroy();
    }

    categoryChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels.length > 0 ? labels : ["No Sales Yet"],
            datasets: [{
                data: data.length > 0 ? data : [1],
                backgroundColor: [
                    '#10b981', // Emerald
                    '#6366f1', // Indigo
                    '#f59e0b', // Amber
                    '#3b82f6', // Blue
                    '#ec4899', // Pink
                    '#8b5cf6'  // Purple
                ],
                borderWidth: 2,
                borderColor: '#ffffff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        boxWidth: 12,
                        font: { family: 'Outfit', size: 10 }
                    }
                }
            }
        }
    });
}

function renderDashboardChartsFallback() {
    if (document.getElementById("screen-dashboard").classList.contains("active")) {
        renderDashboardCharts();
    }
}

// SIMULATION & SETTINGS ACTIONS
function setupSimulatorControls() {
    const simLoadBtn = document.getElementById("btn-sim-load");
    const simStatusText = document.getElementById("sim-status-text");
    const resetSystemBtn = document.getElementById("btn-system-reset");
    const globalRestockBtn = document.getElementById("btn-global-restock");
    const exportSalesBtn = document.getElementById("btn-export-sales");

    simLoadBtn.addEventListener("click", () => {
        generateSimulationData();
        simStatusText.innerText = "Simulated 3-day data successfully injected into local ledger.";
        simStatusText.style.color = "var(--primary)";
        alert("Success! 3 Days of diverse transactional logs have been generated. Refreshing dashboard...");
    });

    resetSystemBtn.addEventListener("click", () => {
        if (confirm("Warning! This will clear all transactions, cart contents, and stock updates. Are you sure?")) {
            localStorage.removeItem("krishna_kirana_products");
            localStorage.removeItem("krishna_kirana_transactions");
            cart = [];
            products = DEFAULT_PRODUCTS.map(p => ({
                ...p,
                current_stock: p.initial_stock,
                units_sold: 0,
                revenue_earned: 0,
                profit_earned: 0
            }));
            transactions = [];
            saveToLocalStorage();

            // Refresh UI
            renderCategories();
            renderPOSProducts();
            updateCartUI();
            renderInventory();
            renderTransactionsTable();
            updateAnalytics();
            
            simStatusText.innerText = "System reset completed. Cache flushed.";
            simStatusText.style.color = "var(--danger)";
            alert("Database has been reset to defaults.");
        }
    });

    globalRestockBtn.addEventListener("click", () => {
        products.forEach(p => {
            p.current_stock = p.initial_stock;
        });
        saveToLocalStorage();
        renderInventory();
        renderPOSProducts();
        updateAnalytics();
        alert("Restocked! All products restored to their original capacity.");
    });

    exportSalesBtn.addEventListener("click", () => {
        exportSalesToCSV();
    });
}

// CSV EXPORT LOGIC
function exportSalesToCSV() {
    if (transactions.length === 0) {
        alert("No transaction entries available to export.");
        return;
    }

    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Transaction ID,Date,Product ID,Product Name,Category,Quantity,Selling Price,Cost Price,Discount Applied %,Total Cost,Total Selling,Net Profit\r\n";

    transactions.forEach(t => {
        t.items.forEach(item => {
            const row = [
                t.id,
                new Date(t.timestamp).toISOString(),
                item.id,
                `"${item.name.replace(/"/g, '""')}"`,
                `"${item.category}"`,
                item.quantity,
                item.selling_price.toFixed(2),
                item.cost_price.toFixed(2),
                t.discountPercent,
                item.total_cost.toFixed(2),
                item.total_selling.toFixed(2),
                (item.total_selling - item.total_cost).toFixed(2)
            ];
            csvContent += row.join(",") + "\r\n";
        });
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Krishna_Kirana_Shop_Sales_Log_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// 3-DAY SIMULATION POPULATOR
function generateSimulationData() {
    // Generate dates relative to current time
    const today = new Date();
    const day1Date = new Date(today); day1Date.setDate(today.getDate() - 3);
    const day2Date = new Date(today); day2Date.setDate(today.getDate() - 2);
    const day3Date = new Date(today); day3Date.setDate(today.getDate() - 1);

    // Hardcode simulated dates
    const day1 = day1Date.toISOString().slice(0, 10);
    const day2 = day2Date.toISOString().slice(0, 10);
    const day3 = day3Date.toISOString().slice(0, 10);

    // Clear previous simulation or user logs to preserve clean test datasets
    transactions = [];

    // Create 3 Days of Sales transactions
    // Day 1 Transactions
    transactions.push(
        createSimulatedTx(1001, `${day1}T09:30:00`, [
            { id: "prod_atta_5kg", qty: 2 },
            { id: "prod_toor_dal_1kg", qty: 3 },
            { id: "prod_tata_salt", qty: 4 }
        ], 0),
        createSimulatedTx(1002, `${day1}T12:15:00`, [
            { id: "prod_amul_butter", qty: 1 },
            { id: "prod_marie_gold", qty: 5 },
            { id: "prod_coke_1.25", qty: 2 }
        ], 5),
        createSimulatedTx(1003, `${day1}T18:45:00`, [
            { id: "prod_maggi_12p", qty: 2 },
            { id: "prod_lays_salted", qty: 6 },
            { id: "prod_kurkure", qty: 4 }
        ], 10)
    );

    // Day 2 Transactions
    transactions.push(
        createSimulatedTx(1004, `${day2}T10:00:00`, [
            { id: "prod_rice_5kg", qty: 2 },
            { id: "prod_mustard_oil", qty: 2 },
            { id: "prod_amul_ghee", qty: 1 }
        ], 0),
        createSimulatedTx(1005, `${day2}T15:20:00`, [
            { id: "prod_dettol_wash", qty: 2 },
            { id: "prod_colgate", qty: 3 },
            { id: "prod_lifebuoy_soap", qty: 6 }
        ], 5),
        createSimulatedTx(1006, `${day2}T20:10:00`, [
            { id: "prod_tata_tea", qty: 2 },
            { id: "prod_bru_coffee", qty: 1 },
            { id: "prod_bisleri_1l", qty: 10 }
        ], 0)
    );

    // Day 3 Transactions
    transactions.push(
        createSimulatedTx(1007, `${day3}T08:15:00`, [
            { id: "prod_amul_milk", qty: 6 },
            { id: "prod_amul_paneer", qty: 2 }
        ], 0),
        createSimulatedTx(1008, `${day3}T14:40:00`, [
            { id: "prod_surf_excel", qty: 1 },
            { id: "prod_vim_liquid", qty: 2 },
            { id: "prod_exo_bar", qty: 3 }
        ], 8),
        createSimulatedTx(1009, `${day3}T19:30:00`, [
            { id: "prod_notebook_a4", qty: 5 },
            { id: "prod_pencils_10p", qty: 2 },
            { id: "prod_agarbatti", qty: 2 }
        ], 0),
        createSimulatedTx(1010, `${day3}T21:00:00`, [
            { id: "prod_dairy_milk", qty: 4 },
            { id: "prod_lays_salted", qty: 5 },
            { id: "prod_coke_1.25", qty: 3 }
        ], 5)
    );

    // Force aggregates and stocks update
    recomputeProductAggregates();

    // Redraw UI components
    renderPOSProducts();
    updateCartUI();
    renderInventory();
    renderTransactionsTable();
    updateAnalytics();
}

function createSimulatedTx(billId, dateStr, itemsArr, discountPercent) {
    let subtotal = 0;
    let totalCost = 0;
    const billItems = [];

    itemsArr.forEach(item => {
        const prod = DEFAULT_PRODUCTS.find(p => p.id === item.id);
        const itemSellingTotal = prod.selling_price * item.qty;
        const itemCostTotal = prod.cost_price * item.qty;

        subtotal += itemSellingTotal;
        totalCost += itemCostTotal;

        billItems.push({
            id: prod.id,
            name: prod.name,
            category: prod.category,
            quantity: item.qty,
            cost_price: prod.cost_price,
            selling_price: prod.selling_price,
            unit: prod.unit,
            total_selling: itemSellingTotal,
            total_cost: itemCostTotal
        });
    });

    const discountAmount = subtotal * (discountPercent / 100);
    const grandTotal = subtotal - discountAmount;
    const totalProfit = grandTotal - totalCost;

    return {
        id: `#${billId}`,
        timestamp: new Date(dateStr).toISOString(),
        items: billItems,
        subtotal: subtotal,
        discountPercent: discountPercent,
        discountAmount: discountAmount,
        grandTotal: grandTotal,
        totalCost: totalCost,
        totalProfit: totalProfit,
        totalItems: billItems.reduce((acc, c) => acc + c.quantity, 0)
    };
}
