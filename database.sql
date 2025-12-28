-- =====================================================
-- GRAND LUXE HOTEL MANAGEMENT SYSTEM - DATABASE SCHEMA
-- =====================================================

-- Create database
CREATE DATABASE IF NOT EXISTS hotel_management;
USE hotel_management;

-- =====================================================
-- ROOMS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS rooms (
    id INT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    floor INT NOT NULL,
    type VARCHAR(50) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    image VARCHAR(500),
    features JSON,
    status ENUM('available', 'booked', 'maintenance') DEFAULT 'available',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_floor (floor),
    INDEX idx_status (status),
    INDEX idx_type (type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================
-- BOOKINGS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS bookings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    room_id INT NOT NULL,
    guest_name VARCHAR(100) NOT NULL,
    guest_email VARCHAR(100) NOT NULL,
    guest_phone VARCHAR(20) NOT NULL,
    check_in DATE NOT NULL,
    check_out DATE NOT NULL,
    guests INT NOT NULL DEFAULT 1,
    extras JSON,
    room_charges DECIMAL(10, 2) NOT NULL,
    extras_charges DECIMAL(10, 2) NOT NULL DEFAULT 0,
    gst DECIMAL(10, 2) NOT NULL,
    total DECIMAL(10, 2) NOT NULL,
    status ENUM('confirmed', 'pending', 'cancelled') DEFAULT 'confirmed',
    booking_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE RESTRICT,
    INDEX idx_room_id (room_id),
    INDEX idx_status (status),
    INDEX idx_check_in (check_in),
    INDEX idx_check_out (check_out),
    INDEX idx_guest_email (guest_email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================
-- GUESTS TABLE (Optional - for customer management)
-- =====================================================
CREATE TABLE IF NOT EXISTS guests (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    id_proof_type VARCHAR(50),
    id_proof_number VARCHAR(100),
    total_bookings INT DEFAULT 0,
    total_spent DECIMAL(10, 2) DEFAULT 0,
    loyalty_points INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_email (email),
    INDEX idx_phone (phone)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================
-- PAYMENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS payments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    booking_id INT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    payment_method ENUM('cash', 'card', 'upi', 'netbanking') NOT NULL,
    payment_status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
    transaction_id VARCHAR(100),
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    INDEX idx_booking_id (booking_id),
    INDEX idx_payment_status (payment_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================
-- SAMPLE DATA INSERTION
-- =====================================================

-- Insert sample rooms
INSERT INTO rooms (id, name, floor, type, price, image, features, status) VALUES
(101, 'Deluxe Suite', 1, 'Standard', 2500.00, 
 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800',
 '["Queen Bed", "City View", "WiFi", "AC"]', 'available'),

(102, 'Premium Suite', 1, 'Premium', 3500.00,
 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800',
 '["King Bed", "Garden View", "WiFi", "Balcony"]', 'available'),

(103, 'Garden View Suite', 1, 'Standard', 2800.00,
 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800',
 '["Queen Bed", "Garden View", "WiFi", "Mini Bar"]', 'available'),

(201, 'Executive Suite', 2, 'Executive', 4500.00,
 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800',
 '["King Bed", "Ocean View", "WiFi", "Jacuzzi"]', 'available'),

(202, 'Royal Suite', 2, 'Royal', 6000.00,
 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800',
 '["King Bed", "Panoramic View", "WiFi", "Private Pool"]', 'available'),

(203, 'Business Suite', 2, 'Executive', 4800.00,
 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800',
 '["King Bed", "City View", "WiFi", "Work Desk"]', 'available'),

(301, 'Presidential Suite', 3, 'Presidential', 8500.00,
 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800',
 '["2 King Beds", "Penthouse View", "WiFi", "Butler Service"]', 'available'),

(302, 'Luxury Penthouse', 3, 'Penthouse', 12000.00,
 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800',
 '["3 King Beds", "360° View", "WiFi", "Private Terrace"]', 'available'),

(303, 'Sky Suite', 3, 'Presidential', 9500.00,
 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800',
 '["2 King Beds", "Sky View", "WiFi", "Private Lounge"]', 'available')
ON DUPLICATE KEY UPDATE 
    name=VALUES(name), 
    floor=VALUES(floor), 
    type=VALUES(type),
    price=VALUES(price), 
    image=VALUES(image), 
    features=VALUES(features);

-- =====================================================
-- USEFUL QUERIES
-- =====================================================

-- Get available rooms
-- SELECT * FROM rooms WHERE status = 'available' ORDER BY floor, id;

-- Get all bookings with room details
-- SELECT b.*, r.name as room_name, r.floor, r.type 
-- FROM bookings b 
-- JOIN rooms r ON b.room_id = r.id 
-- ORDER BY b.booking_date DESC;

-- Get revenue statistics
-- SELECT 
--     SUM(total) as total_revenue,
--     COUNT(*) as total_bookings,
--     AVG(total) as average_booking_value
-- FROM bookings 
-- WHERE status = 'confirmed';

-- Get occupancy rate
-- SELECT 
--     (SELECT COUNT(*) FROM rooms WHERE status = 'booked') as booked_rooms,
--     (SELECT COUNT(*) FROM rooms) as total_rooms,
--     ROUND((SELECT COUNT(*) FROM rooms WHERE status = 'booked') / 
--           (SELECT COUNT(*) FROM rooms) * 100, 2) as occupancy_rate;

-- Get today's check-ins
-- SELECT b.*, r.name as room_name 
-- FROM bookings b 
-- JOIN rooms r ON b.room_id = r.id 
-- WHERE b.check_in = CURDATE() AND b.status = 'confirmed';

-- Get today's check-outs
-- SELECT b.*, r.name as room_name 
-- FROM bookings b 
-- JOIN rooms r ON b.room_id = r.id 
-- WHERE b.check_out = CURDATE() AND b.status = 'confirmed';

-- =====================================================
-- END OF SCHEMA
-- =====================================================
