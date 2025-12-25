# CareConnect - Healthcare Management Platform

A full-stack MERN (MongoDB, Express, React, Node.js) application for connecting caregivers with clients who need healthcare services.

## Project Structure

```
careconnect/
├── frontend/                # React + Vite + TailwindCSS
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   │   ├── layout/    # Navbar, Sidebar
│   │   │   └── ui/        # Button, Input
│   │   ├── pages/         # Page components
│   │   │   ├── auth/      # Login, Register
│   │   │   ├── client/    # Client Dashboard
│   │   │   ├── caregiver/ # Caregiver Dashboard
│   │   │   └── admin/     # Admin Dashboard
│   │   ├── routes/        # React Router configuration
│   │   ├── services/      # API service layer
│   │   └── utils/         # Helper functions
│   ├── public/
│   └── package.json
│
└── backend/                # Node.js + Express + MongoDB
    ├── src/
    │   ├── controllers/   # Request handlers
    │   │   ├── authController.js
    │   │   ├── userController.js
    │   │   ├── caregiverController.js
    │   │   └── bookingController.js
    │   ├── models/        # Mongoose schemas
    │   │   ├── User.js
    │   │   ├── Caregiver.js
    │   │   └── Booking.js
    │   ├── routes/        # API routes
    │   │   ├── authRoutes.js
    │   │   ├── userRoutes.js
    │   │   ├── caregiverRoutes.js
    │   │   └── bookingRoutes.js
    │   ├── middleware/    # Custom middleware
    │   │   ├── auth.js
    │   │   └── errorHandler.js
    │   └── server.js      # Entry point
    ├── config/
    │   └── db.js          # Database configuration
    └── package.json
```

## Features

### User Roles
- **Client**: Book caregivers, manage appointments
- **Caregiver**: Manage availability, view bookings, track earnings
- **Admin**: Manage users, view analytics, system oversight

### Core Functionality
- ✅ User authentication & authorization (JWT)
- ✅ Role-based access control
- ✅ Caregiver profiles with specializations & ratings
- ✅ Booking management system
- ✅ Responsive dashboard for each role
- ✅ RESTful API architecture

## Tech Stack

### Frontend
- **React 18** - UI library
- **Vite** - Build tool
- **React Router v6** - Client-side routing
- **TailwindCSS** - Utility-first CSS
- **Axios** - HTTP client

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn

### Installation

#### 1. Clone the repository
```bash
git clone <repository-url>
cd careconnect
```

#### 2. Setup Backend
```bash
cd backend
npm install

# Create .env file
cp .env.example .env

# Edit .env with your configuration:
# PORT=5000
# MONGODB_URI=mongodb://localhost:27017/careconnect
# JWT_SECRET=your_secret_key
# JWT_EXPIRE=7d

# Start backend server
npm run dev
```

Backend runs on http://localhost:5000

#### 3. Setup Frontend
```bash
cd ../frontend
npm install

# Create .env file (optional)
# VITE_API_URL=http://localhost:5000/api

# Start frontend development server
npm run dev
```

Frontend runs on http://localhost:3000

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile (Protected)

### Users
- `GET /api/users` - Get all users (Admin only)
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user (Admin only)

### Caregivers
- `GET /api/caregivers` - Get all caregivers
- `GET /api/caregivers/:id` - Get caregiver by ID
- `POST /api/caregivers` - Create caregiver profile (Caregiver only)
- `PUT /api/caregivers/:id` - Update caregiver profile

### Bookings
- `POST /api/bookings` - Create booking
- `GET /api/bookings` - Get all bookings
- `GET /api/bookings/:id` - Get booking by ID
- `PUT /api/bookings/:id` - Update booking
- `DELETE /api/bookings/:id` - Cancel booking

## Development

### Running Tests
```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

### Building for Production
```bash
# Build frontend
cd frontend
npm run build

# Start backend in production
cd backend
npm start
```

## Environment Variables

### Backend (.env)
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/careconnect
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=7d
NODE_ENV=development
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

MIT License - see LICENSE file for details

## Contact

Project Link: [https://github.com/yourusername/careconnect](https://github.com/yourusername/careconnect)

---

**Happy Coding! 🚀**
