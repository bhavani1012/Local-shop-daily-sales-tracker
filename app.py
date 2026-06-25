import os
import sqlite3
import datetime
import uuid
from flask import Flask, render_template, request, jsonify, send_file, redirect, url_for, session, make_response
from io import BytesIO
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors

app = Flask(__name__)
app.secret_key = "supermarket_pos_secret_key"

# Helper for session-specific cart ID
def get_cart_session_id():
    if 'cart_session_id' not in session:
        session['cart_session_id'] = str(uuid.uuid4())
    return session['cart_session_id']

# Helper to format ISO date string to show Day name, e.g. "Wednesday, 24/06/2026"
def format_invoice_date(date_str):
    try:
        dt = datetime.date.fromisoformat(date_str)
        day_name = dt.strftime("%A") # Wednesday
        return f"{day_name}, {dt.strftime('%d/%m/%Y')}"
    except Exception:
        return date_str


DATABASE_DIR = os.path.join(app.root_path, "database")
DATABASE_PATH = os.path.join(DATABASE_DIR, "shop.db")

# Helper to connect to SQLite
def get_db():
    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = sqlite3.Row
    return conn

# Database Initialization
def init_db():
    if not os.path.exists(DATABASE_DIR):
        os.makedirs(DATABASE_DIR)
        
    conn = get_db()
    cursor = conn.cursor()
    
    # 1. Create Tables
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        size TEXT NOT NULL,
        cost_price REAL NOT NULL,
        selling_price REAL NOT NULL
    )
    """)
    
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS inventory (
        product_id INTEGER PRIMARY KEY,
        stock INTEGER NOT NULL,
        reorder_level INTEGER NOT NULL,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    )
    """)
    
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS cart (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id TEXT NOT NULL,
        product_id INTEGER NOT NULL,
        quantity INTEGER NOT NULL,
        discount INTEGER NOT NULL,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    )
    """)
    
    # Check if session_id column exists in cart, if not, add it (migration for existing database)
    cursor.execute("PRAGMA table_info(cart)")
    columns = [row[1] for row in cursor.fetchall()]
    if columns and "session_id" not in columns:
        cursor.execute("ALTER TABLE cart ADD COLUMN session_id TEXT NOT NULL DEFAULT 'default'")

    
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS invoices (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        invoice_number TEXT UNIQUE NOT NULL,
        customer_name TEXT,
        customer_phone TEXT,
        date TEXT NOT NULL,
        time TEXT NOT NULL,
        subtotal REAL NOT NULL,
        total_discount REAL NOT NULL,
        grand_total REAL NOT NULL,
        payment_method TEXT NOT NULL
    )
    """)
    
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS sales (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        invoice_id INTEGER NOT NULL,
        product_id INTEGER NOT NULL,
        quantity INTEGER NOT NULL,
        rate REAL NOT NULL,
        discount INTEGER NOT NULL,
        amount REAL NOT NULL,
        cost_price REAL NOT NULL,
        FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    )
    """)
    
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS customers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        phone TEXT UNIQUE NOT NULL
    )
    """)
    
    conn.commit()
    
    # 2. Seed default items if table is empty
    cursor.execute("SELECT COUNT(*) FROM products")
    if cursor.fetchone()[0] == 0:
        seed_products(cursor)
        
    conn.commit()
    conn.close()

# Seeding dynamic items
def seed_products(cursor):
    # 10 categories, each with 10 products
    catalog = {
        "🥬 Vegetables": {
            "items": ["Onion", "Tomato", "Potato", "Green Chilli", "Brinjal", "Carrot", "Beetroot", "Cabbage", "Spinach", "Ginger"],
            "sizes": ["250g", "500g", "750g", "1kg", "2kg", "5kg"],
            "base_cost": 30, "base_selling": 40, "unit_multiplier": {
                "250g": 0.25, "500g": 0.5, "750g": 0.75, "1kg": 1.0, "2kg": 1.9, "5kg": 4.5
            }
        },
        "🍫 Chocolates": {
            "items": ["Dairy Milk", "Dairy Milk Silk", "KitKat", "Five Star", "Perk", "Munch", "Gems", "Snickers", "Milky Bar", "Fuse"],
            "sizes": ["₹10 Pack", "₹20 Pack", "₹50 Pack", "₹100 Pack"],
            "base_cost": 8, "base_selling": 10, "unit_multiplier": {
                "₹10 Pack": 1.0, "₹20 Pack": 2.0, "₹50 Pack": 5.0, "₹100 Pack": 10.0
            }
        },
        "🍪 Biscuits": {
            "items": ["Parle-G", "Good Day", "Oreo", "Bourbon", "Hide & Seek", "Marie Gold", "Tiger", "Milk Bikis", "Sunfeast", "Unibic"],
            "sizes": ["₹10 Pack", "₹20 Pack", "₹50 Pack", "₹100 Pack"],
            "base_cost": 8, "base_selling": 10, "unit_multiplier": {
                "₹10 Pack": 1.0, "₹20 Pack": 2.0, "₹50 Pack": 5.0, "₹100 Pack": 10.0
            }
        },
        "🥤 Cool Drinks": {
            "items": ["Coca Cola", "Pepsi", "Sprite", "Fanta", "Thums Up", "Maaza", "7UP", "Limca", "Mountain Dew", "Sting"],
            "sizes": ["250ml", "500ml", "1L", "2L"],
            "base_cost": 15, "base_selling": 20, "unit_multiplier": {
                "250ml": 1.0, "500ml": 2.5, "1L": 4.5, "2L": 8.0
            }
        },
        "🥛 Milk & Dairy": {
            "items": ["Milk Packet", "Curd Packet", "Buttermilk", "Lassi", "Paneer", "Butter", "Ghee", "Cheese", "Flavoured Milk", "Cream"],
            "sizes": ["250ml", "500ml", "1L", "2L"],
            "base_cost": 22, "base_selling": 26, "unit_multiplier": {
                "250ml": 1.0, "500ml": 1.9, "1L": 3.5, "2L": 6.0
            }
        },
        "🍚 Groceries": {
            "items": ["Rice", "Sugar", "Salt", "Toor Dal", "Moong Dal", "Chana Dal", "Wheat Flour", "Rava", "Poha", "Jaggery"],
            "sizes": ["500g", "1kg", "2kg", "5kg", "10kg"],
            "base_cost": 30, "base_selling": 36, "unit_multiplier": {
                "500g": 0.5, "1kg": 1.0, "2kg": 1.95, "5kg": 4.8, "10kg": 9.2
            }
        },
        "🧴 Home Essentials": {
            # Handled differently below due to sub-types (Shampoo sachet/bottle, Soaps, Detergents)
            "is_essentials": True
        },
        "💄 Beauty Products": {
            "items": ["Lipstick", "Kajal", "Nail Polish", "Face Powder", "Perfume", "Earrings", "Bangles", "Chains", "Hair Clips", "Compact"],
            "sizes": ["Standard"],
            "base_cost": 45, "base_selling": 60, "unit_multiplier": {"Standard": 1.0}
        },
        "🍿 Snacks": {
            "items": ["Lays", "Kurkure", "Bingo", "Mixture", "Murukulu", "Banana Chips", "Corn Rings", "Popcorn", "Chikki", "Aloo Bhujia"],
            "sizes": ["Small (₹10)", "Medium (₹20)", "Family Pack (₹50)"],
            "base_cost": 8, "base_selling": 10, "unit_multiplier": {
                "Small (₹10)": 1.0, "Medium (₹20)": 2.0, "Family Pack (₹50)": 5.0
            }
        },
        "🥚 Bakery & Eggs": {
            "items": ["Eggs", "Bread", "Buns", "Muffin", "Puff", "Cake Slice", "Donut", "Rusk", "Cookies", "Garlic Bread"],
            "sizes": ["Standard"],
            "base_cost": 25, "base_selling": 30, "unit_multiplier": {"Standard": 1.0}
        }
    }

    item_factors = {
        # Vegetables
        "Onion": 1.0, "Tomato": 1.2, "Potato": 0.8, "Green Chilli": 1.5, "Brinjal": 0.9,
        "Carrot": 1.1, "Beetroot": 1.0, "Cabbage": 0.7, "Spinach": 0.6, "Ginger": 2.0,
        
        # Chocolates
        "Dairy Milk": 1.0, "Dairy Milk Silk": 2.2, "KitKat": 1.2, "Five Star": 0.8, "Perk": 0.5,
        "Munch": 0.5, "Gems": 0.7, "Snickers": 1.3, "Milky Bar": 0.9, "Fuse": 1.1,
        
        # Biscuits
        "Parle-G": 0.5, "Good Day": 1.2, "Oreo": 1.3, "Bourbon": 1.1, "Hide & Seek": 1.6,
        "Marie Gold": 0.8, "Tiger": 0.6, "Milk Bikis": 0.9, "Sunfeast": 1.2, "Unibic": 1.5,
        
        # Cool Drinks
        "Coca Cola": 1.0, "Pepsi": 1.0, "Sprite": 1.0, "Fanta": 1.0, "Thums Up": 1.0,
        "Maaza": 1.1, "7UP": 0.9, "Limca": 0.9, "Mountain Dew": 1.1, "Sting": 1.0,
        
        # Milk & Dairy
        "Milk Packet": 1.0, "Curd Packet": 0.9, "Buttermilk": 0.6, "Lassi": 1.1, "Paneer": 2.0,
        "Butter": 2.2, "Ghee": 3.5, "Cheese": 2.4, "Flavoured Milk": 1.3, "Cream": 1.8,
        
        # Groceries
        "Rice": 2.2, "Sugar": 1.0, "Salt": 0.5, "Toor Dal": 1.8, "Moong Dal": 1.7,
        "Chana Dal": 1.6, "Wheat Flour": 1.2, "Rava": 0.9, "Poha": 0.8, "Jaggery": 1.3,
        
        # Beauty Products
        "Lipstick": 1.5, "Kajal": 0.8, "Nail Polish": 0.7, "Face Powder": 1.2, "Perfume": 2.5,
        "Earrings": 0.6, "Bangles": 0.5, "Chains": 2.2, "Hair Clips": 0.3, "Compact": 1.4,
        
        # Snacks
        "Lays": 1.0, "Kurkure": 1.0, "Bingo": 1.0, "Mixture": 1.2, "Murukulu": 1.1,
        "Banana Chips": 1.3, "Corn Rings": 0.8, "Popcorn": 0.6, "Chikki": 0.9, "Aloo Bhujia": 1.2,
        
        # Bakery & Eggs
        "Eggs": 0.6, "Bread": 1.0, "Buns": 0.8, "Muffin": 1.4, "Puff": 1.0,
        "Cake Slice": 1.6, "Donut": 1.4, "Rusk": 0.9, "Cookies": 1.8, "Garlic Bread": 2.0,
        
        # Home Essentials
        # Shampoos
        "Clinic Plus": 0.8, "Meera": 0.9, "Dove": 1.4, "Sunsilk": 1.1, "Pantene": 1.2,
        # Soaps
        "Lifebuoy": 0.8, "Santoor": 1.0, "Lux": 1.0, "Mysore Sandal": 1.4, "Dove Soap": 1.6,
        # Detergents
        "Wheel": 0.7, "Rin": 1.0, "Tide": 1.1, "Surf Excel": 1.4, "Ariel": 1.5
    }

    product_id_counter = 1
    
    for category_name, data in catalog.items():
        if "is_essentials" in data:
            # Seed Shampoos, Soaps, Detergents
            shampoos = ["Clinic Plus", "Meera", "Dove", "Sunsilk", "Pantene"]
            shampoo_sizes = ["₹1 Sachet", "₹2 Sachet", "₹5 Sachet", "₹10 Sachet", "Bottle"]
            shampoo_multiplier = {"₹1 Sachet": 0.8, "₹2 Sachet": 1.6, "₹5 Sachet": 4.0, "₹10 Sachet": 8.0, "Bottle": 120.0}
            
            for item in shampoos:
                for size in shampoo_sizes:
                    factor = item_factors.get(item, 1.0)
                    cp = 1.0 * shampoo_multiplier[size] * factor
                    sp = 1.25 * shampoo_multiplier[size] * factor
                    # Format prices
                    cp = round(cp, 2)
                    sp = round(sp, 2)
                    # Clinic Plus sachet has 200 stock
                    stock = 200 if (item == "Clinic Plus" and "Sachet" in size) else 100
                    reorder = 15
                    
                    cursor.execute("INSERT INTO products (id, name, category, size, cost_price, selling_price) VALUES (?, ?, ?, ?, ?, ?)",
                                   (product_id_counter, item, "🧴 Home Essentials", size, cp, sp))
                    cursor.execute("INSERT INTO inventory (product_id, stock, reorder_level) VALUES (?, ?, ?)",
                                   (product_id_counter, stock, reorder))
                    product_id_counter += 1
            
            soaps = ["Santoor", "Lux", "Lifebuoy", "Dove Soap", "Mysore Sandal"]
            soap_sizes = ["Small", "Medium", "Large"]
            soap_multiplier = {"Small": 10.0, "Medium": 22.0, "Large": 38.0}
            
            for item in soaps:
                for size in soap_sizes:
                    factor = item_factors.get(item, 1.0)
                    cp = 0.8 * soap_multiplier[size] * factor
                    sp = 1.0 * soap_multiplier[size] * factor
                    cp = round(cp, 2)
                    sp = round(sp, 2)
                    
                    cursor.execute("INSERT INTO products (id, name, category, size, cost_price, selling_price) VALUES (?, ?, ?, ?, ?, ?)",
                                   (product_id_counter, item, "🧴 Home Essentials", size, cp, sp))
                    cursor.execute("INSERT INTO inventory (product_id, stock, reorder_level) VALUES (?, ?, ?)",
                                   (product_id_counter, 100, 10))
                    product_id_counter += 1

            detergents = ["Surf Excel", "Rin", "Wheel", "Ariel", "Tide"]
            detergent_sizes = ["500g", "1kg", "2kg"]
            detergent_multiplier = {"500g": 50.0, "1kg": 95.0, "2kg": 180.0}
            
            for item in detergents:
                for size in detergent_sizes:
                    factor = item_factors.get(item, 1.0)
                    cp = 0.82 * detergent_multiplier[size] * factor
                    sp = 1.0 * detergent_multiplier[size] * factor
                    cp = round(cp, 2)
                    sp = round(sp, 2)
                    
                    # Out of stock simulation: Surf Excel - 2kg has 0 stock
                    stock = 0 if (item == "Surf Excel" and size == "2kg") else 100
                    reorder = 10
                    
                    cursor.execute("INSERT INTO products (id, name, category, size, cost_price, selling_price) VALUES (?, ?, ?, ?, ?, ?)",
                                   (product_id_counter, item, "🧴 Home Essentials", size, cp, sp))
                    cursor.execute("INSERT INTO inventory (product_id, stock, reorder_level) VALUES (?, ?, ?)",
                                   (product_id_counter, stock, reorder))
                    product_id_counter += 1
            continue

        for item in data["items"]:
            for size in data["sizes"]:
                mult = data["unit_multiplier"][size]
                factor = item_factors.get(item, 1.0)
                cp = round(data["base_cost"] * mult * factor, 2)
                sp = round(data["base_selling"] * mult * factor, 2)
                
                # Default Stock logic
                stock = 100
                reorder = 10
                
                if item == "Onion":
                    stock = 100
                    # Simulation: Onion 5kg has low stock (6)
                    if size == "5kg":
                        stock = 6
                elif item == "Tomato":
                    stock = 80
                elif item == "Dairy Milk":
                    stock = 50
                    if size == "₹100 Pack":
                        stock = 4 # Low stock
                elif item == "Parle-G":
                    stock = 100
                elif item == "KitKat" and size == "₹100 Pack":
                    # Out of stock simulation
                    stock = 0
                
                cursor.execute("INSERT INTO products (id, name, category, size, cost_price, selling_price) VALUES (?, ?, ?, ?, ?, ?)",
                               (product_id_counter, item, category_name, size, cp, sp))
                cursor.execute("INSERT INTO inventory (product_id, stock, reorder_level) VALUES (?, ?, ?)",
                               (product_id_counter, stock, reorder))
                product_id_counter += 1

# Seed mock sales transaction history for analytics (3 days of data)
def seed_mock_transactions():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) FROM invoices")
    if cursor.fetchone()[0] > 0:
        conn.close()
        return
    
    # Let's seed 10 mock transactions over past 3 days (June 20, 21, 22; today is June 23)
    today = datetime.date.today()
    d1 = today - datetime.timedelta(days=3)
    d2 = today - datetime.timedelta(days=2)
    d3 = today - datetime.timedelta(days=1)
    
    # We select some item IDs from products
    # To be safe, let's select known items like Onion (1kg), Tomato (1kg), Dairy Milk (₹20), Parle-G (Medium), Pepsi (1L), Rice (5kg)
    # We can fetch IDs dynamically
    cursor.execute("SELECT id, selling_price, cost_price FROM products WHERE name='Onion' AND size='1kg'")
    onion_1kg = cursor.fetchone()
    cursor.execute("SELECT id, selling_price, cost_price FROM products WHERE name='Tomato' AND size='1kg'")
    tomato_1kg = cursor.fetchone()
    cursor.execute("SELECT id, selling_price, cost_price FROM products WHERE name='Dairy Milk' AND size='₹20 Pack'")
    dm_20 = cursor.fetchone()
    cursor.execute("SELECT id, selling_price, cost_price FROM products WHERE name='Parle-G' AND size='₹20 Pack'")
    parle_med = cursor.fetchone()
    cursor.execute("SELECT id, selling_price, cost_price FROM products WHERE name='Pepsi' AND size='1L'")
    pepsi_1l = cursor.fetchone()
    cursor.execute("SELECT id, selling_price, cost_price FROM products WHERE name='Rice' AND size='5kg'")
    rice_5kg = cursor.fetchone()
    cursor.execute("SELECT id, selling_price, cost_price FROM products WHERE name='Milk Packet' AND size='1L'")
    milk_1l = cursor.fetchone()
    cursor.execute("SELECT id, selling_price, cost_price FROM products WHERE name='Eggs' AND size='Standard'")
    eggs = cursor.fetchone()

    mock_baskets = [
        # Day 1: 3 tx
        {"date": d1.isoformat(), "time": "09:30:00", "pay": "Cash", "c_name": "Rohan Sharma", "c_phone": "9876543210", "disc": 0, "items": [(onion_1kg, 2), (tomato_1kg, 3), (dm_20, 5)]},
        {"date": d1.isoformat(), "time": "14:15:00", "pay": "UPI", "c_name": "Priya Patel", "c_phone": "9123456780", "disc": 10, "items": [(parle_med, 4), (pepsi_1l, 3)]},
        {"date": d1.isoformat(), "time": "19:00:00", "pay": "Card", "c_name": "Amit Verma", "c_phone": "9988776655", "disc": 5, "items": [(rice_5kg, 1), (milk_1l, 2), (eggs, 1)]},
        
        # Day 2: 3 tx
        {"date": d2.isoformat(), "time": "10:00:00", "pay": "UPI", "c_name": "Sita Rao", "c_phone": "9345678901", "disc": 0, "items": [(onion_1kg, 3), (tomato_1kg, 2), (milk_1l, 4)]},
        {"date": d2.isoformat(), "time": "15:30:00", "pay": "Cash", "c_name": "John Doe", "c_phone": "9444455555", "disc": 15, "items": [(dm_20, 10), (pepsi_1l, 2)]},
        {"date": d2.isoformat(), "time": "20:45:00", "pay": "UPI", "c_name": "Vikram Singh", "c_phone": "9555566666", "disc": 0, "items": [(rice_5kg, 3), (eggs, 2)]},
        
        # Day 3: 4 tx
        {"date": d3.isoformat(), "time": "08:30:00", "pay": "Cash", "c_name": "Harish Kumar", "c_phone": "9666677777", "disc": 0, "items": [(milk_1l, 6), (onion_1kg, 4)]},
        {"date": d3.isoformat(), "time": "12:00:00", "pay": "Card", "c_name": "Kiran Sen", "c_phone": "9777788888", "disc": 5, "items": [(tomato_1kg, 5), (parle_med, 10)]},
        {"date": d3.isoformat(), "time": "17:15:00", "pay": "UPI", "c_name": "Ananya Dey", "c_phone": "9888899999", "disc": 20, "items": [(pepsi_1l, 5), (dm_20, 8)]},
        {"date": d3.isoformat(), "time": "21:30:00", "pay": "Cash", "c_name": "Sunil Nair", "c_phone": "9999900000", "disc": 0, "items": [(rice_5kg, 2), (eggs, 3), (onion_1kg, 2)]}
    ]

    bill_counter = 1001
    for mb in mock_baskets:
        inv_no = f"INV-{bill_counter}"
        
        # Calculate subtotal, discount, grand total
        subtotal = 0
        total_cost = 0
        sale_rows = []
        for p_tup, qty in mb["items"]:
            if not p_tup:
                continue
            p_id, sp, cp = p_tup
            amount = sp * qty
            subtotal += amount
            total_cost += cp * qty
            sale_rows.append((p_id, qty, sp, cp, amount))
            
        discount_amount = subtotal * (mb["disc"] / 100.0)
        grand_total = subtotal - discount_amount
        
        # Insert customer if not exists
        if mb["c_phone"]:
            cursor.execute("INSERT OR IGNORE INTO customers (name, phone) VALUES (?, ?)", (mb["c_name"], mb["c_phone"]))
            
        # Insert Invoice
        cursor.execute("""
        INSERT INTO invoices (invoice_number, customer_name, customer_phone, date, time, subtotal, total_discount, grand_total, payment_method)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (inv_no, mb["c_name"], mb["c_phone"], mb["date"], mb["time"], subtotal, discount_amount, grand_total, mb["pay"]))
        
        invoice_id = cursor.lastrowid
        
        # Insert Sales
        for p_id, qty, sp, cp, amount in sale_rows:
            # Snapshotted cost price and sale info
            # Apply checkout discount to invoice row amounts
            item_disc_val = amount * (mb["disc"] / 100.0)
            item_grand_total = amount - item_disc_val
            cursor.execute("""
            INSERT INTO sales (invoice_id, product_id, quantity, rate, discount, amount, cost_price)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (invoice_id, p_id, qty, sp, mb["disc"], item_grand_total, cp))
            
            # Deduct stock
            cursor.execute("UPDATE inventory SET stock = MAX(0, stock - ?) WHERE product_id = ?", (qty, p_id))
            
        bill_counter += 1

    conn.commit()
    conn.close()

# ROUTE SECURITY MIDDLEWARE
def login_required(f):
    # For a local billing app, we'll auto-login or provide a simple session login
    # Check if user is logged in
    from functools import wraps
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'logged_in' not in session:
            # Redirect to welcome login
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    return decorated_function

# --- PAGES ---

@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        username = request.form.get("username")
        password = request.form.get("password")
        if username == "admin" and password == "admin":
            session["logged_in"] = True
            session["user"] = "Supermarket Owner"
            return redirect(url_for('dashboard'))
        else:
            return render_template("login.html", error="Invalid Username or Password (use admin/admin)")
    return render_template("login.html")

@app.route("/logout")
def logout():
    session.clear()
    return redirect(url_for('login'))

@app.route("/")
@login_required
def root():
    return redirect(url_for('dashboard'))

@app.route("/dashboard")
@login_required
def dashboard():
    conn = get_db()
    cursor = conn.cursor()
    
    # Today's date string YYYY-MM-DD
    today_str = datetime.date.today().isoformat()
    
    # Today stats
    cursor.execute("SELECT SUM(grand_total), SUM(subtotal - grand_total), COUNT(*) FROM invoices WHERE date = ?", (today_str,))
    today_row = cursor.fetchone()
    today_revenue = today_row[0] or 0.0
    today_disc = today_row[1] or 0.0
    today_trans = today_row[2] or 0
    
    # Today's profit = sum of (sales.amount) - sum of (sales.cost_price * sales.quantity) for today
    cursor.execute("""
        SELECT SUM(sales.amount - (sales.cost_price * sales.quantity)) 
        FROM sales 
        JOIN invoices ON sales.invoice_id = invoices.id 
        WHERE invoices.date = ?
    """, (today_str,))
    today_profit = cursor.fetchone()[0] or 0.0
    
    # Total Products Sold today
    cursor.execute("""
        SELECT SUM(sales.quantity) 
        FROM sales 
        JOIN invoices ON sales.invoice_id = invoices.id 
        WHERE invoices.date = ?
    """, (today_str,))
    today_items_sold = cursor.fetchone()[0] or 0
    
    # Low stock & Out of stock counts
    cursor.execute("SELECT COUNT(*) FROM inventory WHERE stock > 0 AND stock <= reorder_level")
    low_stock_count = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM inventory WHERE stock = 0")
    out_stock_count = cursor.fetchone()[0]
    
    # Top Selling Product
    cursor.execute("""
        SELECT products.name, products.size, SUM(sales.quantity) as q 
        FROM sales 
        JOIN products ON sales.product_id = products.id 
        GROUP BY sales.product_id 
        ORDER BY q DESC LIMIT 1
    """)
    top_selling_row = cursor.fetchone()
    top_selling = f"{top_selling_row['name']} ({top_selling_row['size']})" if top_selling_row else "N/A"
    
    # Most Purchased Product (in terms of transaction count appearance)
    cursor.execute("""
        SELECT products.name, products.size, COUNT(sales.invoice_id) as c 
        FROM sales 
        JOIN products ON sales.product_id = products.id 
        GROUP BY sales.product_id 
        ORDER BY c DESC LIMIT 1
    """)
    most_purchased_row = cursor.fetchone()
    most_purchased = f"{most_purchased_row['name']} ({most_purchased_row['size']})" if most_purchased_row else "N/A"
    
    # Notifications List
    cursor.execute("""
        SELECT products.name, products.size, inventory.stock, inventory.reorder_level 
        FROM inventory 
        JOIN products ON inventory.product_id = products.id 
        WHERE inventory.stock <= inventory.reorder_level
        ORDER BY inventory.stock ASC
    """)
    notifications_raw = cursor.fetchall()
    notifications = []
    for row in notifications_raw:
        if row['stock'] == 0:
            notifications.append(f"🚫 {row['name']} ({row['size']}) Out Of Stock")
        else:
            notifications.append(f"⚠ {row['name']} ({row['size']}) Low Stock ({row['stock']} remaining)")
            
    conn.close()
    
    return render_template("dashboard.html",
                           revenue=today_revenue,
                           profit=today_profit,
                           transactions=today_trans,
                           sold_count=today_items_sold,
                           low_stock=low_stock_count,
                           out_stock=out_stock_count,
                           top_selling=top_selling,
                           most_purchased=most_purchased,
                           notifications=notifications[:6]) # Display top 6 alerts

@app.route("/categories")
@login_required
def categories():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT DISTINCT category FROM products")
    cats = [row[0] for row in cursor.fetchall()]
    conn.close()
    return render_template("categories.html", categories=cats)

@app.route("/products/<category_name>")
@login_required
def products_page(category_name):
    # Ensure category name matches SQLite format
    conn = get_db()
    cursor = conn.cursor()
    
    # Find all base product names for variations grouping
    # E.g. base name "Onion" has sizes "250g", "500g"
    cursor.execute("""
        SELECT products.id, products.name, products.category, products.size, products.selling_price, inventory.stock 
        FROM products 
        JOIN inventory ON products.id = inventory.product_id 
        WHERE products.category = ?
        ORDER BY products.name, products.selling_price ASC
    """, (category_name,))
    
    rows = cursor.fetchall()
    conn.close()
    
    # Group items by base product name
    grouped_products = {}
    for r in rows:
        base_name = r['name']
        if base_name not in grouped_products:
            grouped_products[base_name] = []
        grouped_products[base_name].append({
            'id': r['id'],
            'size': r['size'],
            'price': r['selling_price'],
            'stock': r['stock']
        })
        
    return render_template("products.html", category=category_name, grouped_products=grouped_products)

@app.route("/cart")
@login_required
def cart_page():
    session_id = get_cart_session_id()
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT cart.id as cart_id, cart.quantity, cart.discount, products.id as prod_id, products.name, products.category, products.size, products.selling_price, inventory.stock 
        FROM cart 
        JOIN products ON cart.product_id = products.id 
        JOIN inventory ON products.id = inventory.product_id
        WHERE cart.session_id = ?
    """, (session_id,))
    cart_items = cursor.fetchall()
    
    # Compute totals
    subtotal = 0.0
    total_discount = 0.0
    
    processed_items = []
    for item in cart_items:
        raw_amt = item['selling_price'] * item['quantity']
        disc_amt = raw_amt * (item['discount'] / 100.0)
        final_amt = raw_amt - disc_amt
        
        subtotal += raw_amt
        total_discount += disc_amt
        
        processed_items.append({
            'cart_id': item['cart_id'],
            'prod_id': item['prod_id'],
            'name': item['name'],
            'category': item['category'],
            'size': item['size'],
            'quantity': item['quantity'],
            'rate': item['selling_price'],
            'discount': item['discount'],
            'amount': final_amt,
            'stock': item['stock']
        })
        
    grand_total = subtotal - total_discount
    conn.close()
    
    return render_template("cart.html", items=processed_items, subtotal=subtotal, total_discount=total_discount, grand_total=grand_total)

@app.route("/billing")
@login_required
def billing_page():
    session_id = get_cart_session_id()
    # If cart is empty, redirect to cart page
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) FROM cart WHERE session_id = ?", (session_id,))
    if cursor.fetchone()[0] == 0:
        conn.close()
        return redirect(url_for('cart_page'))
        
    cursor.execute("""
        SELECT cart.id as cart_id, cart.quantity, cart.discount, products.name, products.size, products.selling_price 
        FROM cart 
        JOIN products ON cart.product_id = products.id
        WHERE cart.session_id = ?
    """, (session_id,))
    items = cursor.fetchall()
    
    subtotal = 0.0
    total_discount = 0.0
    processed_items = []
    
    for item in items:
        raw_amt = item['selling_price'] * item['quantity']
        disc_amt = raw_amt * (item['discount'] / 100.0)
        final_amt = raw_amt - disc_amt
        
        subtotal += raw_amt
        total_discount += disc_amt
        processed_items.append({
            'cart_id': item['cart_id'],
            'name': f"{item['name']} ({item['size']})",
            'quantity': item['quantity'],
            'rate': item['selling_price'],
            'discount': item['discount'],
            'amount': final_amt
        })
        
    grand_total = subtotal - total_discount
    conn.close()
    
    return render_template("billing.html", items=processed_items, subtotal=subtotal, total_discount=total_discount, grand_total=grand_total)

@app.route("/inventory")
@login_required
def inventory_page():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT products.id, products.name, products.category, products.size, products.cost_price, products.selling_price, inventory.stock, inventory.reorder_level 
        FROM products 
        JOIN inventory ON products.id = inventory.product_id
        ORDER BY products.category, products.name ASC
    """)
    inventory_items = cursor.fetchall()
    
    cursor.execute("SELECT DISTINCT category FROM products")
    cats = [row[0] for row in cursor.fetchall()]
    conn.close()
    
    return render_template("inventory.html", items=inventory_items, categories=cats)

@app.route("/analytics")
@login_required
def analytics_page():
    # Render analytics shell page, dynamic statistics fetched via APIs
    return render_template("analytics.html")

@app.route("/reports")
@login_required
def reports_page():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM invoices ORDER BY id DESC")
    rows = cursor.fetchall()
    conn.close()
    
    invoices = []
    for row in rows:
        inv = dict(row)
        inv['formatted_date'] = format_invoice_date(inv['date'])
        invoices.append(inv)
        
    return render_template("reports.html", invoices=invoices)


# --- APIs ---

@app.route("/api/add-to-cart", methods=["POST"])
@login_required
def add_to_cart():
    session_id = get_cart_session_id()
    data = request.json
    prod_id = data.get("product_id")
    qty = int(data.get("quantity", 1))
    disc = int(data.get("discount", 0))
    
    # Discount value whitelist constraint:
    allowed_discounts = [0, 5, 10, 15, 20, 25, 30, 40, 50]
    if disc not in allowed_discounts:
        # snap to nearest lower allowed discount
        disc = max([d for d in allowed_discounts if d <= disc])

    conn = get_db()
    cursor = conn.cursor()
    
    # Check inventory
    cursor.execute("SELECT stock FROM inventory WHERE product_id = ?", (prod_id,))
    stock_row = cursor.fetchone()
    if not stock_row or stock_row[0] < qty:
        conn.close()
        return jsonify({"success": False, "message": "Insufficient stock level."}), 400
        
    # Check if product already exists in cart for this session
    cursor.execute("SELECT id, quantity FROM cart WHERE product_id = ? AND session_id = ?", (prod_id, session_id))
    cart_row = cursor.fetchone()
    
    if cart_row:
        new_qty = cart_row['quantity'] + qty
        if new_qty > stock_row[0]:
            conn.close()
            return jsonify({"success": False, "message": "Cannot exceed total available stock capacity."}), 400
        cursor.execute("UPDATE cart SET quantity = ?, discount = ? WHERE id = ? AND session_id = ?", (new_qty, disc, cart_row['id'], session_id))
    else:
        cursor.execute("INSERT INTO cart (session_id, product_id, quantity, discount) VALUES (?, ?, ?, ?)", (session_id, prod_id, qty, disc))
        
    conn.commit()
    conn.close()
    return jsonify({"success": True, "message": "Product successfully added to cart."})

@app.route("/api/update-cart", methods=["POST"])
@login_required
def update_cart():
    session_id = get_cart_session_id()
    data = request.json
    cart_id = data.get("cart_id")
    qty = int(data.get("quantity"))
    disc = int(data.get("discount"))
    
    allowed_discounts = [0, 5, 10, 15, 20, 25, 30, 40, 50]
    if disc not in allowed_discounts:
        disc = max([d for d in allowed_discounts if d <= disc])
        
    if qty <= 0:
        return remove_from_cart_logic(cart_id, session_id)
        
    conn = get_db()
    cursor = conn.cursor()
    
    # Get product ID and stock bounds for this session's cart item
    cursor.execute("SELECT product_id FROM cart WHERE id = ? AND session_id = ?", (cart_id, session_id))
    prod_row = cursor.fetchone()
    if not prod_row:
        conn.close()
        return jsonify({"success": False, "message": "Cart item not found"}), 404
        
    prod_id = prod_row[0]
    cursor.execute("SELECT stock FROM inventory WHERE product_id = ?", (prod_id,))
    stock = cursor.fetchone()[0]
    
    if qty > stock:
        conn.close()
        return jsonify({"success": False, "message": f"Only {stock} items available in inventory."}), 400
        
    cursor.execute("UPDATE cart SET quantity = ?, discount = ? WHERE id = ? AND session_id = ?", (qty, disc, cart_id, session_id))
    conn.commit()
    conn.close()
    return jsonify({"success": True})

@app.route("/api/remove-from-cart", methods=["POST"])
@login_required
def remove_from_cart():
    session_id = get_cart_session_id()
    data = request.json
    cart_id = data.get("cart_id")
    return remove_from_cart_logic(cart_id, session_id)

def remove_from_cart_logic(cart_id, session_id):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM cart WHERE id = ? AND session_id = ?", (cart_id, session_id))
    conn.commit()
    conn.close()
    return jsonify({"success": True, "message": "Item removed from cart."})

@app.route("/api/clear-cart", methods=["POST"])
@login_required
def clear_cart():
    session_id = get_cart_session_id()
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM cart WHERE session_id = ?", (session_id,))
    conn.commit()
    conn.close()
    return jsonify({"success": True, "message": "Cart cleared."})

@app.route("/api/checkout", methods=["POST"])
@login_required
def checkout():
    session_id = get_cart_session_id()
    data = request.json
    c_name = data.get("customer_name", "").strip() or "Guest Customer"
    c_phone = data.get("customer_phone", "").strip() or "0000000000"
    pay_method = data.get("payment_method", "Cash")
    
    conn = get_db()
    cursor = conn.cursor()
    
    try:
        # 1. Fetch Cart
        cursor.execute("""
            SELECT cart.product_id, cart.quantity, cart.discount, products.selling_price, products.cost_price, inventory.stock 
            FROM cart 
            JOIN products ON cart.product_id = products.id
            JOIN inventory ON products.id = inventory.product_id
            WHERE cart.session_id = ?
        """, (session_id,))
        cart_items = cursor.fetchall()
        
        if not cart_items:
            return jsonify({"success": False, "message": "Cart is empty."}), 400
            
        # Double check stock availability
        for item in cart_items:
            if item['quantity'] > item['stock']:
                return jsonify({"success": False, "message": "Transaction failed: stock levels changed."}), 400
                
        # 2. Compute Totals
        subtotal = 0.0
        total_discount = 0.0
        sale_rows = []
        
        for item in cart_items:
            raw_amt = item['selling_price'] * item['quantity']
            disc_amt = raw_amt * (item['discount'] / 100.0)
            final_amt = raw_amt - disc_amt
            
            subtotal += raw_amt
            total_discount += disc_amt
            sale_rows.append((item['product_id'], item['quantity'], item['selling_price'], item['discount'], final_amt, item['cost_price']))
            
        grand_total = subtotal - total_discount
        
        # Query highest invoice id sequence to avoid reuse key conflicts
        cursor.execute("SELECT COALESCE(MAX(id), 0) FROM invoices")
        max_id = cursor.fetchone()[0]
        inv_idx = max_id + 1001
        invoice_no = f"INV-{inv_idx}"
        
        today = datetime.date.today().isoformat()
        now_time = datetime.datetime.now().strftime("%H:%M:%S")
        
        # 3. Add to Customer table if phone doesn't exist
        if c_phone != "0000000000":
            cursor.execute("INSERT OR IGNORE INTO customers (name, phone) VALUES (?, ?)", (c_name, c_phone))
            
        # 4. Insert Invoice record
        cursor.execute("""
            INSERT INTO invoices (invoice_number, customer_name, customer_phone, date, time, subtotal, total_discount, grand_total, payment_method)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (invoice_no, c_name, c_phone, today, now_time, subtotal, total_discount, grand_total, pay_method))
        invoice_id = cursor.lastrowid
        
        # 5. Insert Sales rows and deduct stock
        for prod_id, qty, rate, disc, amt, cp in sale_rows:
            cursor.execute("""
                INSERT INTO sales (invoice_id, product_id, quantity, rate, discount, amount, cost_price)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (invoice_id, prod_id, qty, rate, disc, amt, cp))
            
            cursor.execute("UPDATE inventory SET stock = MAX(0, stock - ?) WHERE product_id = ?", (qty, prod_id))
            
        # 6. Flush cart
        cursor.execute("DELETE FROM cart WHERE session_id = ?", (session_id,))
        
        conn.commit()
        return jsonify({"success": True, "invoice_id": invoice_id, "invoice_number": invoice_no})
    except Exception as e:
        conn.rollback()
        return jsonify({"success": False, "message": f"Database transaction failed: {str(e)}"}), 500
    finally:
        conn.close()

@app.route("/api/restock", methods=["POST"])
@login_required
def api_restock():
    data = request.json
    prod_id = data.get("product_id")
    qty = int(data.get("quantity", 50))
    
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("UPDATE inventory SET stock = stock + ? WHERE product_id = ?", (qty, prod_id))
    conn.commit()
    conn.close()
    return jsonify({"success": True, "message": "Product stock level restocked."})


# --- ANALYTICS AND CHARTS APIs ---

@app.route("/api/analytics/charts")
@login_required
def api_analytics_charts():
    conn = get_db()
    cursor = conn.cursor()
    
    # 1. Daily, Weekly, Monthly Revenue & Transactions
    # Group by Date
    cursor.execute("""
        SELECT date, SUM(grand_total) as rev, COUNT(id) as trans 
        FROM invoices 
        GROUP BY date 
        ORDER BY date ASC LIMIT 30
    """)
    daily_data = cursor.fetchall()
    daily_labels = [row['date'] for row in daily_data]
    daily_revenue = [row['rev'] for row in daily_data]
    daily_trans = [row['trans'] for row in daily_data]
    
    # 2. Category Share (Doughnut)
    cursor.execute("""
        SELECT products.category, SUM(sales.amount) as share 
        FROM sales 
        JOIN products ON sales.product_id = products.id 
        GROUP BY products.category
    """)
    cat_share = cursor.fetchall()
    cat_labels = [row['category'] for row in cat_share]
    cat_values = [row['share'] for row in cat_share]
    
    # 3. Top Selling Products (Units Sold)
    cursor.execute("""
        SELECT products.name || ' (' || products.size || ')' as item, SUM(sales.quantity) as q 
        FROM sales 
        JOIN products ON sales.product_id = products.id 
        GROUP BY sales.product_id 
        ORDER BY q DESC LIMIT 5
    """)
    top_selling = cursor.fetchall()
    top_selling_labels = [row['item'] for row in top_selling]
    top_selling_values = [row['q'] for row in top_selling]
    
    # 4. Most Purchased Products (Transaction counts appearance)
    cursor.execute("""
        SELECT products.name || ' (' || products.size || ')' as item, COUNT(sales.invoice_id) as count 
        FROM sales 
        JOIN products ON sales.product_id = products.id 
        GROUP BY sales.product_id 
        ORDER BY count DESC LIMIT 5
    """)
    most_purch = cursor.fetchall()
    most_purch_labels = [row['item'] for row in most_purch]
    most_purch_values = [row['count'] for row in most_purch]
    
    # 5. Most Profitable Products
    cursor.execute("""
        SELECT products.name || ' (' || products.size || ')' as item, SUM(sales.amount - (sales.cost_price * sales.quantity)) as profit 
        FROM sales 
        JOIN products ON sales.product_id = products.id 
        GROUP BY sales.product_id 
        ORDER BY profit DESC LIMIT 5
    """)
    most_profit = cursor.fetchall()
    most_profit_labels = [row['item'] for row in most_profit]
    most_profit_values = [row['profit'] for row in most_profit]

    # 6. Customer Favorite Products (Grouped by unique customer count purchasing it)
    cursor.execute("""
        SELECT products.name || ' (' || products.size || ')' as item, COUNT(DISTINCT invoices.customer_phone) as fav_count 
        FROM sales 
        JOIN invoices ON sales.invoice_id = invoices.id
        JOIN products ON sales.product_id = products.id
        WHERE invoices.customer_phone != '0000000000'
        GROUP BY sales.product_id 
        ORDER BY fav_count DESC LIMIT 5
    """)
    cust_fav = cursor.fetchall()
    cust_fav_labels = [row['item'] for row in cust_fav]
    cust_fav_values = [row['fav_count'] for row in cust_fav]
    
    # 7. Low & Out of stock products
    cursor.execute("""
        SELECT products.name || ' (' || products.size || ')' as item, inventory.stock 
        FROM inventory 
        JOIN products ON inventory.product_id = products.id 
        WHERE inventory.stock <= inventory.reorder_level
        ORDER BY inventory.stock ASC LIMIT 10
    """)
    warnings = cursor.fetchall()
    warning_labels = [row['item'] for row in warnings]
    warning_values = [row['stock'] for row in warnings]
    
    conn.close()
    
    return jsonify({
        "daily_labels": daily_labels,
        "daily_revenue": daily_revenue,
        "daily_trans": daily_trans,
        "cat_labels": cat_labels,
        "cat_values": cat_values,
        "top_selling_labels": top_selling_labels,
        "top_selling_values": top_selling_values,
        "most_purch_labels": most_purch_labels,
        "most_purch_values": most_purch_values,
        "most_profit_labels": most_profit_labels,
        "most_profit_values": most_profit_values,
        "cust_fav_labels": cust_fav_labels,
        "cust_fav_values": cust_fav_values,
        "warning_labels": warning_labels,
        "warning_values": warning_values
    })

@app.route("/invoice/view/<int:invoice_id>")
@login_required
def invoice_view(invoice_id):
    conn = get_db()
    cursor = conn.cursor()
    
    # Get invoice metadata
    cursor.execute("SELECT * FROM invoices WHERE id = ?", (invoice_id,))
    invoice = cursor.fetchone()
    
    if not invoice:
        conn.close()
        return "Invoice not found", 404
        
    # Get sales lines
    cursor.execute("""
        SELECT sales.quantity, sales.rate, sales.discount, sales.amount, products.name, products.size 
        FROM sales 
        JOIN products ON sales.product_id = products.id 
        WHERE sales.invoice_id = ?
    """, (invoice_id,))
    sales_items = cursor.fetchall()
    conn.close()
    
    return render_template("invoice_view.html", invoice=invoice, items=sales_items)

# --- PDF GENERATOR ---

@app.route("/invoice/pdf/<int:invoice_id>")
@login_required
def invoice_pdf(invoice_id):
    conn = get_db()
    cursor = conn.cursor()
    
    # Get invoice metadata
    cursor.execute("SELECT * FROM invoices WHERE id = ?", (invoice_id,))
    invoice = cursor.fetchone()
    
    if not invoice:
        conn.close()
        return "Invoice not found", 404
        
    # Get sales lines
    cursor.execute("""
        SELECT sales.quantity, sales.rate, sales.discount, sales.amount, products.name, products.size 
        FROM sales 
        JOIN products ON sales.product_id = products.id 
        WHERE sales.invoice_id = ?
    """, (invoice_id,))
    sales_items = cursor.fetchall()
    conn.close()
    
    # PDF Rendering in Buffer
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter, rightMargin=40, leftMargin=40, topMargin=40, bottomMargin=40)
    story = []
    
    styles = getSampleStyleSheet()
    
    # Custom Receipt Styles
    title_style = ParagraphStyle(
        'ReceiptTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=18,
        leading=22,
        alignment=1, # Centered
        spaceAfter=5
    )
    
    meta_style = ParagraphStyle(
        'ReceiptMeta',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=12,
        alignment=1,
        spaceAfter=15
    )
    
    text_style = ParagraphStyle(
        'ReceiptText',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        leading=14
    )
    
    bold_style = ParagraphStyle(
        'ReceiptBold',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=10,
        leading=14
    )

    story.append(Paragraph("KRISHNA KIRANA SHOP", title_style))
    story.append(Paragraph("Supermarket Chowk, Main Street, Delhi - 110001<br/>Tel: +91 9988776655 | GSTIN: 07AAAAA1111A1Z1", meta_style))
    story.append(Spacer(1, 10))
    
    # Bill meta details layout
    meta_data = [
        [Paragraph(f"<b>Bill Number:</b> {invoice['invoice_number']}", text_style), Paragraph(f"<b>Date:</b> {format_invoice_date(invoice['date'])}", text_style)],
        [Paragraph(f"<b>Customer Name:</b> {invoice['customer_name']}", text_style), Paragraph(f"<b>Time:</b> {invoice['time']}", text_style)],
        [Paragraph(f"<b>Customer Phone:</b> {invoice['customer_phone']}", text_style), Paragraph(f"<b>Payment Mode:</b> {invoice['payment_method']}", text_style)]
    ]
    meta_table = Table(meta_data, colWidths=[260, 260])
    meta_table.setStyle(TableStyle([
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ]))
    
    story.append(meta_table)
    story.append(Spacer(1, 15))
    story.append(Paragraph("*************************************************************************************************", text_style))
    story.append(Spacer(1, 5))
    
    # Products Table
    table_data = [[
        Paragraph("<b>Product</b>", bold_style),
        Paragraph("<b>Size</b>", bold_style),
        Paragraph("<b>Qty</b>", bold_style),
        Paragraph("<b>Rate</b>", bold_style),
        Paragraph("<b>Disc%</b>", bold_style),
        Paragraph("<b>Total</b>", bold_style)
    ]]
    
    for item in sales_items:
        table_data.append([
            Paragraph(item['name'], text_style),
            Paragraph(item['size'], text_style),
            Paragraph(str(item['quantity']), text_style),
            Paragraph(f"Rs. {item['rate']:.2f}", text_style),
            Paragraph(f"{item['discount']}%", text_style),
            Paragraph(f"Rs. {item['amount']:.2f}", text_style)
        ])
        
    prod_table = Table(table_data, colWidths=[200, 70, 40, 70, 50, 90])
    prod_table.setStyle(TableStyle([
        ('LINEBELOW', (0,0), (-1,0), 1, colors.black),
        ('LINEBELOW', (0,1), (-1,-1), 0.5, colors.lightgrey),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('ALIGN', (2,0), (-1,-1), 'CENTER'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
    ]))
    
    story.append(prod_table)
    story.append(Spacer(1, 15))
    story.append(Paragraph("******************************************************************************** alignment", text_style))
    story.append(Spacer(1, 5))
    
    # Financial summaries
    summary_data = [
        [Paragraph("", text_style), Paragraph("<b>Subtotal:</b>", text_style), Paragraph(f"Rs. {invoice['subtotal']:.2f}", text_style)],
        [Paragraph("", text_style), Paragraph("<font color='red'><b>Discount Saved:</b></font>", text_style), Paragraph(f"<font color='red'>-Rs. {invoice['total_discount']:.2f}</font>", text_style)],
        [Paragraph("", text_style), Paragraph("<b>GRAND TOTAL:</b>", bold_style), Paragraph(f"<b>Rs. {invoice['grand_total']:.2f}</b>", bold_style)]
    ]
    
    summary_table = Table(summary_data, colWidths=[300, 110, 110])
    summary_table.setStyle(TableStyle([
        ('ALIGN', (1,0), (1,-1), 'LEFT'),
        ('ALIGN', (2,0), (2,-1), 'RIGHT'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ]))
    
    story.append(summary_table)
    story.append(Spacer(1, 30))
    story.append(Paragraph("Thank You for Shopping at Krishna Kirana Shop!", ParagraphStyle('Footer', parent=styles['Normal'], alignment=1, fontSize=11, fontName='Helvetica-Bold')))
    story.append(Paragraph("Keep your city clean. Please recycle bags.", ParagraphStyle('FooterSub', parent=styles['Normal'], alignment=1, fontSize=8)))
    
    doc.build(story)
    
    buffer.seek(0)
    filename = f"Invoice_{invoice['invoice_number']}.pdf"
    
    return send_file(buffer, as_attachment=True, download_name=filename, mimetype="application/pdf")


@app.route("/settings")
@login_required
def settings_page():
    return render_template("settings.html")

@app.route("/api/settings/load-sim", methods=["POST"])
@login_required
def load_sim_settings():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM invoices")
    cursor.execute("DELETE FROM sales")
    cursor.execute("DELETE FROM cart")
    conn.commit()
    conn.close()
    
    seed_mock_transactions()
    return jsonify({"success": True, "message": "Simulated transactional logs seeded successfully."})

@app.route("/api/settings/global-restock", methods=["POST"])
@login_required
def global_restock_settings():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT id, name, size FROM products")
    prods = cursor.fetchall()
    for p in prods:
        stock = 200 if (p['name'] == "Clinic Plus" and "Sachet" in p['size']) else 100
        cursor.execute("UPDATE inventory SET stock = ? WHERE product_id = ?", (stock, p['id']))
    conn.commit()
    conn.close()
    return jsonify({"success": True, "message": "All warehouse stock levels replenished to capacity."})

@app.route("/api/settings/factory-reset", methods=["POST"])
@login_required
def factory_reset_settings():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM invoices")
    cursor.execute("DELETE FROM sales")
    cursor.execute("DELETE FROM cart")
    cursor.execute("DELETE FROM inventory")
    cursor.execute("DELETE FROM products")
    cursor.execute("DELETE FROM customers")
    conn.commit()
    
    seed_products(cursor)
    conn.commit()
    conn.close()
    return jsonify({"success": True, "message": "Database successfully reset to clean installation defaults."})

# Trigger database setup before launch
init_db()
seed_mock_transactions()

if __name__ == "__main__":
    app.run(port=8080, debug=True)
