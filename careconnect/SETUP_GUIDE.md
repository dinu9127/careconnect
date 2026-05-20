# 🚀 CareConnect - Setup & Installation Guide

## Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **MongoDB** (v6 or higher) - [Download](https://www.mongodb.com/try/download/community)
- **Git** - [Download](https://git-scm.com/)

## 📦 Installation Steps

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/careconnectv1.git
cd careconnectv1/careconnect
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# The .env file is already created, but verify these settings:
# - PORT=5000
# - MONGODB_URI=mongodb://localhost:27017/careconnect
# - JWT_SECRET=careconnect_super_secret_jwt_key_change_in_production_2026
# - JWT_EXPIRE=7d
# - NODE_ENV=development

# Start MongoDB (if not running)
# Windows: mongod
# Mac/Linux: sudo systemctl start mongod

# Start the backend server
npm run dev
```

The backend server should now be running at `http://localhost:5000`

### 3. Frontend Setup

Open a new terminal window:

```bash
# Navigate to frontend directory (from project root)
cd frontend

# Install dependencies
npm install

# The .env file is already created with:
# VITE_API_URL=http://localhost:5000/api
# VITE_APP_NAME=CareConnect

# Start the development server
npm run dev
```

The frontend should now be running at `http://localhost:3000`

## 🧪 Running Tests

### Backend Tests

```bash
cd backend
npm test
```

### Frontend Tests

```bash
cd frontend
npm test
```

## 📊 Database Setup

MongoDB will automatically create the `careconnect` database when you first run the application. The schemas are defined in the models:

- **Users**: Authentication and user profiles
- **Caregivers**: Caregiver profiles and information
- **Bookings**: Service booking records

## 🔑 Environment Variables

### Backend (.env)

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/careconnect
JWT_SECRET=careconnect_super_secret_jwt_key_change_in_production_2026
JWT_EXPIRE=7d
NODE_ENV=development
```

### Frontend (.env)

```env
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=CareConnect
```

## 📝 Available Scripts

### Backend

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode

### Frontend

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm test` - Run tests
- `npm run test:ui` - Run tests with UI
- `npm run lint` - Run ESLint

## 🎯 Testing the Application

### 1. Create Test Users

You can register users through the UI or use the API directly:

**Register a Client:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Client",
    "email": "client@test.com",
    "password": "Client123",
    "role": "client"
  }'
```

**Register a Caregiver:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Caregiver",
    "email": "caregiver@test.com",
    "password": "Caregiver123",
    "role": "caregiver"
  }'
```

**Register an Admin:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin User",
    "email": "admin@test.com",
    "password": "Admin123",
    "role": "admin"
  }'
```

### 2. Login

Navigate to `http://localhost:3000/login` and use the credentials you created.

### 3. Test Features

- **Client Dashboard**: Browse caregivers, create bookings
- **Caregiver Dashboard**: View and manage bookings
- **Admin Dashboard**: Manage users and oversee platform

## 🔧 Troubleshooting

### MongoDB Connection Issues

**Problem**: "MongooseServerSelectionError"

**Solution**:
1. Ensure MongoDB is running: `mongod`
2. Check the connection string in `.env`
3. Verify MongoDB is listening on port 27017

### Port Already in Use

**Problem**: "EADDRINUSE: address already in use :::5000"

**Solution**:
1. Change PORT in backend `.env` to a different port
2. Or stop the process using that port:
   - Windows: `netstat -ano | findstr :5000` then `taskkill /PID <PID> /F`
   - Mac/Linux: `lsof -ti:5000 | xargs kill`

### CORS Issues

**Problem**: CORS policy blocking requests

**Solution**: The backend already has CORS enabled. Ensure the frontend is making requests to the correct API URL.

### Module Not Found

**Problem**: "Cannot find module"

**Solution**:
```bash
# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall dependencies
npm install
```

## 🌐 API Documentation

Full API documentation is available at:
- File: `backend/API_DOCUMENTATION.md`
- Includes all endpoints, request/response formats, and examples

## 🏗️ Project Structure

```
careconnect/
├── backend/
│   ├── config/          # Database configuration
│   ├── src/
│   │   ├── controllers/ # Request handlers
│   │   ├── middleware/  # Auth, validation, error handling
│   │   ├── models/      # Mongoose schemas
│   │   ├── routes/      # API routes
│   │   └── server.js    # Entry point
│   ├── tests/           # Test files
│   ├── .env             # Environment variables
│   └── package.json
│
└── frontend/
    ├── public/          # Static assets
    ├── src/
    │   ├── components/  # Reusable components
    │   ├── hooks/       # Custom React hooks
    │   ├── pages/       # Page components
    │   ├── routes/      # Router configuration
    │   ├── services/    # API services
    │   ├── utils/       # Utilities & helpers
    │   └── test/        # Test files
    ├── .env             # Environment variables
    └── package.json
```

## 📚 Next Steps

1. **Customize**: Update branding, colors, and content
2. **Enhance**: Add more features specific to your needs
3. **Test**: Write comprehensive tests
4. **Deploy**: Prepare for production deployment
5. **Secure**: Update JWT_SECRET and other sensitive credentials

## 🚢 Deployment

For production deployment:

1. **Update Environment Variables**:
   - Use strong JWT_SECRET
   - Update MONGODB_URI to production database
   - Set NODE_ENV=production

2. **Build Frontend**:
   ```bash
   cd frontend
   npm run build
   ```

3. **Choose Hosting**:
   - Backend: Heroku, Railway, Render, AWS, DigitalOcean
   - Frontend: Vercel, Netlify, AWS S3 + CloudFront
   - Database: MongoDB Atlas, AWS DocumentDB

## 📧 Support

For issues and questions:
- Check the API documentation
- Review the troubleshooting section
- Create an issue on GitHub

---

Happy coding! 🎉
