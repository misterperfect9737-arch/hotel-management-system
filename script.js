// ===== CONFIGURATION =====
const API_URL = 'http://localhost:5000/api';

// ===== SAMPLE DATA (for demo without backend) =====
let rooms = [
    {
        id: 101,
        name: 'Deluxe Suite',
        floor: 1,
        type: 'Standard',
        price: 2500,
        image: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800',
        features: ['Queen Bed', 'City View', 'WiFi', 'AC'],
        status: 'available'
    },
    {
        id: 102,
        name: 'Premium Suite',
        floor: 1,
        type: 'Premium',
        price: 3500,
        image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800',
        features: ['King Bed', 'Garden View', 'WiFi', 'Balcony'],
        status: 'booked'
    },
    {
        id: 201,
        name: 'Executive Suite',
        floor: 2,
        type: 'Executive',
        price: 4500,
        image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800',
        features: ['King Bed', 'Ocean View', 'WiFi', 'Jacuzzi'],
        status: 'available'
    },
    {
        id: 202,
        name: 'Royal Suite',
        floor: 2,
        type: 'Royal',
        price: 6000,
        image: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800',
        features: ['King Bed', 'Panoramic View', 'WiFi', 'Private Pool'],
        status: 'available'
    },
    {
        id: 301,
        name: 'Presidential Suite',
        floor: 3,
        type: 'Presidential',
        price: 8500,
        image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800',
        features: ['2 King Beds', 'Penthouse View', 'WiFi', 'Butler Service'],
        status: 'available'
    },
    {
        id: 302,
        name: 'Luxury Penthouse',
        floor: 3,
        type: 'Penthouse',
        price: 12000,
        image: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800',
        features: ['3 King Beds', '360° View', 'WiFi', 'Private Terrace'],
        status: 'available'
    }
];

let bookings = [];
let currentBookingId = 1000;

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    setupEventListeners();
    animateCounters();
});

function initializeApp() {
    loadRooms();
    loadBookings();
    loadFloorAvailability();
    loadAdminDashboard();
    setMinDate();
}


// ===== EVENT LISTENERS =====
function setupEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const target = link.getAttribute('href').substring(1);
            scrollToSection(target);
            
            document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
            link.classList.add('active');
        });
    });
    
    // Modal
    const modal = document.getElementById('bookingModal');
    const closeBtn = document.querySelector('.close-modal');
    
    closeBtn.addEventListener('click', () => {
        modal.classList.remove('active');
    });
    
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
        }
    });
    
    // Booking Form
    const bookingForm = document.getElementById('bookingForm');
    bookingForm.addEventListener('submit', handleBookingSubmit);
    
    // Date inputs for bill calculation
    document.getElementById('checkIn').addEventListener('change', calculateBill);
    document.getElementById('checkOut').addEventListener('change', calculateBill);
    
    // Extras checkboxes
    document.querySelectorAll('.extra-item input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', calculateBill);
    });
}

// ===== ROOM MANAGEMENT =====
function loadRooms() {
    const roomsGrid = document.getElementById('roomsGrid');
    roomsGrid.innerHTML = '';
    
    rooms.forEach((room, index) => {
        const roomCard = createRoomCard(room, index);
        roomsGrid.appendChild(roomCard);
    });
}

function createRoomCard(room, index) {
    const card = document.createElement('div');
    card.className = 'room-card';
    card.style.animationDelay = `${index * 0.1}s`;
    
    const statusClass = room.status === 'available' ? 'status-available' : 'status-booked';
    const statusText = room.status === 'available' ? 'AVAILABLE' : 'BOOKED';
    const buttonDisabled = room.status !== 'available' ? 'disabled' : '';
    const buttonText = room.status === 'available' ? 'Book Now' : 'Unavailable';
    
    card.innerHTML = `
        <div class="room-image">
            <img src="${room.image}" alt="${room.name}">
            <div class="room-status ${statusClass}">${statusText}</div>
        </div>
        <div class="room-details">
            <div class="room-header">
                <div class="room-floor">FLOOR ${room.floor}</div>
                <div class="room-price">₹${room.price.toLocaleString('en-IN')}<span>/night</span></div>
            </div>
            <h3 class="room-name">${room.name}</h3>
            <div class="room-features">
                ${room.features.map(feature => `
                    <span class="feature-tag">
                        <i class="fas fa-check"></i> ${feature}
                    </span>
                `).join('')}
            </div>
            <button class="room-book-btn" onclick="openBookingModal(${room.id})" ${buttonDisabled}>
                <i class="fas fa-calendar-check"></i> ${buttonText}
            </button>
        </div>
    `;
    
    return card;
}

function openBookingModal(roomId) {
    const room = rooms.find(r => r.id === roomId);
    if (!room || room.status !== 'available') return;
    
    document.getElementById('roomId').value = roomId;
    document.getElementById('bookingModal').classList.add('active');
    
    // Reset form
    document.getElementById('bookingForm').reset();
    document.getElementById('roomId').value = roomId;
    calculateBill();
}


// ===== BOOKING MANAGEMENT =====
function handleBookingSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const roomId = parseInt(formData.get('roomId'));
    const room = rooms.find(r => r.id === roomId);
    
    if (!room) return;
    
    const checkIn = new Date(formData.get('checkIn'));
    const checkOut = new Date(formData.get('checkOut'));
    const days = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
    
    // Calculate charges
    const roomCharges = room.price * days;
    let extrasCharges = 0;
    
    if (formData.get('breakfast')) extrasCharges += 500 * days;
    if (formData.get('parking')) extrasCharges += 200 * days;
    if (formData.get('spa')) extrasCharges += 2000;
    if (formData.get('airport')) extrasCharges += 1500;
    
    const subtotal = roomCharges + extrasCharges;
    const gst = subtotal * 0.12;
    const total = subtotal + gst;
    
    // Create booking
    const booking = {
        id: currentBookingId++,
        roomId: roomId,
        roomName: room.name,
        roomNumber: roomId,
        guestName: formData.get('guestName'),
        guestEmail: formData.get('guestEmail'),
        guestPhone: formData.get('guestPhone'),
        checkIn: formData.get('checkIn'),
        checkOut: formData.get('checkOut'),
        guests: formData.get('guests'),
        extras: {
            breakfast: formData.get('breakfast') ? true : false,
            parking: formData.get('parking') ? true : false,
            spa: formData.get('spa') ? true : false,
            airport: formData.get('airport') ? true : false
        },
        roomCharges: roomCharges,
        extrasCharges: extrasCharges,
        gst: gst,
        total: total,
        status: 'confirmed',
        bookingDate: new Date().toISOString()
    };
    
    bookings.push(booking);
    
    // Update room status
    room.status = 'booked';
    
    // Close modal and refresh
    document.getElementById('bookingModal').classList.remove('active');
    
    // Show success message
    showToast('Booking confirmed successfully! 🎉', 'success');
    
    // Refresh displays
    loadRooms();
    loadBookings();
    loadFloorAvailability();
    loadAdminDashboard();
    
    // Scroll to bookings
    setTimeout(() => scrollToSection('bookings'), 500);
}

function loadBookings() {
    const container = document.getElementById('bookingsContainer');
    
    if (bookings.length === 0) {
        container.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 60px; color: var(--text-light);">
                <i class="fas fa-calendar-times" style="font-size: 64px; margin-bottom: 20px; opacity: 0.3;"></i>
                <h3>No bookings yet</h3>
                <p>Start by booking a room from our collection</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = '';
    
    bookings.forEach(booking => {
        const card = createBookingCard(booking);
        container.appendChild(card);
    });
}


function createBookingCard(booking) {
    const card = document.createElement('div');
    card.className = 'booking-card';
    
    const statusClass = `status-${booking.status}`;
    const statusText = booking.status.toUpperCase();
    
    card.innerHTML = `
        <div class="booking-header">
            <div class="booking-id">Booking #${booking.id}</div>
            <div class="booking-status ${statusClass}">${statusText}</div>
        </div>
        <div class="booking-info">
            <div class="info-row">
                <span>Guest Name:</span>
                <strong>${booking.guestName}</strong>
            </div>
            <div class="info-row">
                <span>Room:</span>
                <strong>${booking.roomName} (#${booking.roomNumber})</strong>
            </div>
            <div class="info-row">
                <span>Check-In:</span>
                <strong>${formatDate(booking.checkIn)}</strong>
            </div>
            <div class="info-row">
                <span>Check-Out:</span>
                <strong>${formatDate(booking.checkOut)}</strong>
            </div>
            <div class="info-row">
                <span>Guests:</span>
                <strong>${booking.guests}</strong>
            </div>
        </div>
        <div class="booking-total">₹${booking.total.toLocaleString('en-IN')}</div>
        <div class="booking-actions">
            ${booking.status === 'confirmed' ? `
                <button class="btn btn-cancel" onclick="cancelBooking(${booking.id})">
                    <i class="fas fa-times"></i> Cancel
                </button>
            ` : ''}
        </div>
    `;
    
    return card;
}

function cancelBooking(bookingId) {
    if (!confirm('Are you sure you want to cancel this booking?')) return;
    
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) return;
    
    booking.status = 'cancelled';
    
    // Free up the room
    const room = rooms.find(r => r.id === booking.roomId);
    if (room) room.status = 'available';
    
    showToast('Booking cancelled successfully', 'success');
    
    loadRooms();
    loadBookings();
    loadFloorAvailability();
    loadAdminDashboard();
}


// ===== FLOOR AVAILABILITY =====
function loadFloorAvailability() {
    const container = document.getElementById('floorAvailability');
    
    const floors = [1, 2, 3];
    
    // Sidebar availability
    container.innerHTML = '';
    floors.forEach(floor => {
        const floorRooms = rooms.filter(r => r.floor === floor);
        const floorDiv = document.createElement('div');
        floorDiv.className = 'floor-item';
        
        floorDiv.innerHTML = `
            <div class="floor-label">Floor ${floor}</div>
            <div class="floor-rooms">
                ${floorRooms.map(room => `
                    <div class="room-indicator ${room.status}" onclick="openBookingModal(${room.id})" title="${room.name} - ${room.status}">
                        <div class="room-number">${room.id}</div>
                        <div class="room-type">${room.type}</div>
                    </div>
                `).join('')}
            </div>
        `;
        
        container.appendChild(floorDiv);
    });
}

// ===== ADMIN DASHBOARD =====
function loadAdminDashboard() {
    // Calculate statistics
    const totalRevenue = bookings
        .filter(b => b.status === 'confirmed')
        .reduce((sum, b) => sum + b.total, 0);
    
    const totalRooms = rooms.length;
    const bookedRooms = rooms.filter(r => r.status === 'booked').length;
    const occupancyRate = Math.round((bookedRooms / totalRooms) * 100);
    
    const today = new Date().toISOString().split('T')[0];
    const checkIns = bookings.filter(b => b.checkIn === today && b.status === 'confirmed').length;
    const checkOuts = bookings.filter(b => b.checkOut === today && b.status === 'confirmed').length;
    
    // Update stats with animation
    animateValue('totalRevenue', 0, totalRevenue, 1500);
    animateValue('occupancyRate', 0, occupancyRate, 1500);
    animateValue('checkIns', 0, checkIns, 1000);
    animateValue('checkOuts', 0, checkOuts, 1000);
    
    // Load revenue chart
    loadRevenueChart();
}


function loadRevenueChart() {
    const canvas = document.getElementById('revenueChart');
    const ctx = canvas.getContext('2d');
    
    // Sample revenue data for last 7 months
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];
    const revenues = [3000, 2800, 2500, 2300, 3500, 2700, 4000];
    
    // Clear canvas
    canvas.width = canvas.offsetWidth;
    canvas.height = 300;
    
    const padding = 40;
    const chartWidth = canvas.width - padding * 2;
    const chartHeight = canvas.height - padding * 2;
    const maxRevenue = Math.max(...revenues);
    const barWidth = chartWidth / revenues.length;
    
    // Draw bars
    revenues.forEach((revenue, index) => {
        const barHeight = (revenue / maxRevenue) * chartHeight;
        const x = padding + index * barWidth + barWidth * 0.2;
        const y = canvas.height - padding - barHeight;
        const width = barWidth * 0.6;
        
        // Create gradient
        const gradient = ctx.createLinearGradient(0, y, 0, canvas.height - padding);
        gradient.addColorStop(0, '#D4AF37');
        gradient.addColorStop(1, '#FFD700');
        
        // Draw bar with animation effect
        ctx.fillStyle = gradient;
        ctx.fillRect(x, y, width, barHeight);
        
        // Draw value on top
        ctx.fillStyle = '#fff';
        ctx.font = '12px Poppins';
        ctx.textAlign = 'center';
        ctx.fillText(`₹${revenue}`, x + width / 2, y - 5);
        
        // Draw month label
        ctx.fillStyle = '#b8b8b8';
        ctx.fillText(months[index], x + width / 2, canvas.height - padding + 20);
    });
    
    // Draw axes
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, canvas.height - padding);
    ctx.lineTo(canvas.width - padding, canvas.height - padding);
    ctx.stroke();
}

// ===== BILL CALCULATION =====
function calculateBill() {
    const roomId = parseInt(document.getElementById('roomId').value);
    const room = rooms.find(r => r.id === roomId);
    
    if (!room) return;
    
    const checkIn = document.getElementById('checkIn').value;
    const checkOut = document.getElementById('checkOut').value;
    
    if (!checkIn || !checkOut) {
        document.getElementById('roomCharges').textContent = '₹0';
        document.getElementById('extrasCharges').textContent = '₹0';
        document.getElementById('gstCharges').textContent = '₹0';
        document.getElementById('totalCharges').textContent = '₹0';
        return;
    }
    
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const days = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
    
    if (days <= 0) {
        showToast('Check-out date must be after check-in date', 'error');
        return;
    }
    
    // Calculate room charges
    const roomCharges = room.price * days;
    
    // Calculate extras
    let extrasCharges = 0;
    const breakfast = document.querySelector('input[name="breakfast"]');
    const parking = document.querySelector('input[name="parking"]');
    const spa = document.querySelector('input[name="spa"]');
    const airport = document.querySelector('input[name="airport"]');
    
    if (breakfast && breakfast.checked) extrasCharges += 500 * days;
    if (parking && parking.checked) extrasCharges += 200 * days;
    if (spa && spa.checked) extrasCharges += 2000;
    if (airport && airport.checked) extrasCharges += 1500;
    
    // Calculate GST and total
    const subtotal = roomCharges + extrasCharges;
    const gst = subtotal * 0.12;
    const total = subtotal + gst;
    
    // Update display with animation
    animateValue('roomCharges', 0, roomCharges, 500, '₹');
    animateValue('extrasCharges', 0, extrasCharges, 500, '₹');
    animateValue('gstCharges', 0, gst, 500, '₹');
    animateValue('totalCharges', 0, total, 500, '₹');
}


// ===== UTILITY FUNCTIONS =====
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        const offset = 80;
        const elementPosition = section.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - offset;
        
        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
    }
}

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type} show`;
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function setMinDate() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('checkIn').setAttribute('min', today);
    document.getElementById('checkOut').setAttribute('min', today);
    
    document.getElementById('checkIn').addEventListener('change', function() {
        const checkInDate = this.value;
        document.getElementById('checkOut').setAttribute('min', checkInDate);
    });
}

function animateValue(id, start, end, duration, prefix = '') {
    const element = document.getElementById(id);
    if (!element) return;
    
    const range = end - start;
    const increment = range / (duration / 16);
    let current = start;
    
    const timer = setInterval(() => {
        current += increment;
        if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
            current = end;
            clearInterval(timer);
        }
        
        if (prefix === '₹') {
            element.textContent = prefix + Math.round(current).toLocaleString('en-IN');
        } else {
            element.textContent = Math.round(current);
        }
    }, 16);
}

function animateCounters() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = parseInt(entry.target.getAttribute('data-target'));
                animateValue(entry.target, 0, target, 2000);
                observer.unobserve(entry.target);
            }
        });
    });
    
    document.querySelectorAll('.stat-number').forEach(counter => {
        observer.observe(counter);
    });
}

// ===== NAVBAR SCROLL EFFECT =====
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.style.background = 'rgba(26, 31, 46, 0.98)';
        navbar.style.boxShadow = '0 5px 20px rgba(0, 0, 0, 0.3)';
    } else {
        navbar.style.background = 'rgba(26, 31, 46, 0.95)';
        navbar.style.boxShadow = 'none';
    }
});

console.log('🏨 Grand Luxe Hotel Management System Initialized');
console.log('✨ All features loaded successfully');
