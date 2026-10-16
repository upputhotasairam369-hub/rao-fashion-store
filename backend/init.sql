-- Database initialization script for E-commerce Store
-- Creates tables and seeds initial data

CREATE TABLE IF NOT EXISTS users (
    id VARCHAR PRIMARY KEY,
    email VARCHAR UNIQUE,
    name VARCHAR,
    password_hash VARCHAR,
    role VARCHAR DEFAULT 'customer',
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT (NOW() AT TIME ZONE 'utc'),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT (NOW() AT TIME ZONE 'utc')
);
CREATE INDEX IF NOT EXISTS ix_users_email ON users (email);

CREATE TABLE IF NOT EXISTS products (
    id VARCHAR PRIMARY KEY,
    name VARCHAR,
    description TEXT,
    price DOUBLE PRECISION,
    category VARCHAR,
    image_url VARCHAR,
    stock INTEGER DEFAULT 0,
    rating DOUBLE PRECISION DEFAULT 0.0,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT (NOW() AT TIME ZONE 'utc'),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT (NOW() AT TIME ZONE 'utc')
);
CREATE INDEX IF NOT EXISTS ix_products_name ON products (name);
CREATE INDEX IF NOT EXISTS ix_products_category ON products (category);

CREATE TABLE IF NOT EXISTS orders (
    id VARCHAR PRIMARY KEY,
    user_id VARCHAR REFERENCES users(id),
    status VARCHAR DEFAULT 'pending',
    subtotal DOUBLE PRECISION,
    tax DOUBLE PRECISION,
    shipping DOUBLE PRECISION,
    total DOUBLE PRECISION,
    shipping_address JSONB,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT (NOW() AT TIME ZONE 'utc'),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT (NOW() AT TIME ZONE 'utc')
);

CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY,
    order_id VARCHAR REFERENCES orders(id),
    product_id VARCHAR,
    name VARCHAR,
    price DOUBLE PRECISION,
    quantity INTEGER,
    subtotal DOUBLE PRECISION,
    image_url VARCHAR
);

CREATE TABLE IF NOT EXISTS cart_items (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR REFERENCES users(id),
    product_id VARCHAR,
    name VARCHAR,
    price DOUBLE PRECISION,
    quantity INTEGER,
    subtotal DOUBLE PRECISION,
    image_url VARCHAR,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT (NOW() AT TIME ZONE 'utc'),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT (NOW() AT TIME ZONE 'utc')
);

CREATE TABLE IF NOT EXISTS favorites (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR NOT NULL REFERENCES users(id),
    product_id VARCHAR NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT (NOW() AT TIME ZONE 'utc'),
    CONSTRAINT uq_user_product_favorite UNIQUE (user_id, product_id)
);
CREATE INDEX IF NOT EXISTS ix_favorites_user_id ON favorites (user_id);
CREATE INDEX IF NOT EXISTS ix_favorites_product_id ON favorites (product_id);

-- Create sample products
INSERT INTO products (id, name, description, price, category, image_url, stock, rating, created_at, updated_at) VALUES
('prod-001', 'Wireless Headphones', 'High-quality wireless headphones with noise cancellation', 99.99, 'Electronics', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500', 50, 4.5, NOW(), NOW()),
('prod-002', 'Smart Watch', 'Fitness tracking smartwatch with heart rate monitor', 199.99, 'Electronics', 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500', 30, 4.2, NOW(), NOW()),
('prod-003', 'Canvas Backpack', 'Durable canvas backpack for travel and daily adventures', 45.99, 'Clothing', 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500', 25, 4.0, NOW(), NOW()),
('prod-004', 'Running Shoes', 'Comfortable running shoes with excellent cushioning', 129.99, 'Sports', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500', 40, 4.3, NOW(), NOW()),
('prod-005', 'Coffee Maker', 'Automatic coffee maker with programmable features', 79.99, 'Home & Garden', 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=500', 15, 4.1, NOW(), NOW()),
('prod-006', 'Bluetooth Speaker', 'Portable Bluetooth speaker with 360-degree sound', 59.99, 'Electronics', 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500', 35, 4.4, NOW(), NOW()),
('prod-007', 'Yoga Mat', 'Non-slip yoga mat for home workouts', 29.99, 'Sports', 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=500', 60, 4.0, NOW(), NOW()),
('prod-008', 'Laptop Stand', 'Adjustable laptop stand for better ergonomics', 39.99, 'Electronics', 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500', 20, 4.2, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

