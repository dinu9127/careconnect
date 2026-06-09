# CareConnect - Healthcare Management Platform

A full-stack MERN (MongoDB, Express, React, Node.js) application for connecting caregivers with clients who need healthcare services.


## Getting Started (Quick Start)

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd careconnectv1
   ```

2. **Setup Backend:**
   ```bash
   cd careconnect/backend
   npm install
   # Configure .env with MongoDB URI and other variables
   npm run dev
   ```

3. **Setup Frontend (in a new terminal):**
   ```bash
   cd careconnect/frontend
   npm install
   npm run dev
   ```

4. **Access the application:**
   - Frontend: http://localhost:5173 (or the port shown in terminal)
   - Backend API: http://localhost:5000

## Users & Roles

The platform supports three main user roles:

| Role | Access | Key Features |
|------|--------|--------------|
| **Client** | Browse caregivers, book services | Manage bookings, reviews, complaints |
| **Caregiver** | Manage profile & availability | Verification documents, schedule management |
| **Admin** | Full platform access | User management, complaint resolution, verification |

## Documentation

For additional resources, refer to:
- [Implementation Guide](IMPLEMENTATION_GUIDE.md)
- [Architecture Overview](ARCHITECTURE.md)
- [Setup Guide](careconnect/SETUP_GUIDE.md)
- [Developer Guide](careconnect/DEVELOPER_GUIDE.md)

## Support

For technical issues or questions, please refer to the individual README files in the frontend and backend directories.

---

**Last Updated:** March 2, 2026

### User Roles
- **Client**: Book caregivers, manage appointments
- **Caregiver**: Manage availability, view bookings, track earnings
- **Admin**: Manage users, view analytics, system oversight

### Core Functionality
- User authentication & authorization (JWT)
- Role-based access control
- Caregiver profiles with specializations & ratings
- Booking management system
- Responsive dashboard for each role
- RESTful API architecture

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

