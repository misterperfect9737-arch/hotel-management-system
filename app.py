# ===== GRAND LUXE HOTEL MANAGEMENT SYSTEM - BACKEND =====
# Flask REST API with MySQL Database Integration

from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from datetime import datetime, timedelta
import mysql.connector
from mysql.connector import Error
import json

app = Flask(__name__)
CORS(app)

# ===== DATABASE CONFIGURATION =====
DB_CONFIG = {
    'host': 'localhost',
    'user': 'root',
    'password': 'your_password',  # Change this
    'database': 'hotel_management'
}

# ===== DATABASE CONNECTION =====
def get_db_connection():
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        return connection
    except Error as e:
        print(f"Error connecting to MySQL: {e}")
        return None

# ===== INITIALIZE DATABASE =====
def init_database():
    connection = get_db_connection()
    if connection:
        cursor = connection.cursor()
        
        # Create rooms table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS rooms (
                id INT PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                floor INT NOT NULL,
                type VARCHAR(50) NOT NULL,
                price DECIMAL(10, 2) NOT NULL,
                image VARCHAR(500),
                features JSON,
                status ENUM('available', 'booked', 'maintenance') DEFAULT 'available',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # Create bookings table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS bookings (
                id INT PRIMARY KEY AUTO_INCREMENT,
                room_id INT NOT NULL,
                guest_name VARCHAR(100) NOT NULL,
                guest_email VARCHAR(100) NOT NULL,
                guest_phone VARCHAR(20) NOT NULL,
                check_in DATE NOT NULL,
                check_out DATE NOT NULL,
                guests INT NOT NULL,
                extras JSON,
                room_charges DECIMAL(10, 2) NOT NULL,
                extras_charges DECIMAL(10, 2) NOT NULL,
                gst DECIMAL(10, 2) NOT NULL,
                total DECIMAL(10, 2) NOT NULL,
                status ENUM('confirmed', 'pending', 'cancelled') DEFAULT 'confirmed',
                booking_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (room_id) REFERENCES rooms(id)
            )
        """)
        
        connection.commit()
        cursor.close()
        connection.close()
        print("✅ Database initialized successfully")


# ===== API ROUTES =====

# Get all rooms
@app.route('/api/rooms', methods=['GET'])
def get_rooms():
    connection = get_db_connection()
    if not connection:
        return jsonify({'error': 'Database connection failed'}), 500
    
    cursor = connection.cursor(dictionary=True)
    cursor.execute("SELECT * FROM rooms ORDER BY floor, id")
    rooms = cursor.fetchall()
    
    # Parse JSON features
    for room in rooms:
        if room['features']:
            room['features'] = json.loads(room['features'])
    
    cursor.close()
    connection.close()
    
    return jsonify(rooms)

# Get single room
@app.route('/api/rooms/<int:room_id>', methods=['GET'])
def get_room(room_id):
    connection = get_db_connection()
    if not connection:
        return jsonify({'error': 'Database connection failed'}), 500
    
    cursor = connection.cursor(dictionary=True)
    cursor.execute("SELECT * FROM rooms WHERE id = %s", (room_id,))
    room = cursor.fetchone()
    
    if room and room['features']:
        room['features'] = json.loads(room['features'])
    
    cursor.close()
    connection.close()
    
    if room:
        return jsonify(room)
    return jsonify({'error': 'Room not found'}), 404

# Create booking
@app.route('/api/bookings', methods=['POST'])
def create_booking():
    data = request.json
    
    connection = get_db_connection()
    if not connection:
        return jsonify({'error': 'Database connection failed'}), 500
    
    cursor = connection.cursor()
    
    # Check if room is available
    cursor.execute("SELECT status FROM rooms WHERE id = %s", (data['room_id'],))
    room = cursor.fetchone()
    
    if not room or room[0] != 'available':
        cursor.close()
        connection.close()
        return jsonify({'error': 'Room not available'}), 400
    
    # Insert booking
    query = """
        INSERT INTO bookings 
        (room_id, guest_name, guest_email, guest_phone, check_in, check_out, 
         guests, extras, room_charges, extras_charges, gst, total, status)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
    """
    
    values = (
        data['room_id'],
        data['guest_name'],
        data['guest_email'],
        data['guest_phone'],
        data['check_in'],
        data['check_out'],
        data['guests'],
        json.dumps(data.get('extras', {})),
        data['room_charges'],
        data['extras_charges'],
        data['gst'],
        data['total'],
        'confirmed'
    )
    
    cursor.execute(query, values)
    booking_id = cursor.lastrowid
    
    # Update room status
    cursor.execute("UPDATE rooms SET status = 'booked' WHERE id = %s", (data['room_id'],))
    
    connection.commit()
    cursor.close()
    connection.close()
    
    return jsonify({
        'message': 'Booking created successfully',
        'booking_id': booking_id
    }), 201


# Get all bookings
@app.route('/api/bookings', methods=['GET'])
def get_bookings():
    connection = get_db_connection()
    if not connection:
        return jsonify({'error': 'Database connection failed'}), 500
    
    cursor = connection.cursor(dictionary=True)
    cursor.execute("""
        SELECT b.*, r.name as room_name 
        FROM bookings b 
        JOIN rooms r ON b.room_id = r.id 
        ORDER BY b.booking_date DESC
    """)
    bookings = cursor.fetchall()
    
    # Parse JSON extras and format dates
    for booking in bookings:
        if booking['extras']:
            booking['extras'] = json.loads(booking['extras'])
        booking['check_in'] = booking['check_in'].isoformat()
        booking['check_out'] = booking['check_out'].isoformat()
        booking['booking_date'] = booking['booking_date'].isoformat()
    
    cursor.close()
    connection.close()
    
    return jsonify(bookings)

# Cancel booking
@app.route('/api/bookings/<int:booking_id>/cancel', methods=['PUT'])
def cancel_booking(booking_id):
    connection = get_db_connection()
    if not connection:
        return jsonify({'error': 'Database connection failed'}), 500
    
    cursor = connection.cursor()
    
    # Get booking details
    cursor.execute("SELECT room_id, status FROM bookings WHERE id = %s", (booking_id,))
    booking = cursor.fetchone()
    
    if not booking:
        cursor.close()
        connection.close()
        return jsonify({'error': 'Booking not found'}), 404
    
    if booking[1] == 'cancelled':
        cursor.close()
        connection.close()
        return jsonify({'error': 'Booking already cancelled'}), 400
    
    # Update booking status
    cursor.execute("UPDATE bookings SET status = 'cancelled' WHERE id = %s", (booking_id,))
    
    # Free up the room
    cursor.execute("UPDATE rooms SET status = 'available' WHERE id = %s", (booking[0],))
    
    connection.commit()
    cursor.close()
    connection.close()
    
    return jsonify({'message': 'Booking cancelled successfully'})

# Get dashboard statistics
@app.route('/api/dashboard/stats', methods=['GET'])
def get_dashboard_stats():
    connection = get_db_connection()
    if not connection:
        return jsonify({'error': 'Database connection failed'}), 500
    
    cursor = connection.cursor(dictionary=True)
    
    # Total revenue
    cursor.execute("""
        SELECT SUM(total) as total_revenue 
        FROM bookings 
        WHERE status = 'confirmed'
    """)
    revenue = cursor.fetchone()
    
    # Occupancy rate
    cursor.execute("SELECT COUNT(*) as total FROM rooms")
    total_rooms = cursor.fetchone()['total']
    
    cursor.execute("SELECT COUNT(*) as booked FROM rooms WHERE status = 'booked'")
    booked_rooms = cursor.fetchone()['booked']
    
    occupancy_rate = (booked_rooms / total_rooms * 100) if total_rooms > 0 else 0
    
    # Today's check-ins and check-outs
    today = datetime.now().date()
    cursor.execute("""
        SELECT COUNT(*) as checkins 
        FROM bookings 
        WHERE check_in = %s AND status = 'confirmed'
    """, (today,))
    checkins = cursor.fetchone()['checkins']
    
    cursor.execute("""
        SELECT COUNT(*) as checkouts 
        FROM bookings 
        WHERE check_out = %s AND status = 'confirmed'
    """, (today,))
    checkouts = cursor.fetchone()['checkouts']
    
    cursor.close()
    connection.close()
    
    return jsonify({
        'total_revenue': float(revenue['total_revenue'] or 0),
        'occupancy_rate': round(occupancy_rate, 1),
        'checkins': checkins,
        'checkouts': checkouts,
        'total_rooms': total_rooms,
        'booked_rooms': booked_rooms
    })

# Seed sample data
@app.route('/api/seed', methods=['POST'])
def seed_data():
    connection = get_db_connection()
    if not connection:
        return jsonify({'error': 'Database connection failed'}), 500
    
    cursor = connection.cursor()
    
    # Sample rooms data
    rooms_data = [
        (101, 'Deluxe Suite', 1, 'Standard', 2500, 
         'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800',
         json.dumps(['Queen Bed', 'City View', 'WiFi', 'AC']), 'available'),
        (102, 'Premium Suite', 1, 'Premium', 3500,
         'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800',
         json.dumps(['King Bed', 'Garden View', 'WiFi', 'Balcony']), 'available'),
        (201, 'Executive Suite', 2, 'Executive', 4500,
         'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800',
         json.dumps(['King Bed', 'Ocean View', 'WiFi', 'Jacuzzi']), 'available'),
        (202, 'Royal Suite', 2, 'Royal', 6000,
         'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800',
         json.dumps(['King Bed', 'Panoramic View', 'WiFi', 'Private Pool']), 'available'),
        (301, 'Presidential Suite', 3, 'Presidential', 8500,
         'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800',
         json.dumps(['2 King Beds', 'Penthouse View', 'WiFi', 'Butler Service']), 'available'),
        (302, 'Luxury Penthouse', 3, 'Penthouse', 12000,
         'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800',
         json.dumps(['3 King Beds', '360° View', 'WiFi', 'Private Terrace']), 'available')
    ]
    
    # Insert rooms
    for room in rooms_data:
        cursor.execute("""
            INSERT INTO rooms (id, name, floor, type, price, image, features, status)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            ON DUPLICATE KEY UPDATE 
            name=VALUES(name), floor=VALUES(floor), type=VALUES(type),
            price=VALUES(price), image=VALUES(image), features=VALUES(features)
        """, room)
    
    connection.commit()
    cursor.close()
    connection.close()
    
    return jsonify({'message': 'Sample data seeded successfully'})

# Health check
@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'message': 'Grand Luxe Hotel Management API is running',
        'timestamp': datetime.now().isoformat()
    })

# ===== SERVE FRONTEND =====
@app.route('/')
def home():
    return send_file('index.html')

@app.route('/<path:path>')
def serve_file(path):
    return send_file(path)

# ===== RUN SERVER =====
if __name__ == '__main__':
    print("╔═══════════════════════════════════════════════════════════╗")
    print("║     GRAND LUXE HOTEL MANAGEMENT SYSTEM - STARTING...      ║")
    print("╚═══════════════════════════════════════════════════════════╝")
    print("")
    print("🏨 Initializing database...")
    init_database()
    print("✓ Database initialized")
    print("")
    print("🚀 Starting Flask server...")
    print("")
    print("Server running at:")
    print("  → http://localhost:5000")
    print("")
    print("Press Ctrl+C to stop the server")
    print("")
    print("═══════════════════════════════════════════════════════════")
    print("")
    app.run(debug=True, host='0.0.0.0', port=5000)
