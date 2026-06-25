# Krishna Kirana Shop - Supermarket Daily Sales Tracker

A professional, high-fidelity daily sales tracker and point-of-sale (POS) cashier invoicing software designed to look and feel like real Indian supermarkets such as D-Mart, Reliance Smart, and More. The application is built with a Python Flask backend, SQLite database, Bootstrap 5 frontend, Chart.js analytics, and ReportLab PDF invoice generation.

---

## 🚀 Technology Stack

*   **Backend Server**: Python Flask
*   **Database**: SQLite (`database/shop.db`)
*   **Frontend Layout**: HTML5, CSS3, JavaScript (ES6), Bootstrap 5
*   **Visualization Charts**: Chart.js
*   **Report Generation**: ReportLab PDF library

---

## 🌟 Key Features

1.  **Home Dashboard**:
    *   Metrics cards: Today's Revenue, Profit, Transactions, and Total Products Sold.
    *   Warning cards: Low Stock Products count and Out of Stock Products count.
    *   Dynamic notifications list highlighting stock outages.
    *   Seeded line charts for Daily/Weekly/Monthly Revenue.
2.  **Product Catalog Shelf (10 Categories)**:
    *   🥦 Vegetables (Onion, Tomato, Potato, Green Chilli, Brinjal, Carrot, Beetroot, Cabbage, Spinach, Ginger)
    *   🍫 Chocolates (Dairy Milk, Dairy Milk Silk, KitKat, Five Star, Perk, Munch, Gems, Snickers, Milky Bar, Fuse)
    *   🍪 Biscuits (Parle-G, Good Day, Oreo, Bourbon, Hide & Seek, Marie Gold, Tiger, Milk Bikis, Sunfeast, Unibic)
    *   🥤 Cool Drinks (Coca Cola, Pepsi, Sprite, Fanta, Thums Up, Maaza, 7UP, Limca, Mountain Dew, Sting)
    *   🥛 Milk & Dairy (Milk Packet, Curd Packet, Buttermilk, Lassi, Paneer, Butter, Ghee, Cheese, Flavoured Milk, Cream)
    *   🍚 Groceries (Rice, Sugar, Salt, Toor Dal, Moong Dal, Chana Dal, Wheat Flour, Rava, Poha, Jaggery)
    *   🧴 Home Essentials (Clinic Plus, Santoor, Lux, Lifebuoy, Surf Excel, Rin, Ariel, Tide...)
    *   💄 Beauty Products (Lipstick, Kajal, Nail Polish, Perfume...)
    *   🍿 Snacks (Lays, Kurkure, Bingo, Mixture...)
    *   🥚 Bakery & Eggs (Eggs, Bread, Buns, Muffin...)
3.  **Product Variations & Size Toggles**:
    *   Each product card groups variations (e.g. weights: 250g, 500g, 1kg; prices: ₹10, ₹20; bottle capacities: 500ml, 1L).
    *   Changing variations instantly updates the unit price, stock gauge, and stock alerts.
4.  **Quantity & Discount Controls**:
    *   Cashier adjusts quantities using `[-] qty [+]` buttons (capped at current stock).
    *   Cashier selects whitelisted discount values (`0%, 5%, 10%, 15%, 20%, 25%, 30%, 40%, 50%`). Blocks custom invalid numbers.
5.  **Interactive POS Cart**:
    *   Lists items with columns: Product, Category, Qty, Rate, Discount, Amount, Actions.
    *   Cashiers can adjust quantities, modify whitelisted discounts, remove individual items, or clear the entire cart.
6.  **Customer Billing Desk**:
    *   Compiles a professional supermarket thermal invoice.
    *   Client profiler inputs (Customer Name, Customer Mobile Number).
    *   Payment mode selectors (Cash, UPI, Card).
    *   Triggers receipt print layout previews and handles ReportLab PDF invoice downloads.
7.  **Inventory Management Center**:
    *   Full spreadsheet overview of cost prices, selling prices, and stock numbers.
    *   Filter by Category and by Stock Status.
    *   Dynamic warning alerts: `⚠ LOW STOCK` (stock <= 10) and `🚫 OUT OF STOCK` (stock = 0).
    *   Quick restock buttons (+50 units).
8.  **Reports & Invoices Log**:
    *   Searchable log table of all bills generated in the store.
    *   Options to view thermal invoice previews and download duplicate PDF reports.
9.  **System Controls & Simulator**:
    *   One-click simulated transactional seeder (generates 3 days of transaction data across 10 invoice logs).
    *   Warehouse replenishments and database factory resets.

---

## 🔑 Cashier Credentials

Access the cashier portal using the following credentials:
*   **Username**: `admin`
*   **Password**: `admin`

---

## 🛠️ Local Setup Guide

Follow these steps to run the application on your computer:

### Step 1: Install Dependencies
Open a terminal in the project directory and install the required Python packages:
```bash
pip install Flask reportlab
```

### Step 2: Start the Application Server
Run the Flask server script:
```bash
python app.py
```

### Step 3: Access the Supermarket Portal
Open your web browser and navigate to:
```
http://127.0.0.1:8080/
```

---

## 📋 Completed Test Log Report

| Test Input | Expected Output | Actual Output | Pass/Fail |
| :--- | :--- | :--- | :--- |
| **Log 5 sales transactions across 3 products** | Checkout logs transactions, deducts stock, and registers stats. | Invoice INV-1011 processed, stock decreased correctly, statistics updated. | **Pass** |
| **Log sales for 3 simulated days** | Ledger totals match manual calculations; charts and product margin tables render. | 10 historical simulated transactions seeded. Chart.js trends populated. | **Pass** |
| **Verify Profit Calculation** | $\text{Profit} = \text{Selling Price} - \text{Cost Price}$ (minus discounts). | Calculated profit matches. Net profit of ₹466.65 verified for mock seed data. | **Pass** |
| **Verify product sorting** | Inventory table filters by category and stock statuses. | Search, filters, and columns display correct classifications. | **Pass** |
| **Verify input constraints** | Rejects negative or zero quantities. Enforces whitelisted discount rates. | Input limits prevent stock overflows. Discount steps cycle safely. | **Pass** |
