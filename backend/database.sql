CREATE DATABASE IF NOT EXISTS grocery_db;
USE grocery_db;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,       -- bcrypt hash
  role ENUM('buyer', 'seller', 'admin') NOT NULL DEFAULT 'buyer',
  phone VARCHAR(20),
  address VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  image VARCHAR(255)
);

CREATE TABLE products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  stock INT NOT NULL DEFAULT 0,
  unit VARCHAR(30) DEFAULT 'pcs',
  image VARCHAR(255),
  category_id INT,
  seller_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
  FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE cart_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  UNIQUE KEY unique_cart_item (user_id, product_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE TABLE orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  status ENUM('pending','processing','shipped','delivered','cancelled') DEFAULT 'pending',
  shipping_address VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  product_id INT,
  product_name VARCHAR(150) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  quantity INT NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
);

INSERT INTO categories (name) VALUES
  ('Fruits & Vegetables'), ('Dairy & Eggs'), ('Bakery'), ('Beverages'), ('Snacks');

INSERT INTO products
(name, description, price, stock, unit, image, category_id)
VALUES
('Apple', 'Fresh red apples', 120.00, 50, 'kg', 'images/apple.jpg', 1),
('Banana', 'Fresh bananas', 80.00, 40, 'kg', 'images/banana.jpg', 1),
('Milk', 'Fresh milk', 100.00, 30, 'litre', 'images/milk.jpg', 2),
('Bread', 'Fresh bread from bakery', 60.00, 25, 'pieces', 'images/bread.webp', 3),
('Broccoli', 'Fresh broccoli', 200.00, 40, 'kg', 'images/broccoli.jpg', 1),
('Chedder Cheese', 'Fresh cheese', 350.00, 65, 'kg', 'images/chedder cheese.jpg', 2),
('Cherry Tomatoes', 'Fresh cherry tomatoes', 70.00, 30, 'kg', 'images/cherry tomatoes.jpg', 1),
('Avocado', 'Fresh fruit', 1400.00, 10, 'kg', 'images/avocado.jpg', 1),
('Egg', 'Fresh eggs', 10.00, 30, 'pieces', 'images/eggs.webp', 2);