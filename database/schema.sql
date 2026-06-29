-- PostgreSQL Database Schema for Lumina Restaurant OS

-- Users & Customer Accounts
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    firebase_uid VARCHAR(128) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(100),
    phone VARCHAR(20),
    loyalty_points INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Guest CRM Profile Metadata
CREATE TABLE IF NOT EXISTS crm_profiles (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    allergies JSONB, -- list of ingredients (e.g. ["gluten", "shellfish"])
    taste_preferences JSONB, -- key-value list of favorite wines, vibes, dining notes
    staff_notes TEXT,
    last_visited TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Dynamic Table Map
CREATE TABLE IF NOT EXISTS tables (
    id SERIAL PRIMARY KEY,
    table_number VARCHAR(10) UNIQUE NOT NULL,
    capacity INT NOT NULL,
    zone VARCHAR(50) NOT NULL, -- patio, main_hall, window
    status VARCHAR(20) DEFAULT 'available' -- available, occupied, reserved
);

-- Reservations System
CREATE TABLE IF NOT EXISTS reservations (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    table_id INT REFERENCES tables(id) ON DELETE SET NULL,
    party_size INT NOT NULL,
    reservation_time TIMESTAMP NOT NULL,
    occasion VARCHAR(50), -- birthday, anniversary, date
    special_arrangements TEXT,
    status VARCHAR(20) DEFAULT 'confirmed', -- confirmed, seated, waitlisted, cancelled
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Menu Categories
CREATE TABLE IF NOT EXISTS menu_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL
);

-- Menu Items Registry
CREATE TABLE IF NOT EXISTS menu_items (
    id SERIAL PRIMARY KEY,
    category_id INT REFERENCES menu_categories(id) ON DELETE RESTRICT,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    image_url TEXT,
    calories INT,
    allergens JSONB, -- list of allergens
    vibe_tags JSONB, -- list of matching vibes (e.g. ["moody", "intimate"])
    badge VARCHAR(50) -- e.g. "Signature", "Seasonal"
);

-- Orders
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE SET NULL,
    reservation_id INT REFERENCES reservations(id) ON DELETE SET NULL,
    order_type VARCHAR(20) NOT NULL, -- dine_in, delivery, takeaway
    subtotal DECIMAL(10, 2) NOT NULL,
    discount DECIMAL(10, 2) DEFAULT 0.00,
    status VARCHAR(30) DEFAULT 'pending', -- pending, preparing, ready, completed
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Order Items Bridge
CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY,
    order_id INT REFERENCES orders(id) ON DELETE CASCADE,
    menu_item_id INT REFERENCES menu_items(id) ON DELETE RESTRICT,
    quantity INT NOT NULL,
    customizations JSONB -- modifiers (e.g. "no onion", "extra sauce")
);

-- Transactions Registry
CREATE TABLE IF NOT EXISTS payments (
    id SERIAL PRIMARY KEY,
    order_id INT REFERENCES orders(id) ON DELETE SET NULL,
    payment_method VARCHAR(50) NOT NULL, -- UPI, card, cash
    transaction_id VARCHAR(100) UNIQUE,
    amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(20) DEFAULT 'completed' -- completed, refunded
);

-- Inventory System
CREATE TABLE IF NOT EXISTS inventory (
    id SERIAL PRIMARY KEY,
    item_name VARCHAR(100) UNIQUE NOT NULL,
    current_stock DECIMAL(10, 2) NOT NULL,
    reorder_level DECIMAL(10, 2) NOT NULL,
    unit VARCHAR(10) NOT NULL, -- grams, liters, units
    last_restocked TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Time-series Analytics
CREATE TABLE IF NOT EXISTS traffic_analytics (
    id SERIAL PRIMARY KEY,
    event_type VARCHAR(50) NOT NULL, -- page_view, vibe_click, reservation_attempt
    payload JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
