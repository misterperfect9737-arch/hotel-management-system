# 🏨 Grand Luxe Hotel Management System

A modern, full-stack hotel management system featuring real-time room booking, dynamic billing with GST calculation, and comprehensive admin analytics dashboard.

## 📋 Table of Contents
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [Screenshots](#screenshots)

## ✨ Features

### Guest Features
- **Real-Time Room Booking** - Instant booking with live availability tracking
- **Dynamic Billing System** - Automated price calculation with 12% GST
- **Room Selection** - Browse luxury rooms (₹2,500 - ₹12,000)
- **Booking Management** - View and cancel reservations
- **Additional Services** - Breakfast, parking, spa, airport pickup options
- **24/7 Support** - Instant contact support access

### Admin Features
- **Analytics Dashboard** - Real-time revenue, occupancy, and check-in/out statistics
- **Revenue Charts** - Visual analytics with Chart.js integration
- **Room Management** - Live room status tracking across all floors
- **Floor Availability** - Real-time room status by floor and type
- **Booking Overview** - Complete booking history and management

### Design Features
- Modern dark theme with gold accents (#D4AF37)
- Smooth animations and transitions
- Fully responsive layout
- Indian Rupee (₹) pricing
- Professional and intuitive interface

## 🛠️ Tech Stack

**Frontend:**
- HTML5 - Semantic markup
- CSS3 - Modern styling with animations
- JavaScript (Vanilla) - No frameworks, pure JS
- Font Awesome - Icons
- Google Fonts - Typography

**Backend:**
- Python 3.8+ - Programming language
- Flask 2.0+ - Web framework
- Flask-CORS - Cross-origin support

**Database:**
- MySQL 8.0+ - Relational database
- mysql-connector-python - Database driver

## 🚀 Installation

### Prerequisites
- Python 3.8 or higher
- MySQL 8.0 or higher (optional)
- Modern web browser

### Step 1: Clone Repository
```bash
git clone https://github.com/yourusername/hotel-management-system.git
cd hotel-management-system
```

### Step 2: Install Dependencies
```bash
pip install -r requirements.txt
```

### Step 3: Setup Database (Optional)
```sql
CREATE DATABASE hotel_management;
```

Import schema:
```bash
mysql -u root -p hotel_management < database.sql
```

Update database credentials in `app.py` (line 17):
```python
DB_CONFIG = {
    'host': 'localhost',
    'user': 'root',
    'password': 'your_password',  # Change this
    'database': 'hotel_management'
}
```

### Step 4: Run Server
```bash
python app.py
```

### Step 5: Open Browser
Navigate to: **http://localhost:5000**

## 💻 Usage

### For Guests
1. Browse available luxury rooms
2. Select dates and additional services
3. View dynamic pricing with GST
4. Confirm booking
5. Manage reservations

### For Admins
1. Access dashboard at `/admin` section
2. View real-time analytics
3. Monitor room availability
4. Track revenue trends
5. Manage all bookings

## 📁 Project Structure

```
hotel-management-system/
├── index.html          # Frontend interface
├── styles.css          # Styling and animations
├── script.js           # Business logic
├── app.py              # Flask backend API
├── database.sql        # MySQL database schema
├── requirements.txt    # Python dependencies
├── .gitignore          # Git ignore rules
└── README.md           # Project documentation
```

## 📊 Project Statistics

| Metric | Value |
|--------|-------|
| Total Lines of Code | 3,500+ |
| HTML | 274 lines |
| CSS | 1,200 lines |
| JavaScript | 1,500 lines |
| Python | 400 lines |
| SQL | 100 lines |
| Features | 10+ |
| API Endpoints | 8+ |
| Database Tables | 3 |

## 🎨 Screenshots

### Hero Section
Modern landing page with real-time statistics (40+ Rooms, 98% Satisfaction, 24/7 Support)

### Room Selection
Luxury room cards with pricing and real-time floor availability display

### Booking System
Dynamic billing calculator with additional services selection

### Admin Dashboard
Revenue analytics, occupancy tracking, and visual charts

## 🎯 Key Highlights

- **100% Accurate Billing** - Automated GST calculation
- **Real-Time Updates** - Live room availability tracking
- **Modern UI/UX** - Professional design with smooth animations
- **Scalable Architecture** - RESTful API design
- **Production Ready** - Clean, well-organized code

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is licensed under the MIT License.

## 👨‍💻 Author

**Your Name**
- GitHub: [@yourusername](https://github.com/yourusername)
- Email: your.email@example.com

## 🙏 Acknowledgments

- Font Awesome for icons
- Google Fonts for typography
- Chart.js for data visualization
- Flask community for excellent documentation

---

<div align="center">

**⭐ Star this repository if you found it helpful! ⭐**

Made with ❤️ for modern hotel management

</div>
