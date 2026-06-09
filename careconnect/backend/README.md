# CareConnect Backend

Backend API for the CareConnect healthcare management platform.

## Tech Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **bcryptjs** - Password hashing

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your configuration
# Add MongoDB URI, JWT secret, etc.

# Start development server
npm run dev

# Start production server
npm start
```

## Environment Variables

Create a `.env` file in the backend directory:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/careconnect
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=7d
NODE_ENV=development
```

## API Endpoints

### Authentication
- POST `/api/auth/register` - Register new user
- POST `/api/auth/login` - Login user
- GET `/api/auth/profile` - Get user profile (protected)

### Users
- GET `/api/users` - Get all users (admin)
- GET `/api/users/:id` - Get user by ID
- PUT `/api/users/:id` - Update user
- DELETE `/api/users/:id` - Delete user (admin)

### Caregivers
- GET `/api/caregivers` - Get all caregivers
- GET `/api/caregivers/:id` - Get caregiver by ID
- PUT `/api/caregivers/:id` - Update caregiver profile

### Bookings
- POST `/api/bookings` - Create new booking
- GET `/api/bookings` - Get all bookings
- GET `/api/bookings/:id` - Get booking by ID
- PUT `/api/bookings/:id` - Update booking
- DELETE `/api/bookings/:id` - Cancel booking

## Project Structure

```
src/
├── controllers/     # Request handlers
├── models/         # Database models
├── routes/         # API routes
├── middleware/     # Custom middleware
└── server.js       # Entry point

config/
└── db.js          # Database configuration
```

## License

MIT
