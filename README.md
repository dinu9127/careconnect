# CareConnect - Healthcare Management Platform

A full-stack MERN (MongoDB, Express, React, Node.js) application for connecting caregivers with clients who need healthcare services.

## Quick Overview

CareConnect is a modern healthcare management platform that facilitates:
- **Clients** - Find and book qualified caregivers
- **Caregivers** - Manage availability and build their professional profile
- **Admin** - Oversee the platform, manage complaints, and verify caregivers

## Technology Stack

### Frontend
- React 18 with Vite
- TailwindCSS for styling
- React Router for navigation
- Axios for API calls

### Backend
- Node.js with Express.js
- MongoDB with Mongoose
- JWT authentication
- bcryptjs for password hashing

## Project Setup

This project is organized into clearly separated frontend and backend directories. Detailed setup instructions for each are below.

### Frontend Setup

Navigate to `careconnect/frontend/` and follow the [Frontend README](careconnect/frontend/README.md) for:
- Installation steps
- Development server startup
- Build instructions
- Project structure overview

```bash
cd careconnect/frontend
npm install
npm run dev
```

### Backend Setup

Navigate to `careconnect/backend/` and follow the [Backend README](careconnect/backend/README.md) for:
- Prerequisites and installation
- Environment configuration
- Server startup
- API documentation

```bash
cd careconnect/backend
npm install
npm run dev
```

## Key Features

### For Clients
- Browse available caregivers
- Book services
- Manage bookings
- Rate and review caregivers
- File complaints and feedback

### For Caregivers
- Professional profile management
- Upload verification documents (ID, NVQ, professional certificates)
- Manage availability schedule
- View bookings and earnings
- Build reputation through client reviews

### For Admin
- Dashboard overview
- Caregiver verification management
- Complaint resolution system
- Platform analytics and reporting
- User management

## API Documentation

API endpoints and detailed documentation are available in the [Backend README](careconnect/backend/README.md).

## Project Structure

```
careconnect/
├── frontend/                # React + Vite + TailwindCSS
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components by role
│   │   ├── routes/        # Route configuration
│   │   ├── services/      # API client
│   │   └── utils/         # Helper functions
│   └── package.json
│
└── backend/                # Node.js + Express + MongoDB
    ├── src/
    │   ├── controllers/   # Request handlers
    │   ├── models/        # Database schemas
    │   ├── routes/        # API routes
    │   ├── middleware/    # Custom middleware
    │   └── server.js      # Entry point
    ├── config/
    └── package.json
```

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
