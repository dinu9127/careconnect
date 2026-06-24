# 📋 CareConnect - Quick Reference Guide

## 🎯 Quick Start Commands

```bash
# Backend
cd backend
npm install
npm run dev          # Starts on http://localhost:5000

# Frontend (new terminal)
cd frontend
npm install
npm run dev          # Starts on http://localhost:3000
```

## 🔐 Test Credentials

Create these accounts for testing:

| Role      | Email              | Password     |
|-----------|-------------------|--------------|
| Client    | client@test.com   | Client123    |
| Caregiver | caregiver@test.com| Caregiver123 |
| Admin     | admin@test.com    | Admin123     |

## 📡 API Quick Reference

### Auth Endpoints
```bash
# Register
POST /api/auth/register
Body: { name, email, password, role }

# Login
POST /api/auth/login
Body: { email, password }

# Get Profile (requires token)
GET /api/auth/profile
Header: Authorization: Bearer <token>
```

### User Endpoints
```bash
# Get all users (admin only)
GET /api/users

# Get user by ID
GET /api/users/:id

# Update user
PUT /api/users/:id

# Delete user (admin only)
DELETE /api/users/:id
```

### Caregiver Endpoints
```bash
# Get all caregivers
GET /api/caregivers

# Get caregiver by ID
GET /api/caregivers/:id

# Update caregiver
PUT /api/caregivers/:id
```

### Booking Endpoints
```bash
# Create booking
POST /api/bookings
Body: { caregiverId, serviceType, startDate, endDate, notes }

# Get bookings
GET /api/bookings

# Update booking
PUT /api/bookings/:id

# Cancel booking
DELETE /api/bookings/:id
```

## 🛠️ Useful Utilities

### Custom Hooks (Frontend)

```jsx
import { useForm, useApi, useAuth } from '@/hooks/useCustomHooks';

// Form handling with validation
const { values, errors, handleChange, handleSubmit } = useForm(
  initialValues,
  onSubmit,
  validateFunction
);

// API calls with loading states
const { data, loading, error, execute } = useApi(apiFunction);

// Authentication
const { user, isAuthenticated, login, logout } = useAuth();
```

### Validation Functions

```jsx
import {
  validateLoginForm,
  validateRegisterForm,
  validateBookingForm
} from '@/utils/validation';

const errors = validateLoginForm(formData);
```

### UI Components

```jsx
import {
  Alert,
  LoadingSpinner,
  EmptyState,
  FieldError,
  Badge
} from '@/components/ui/Feedback';

<Alert type="success" message="Login successful!" />
<LoadingSpinner size="md" message="Loading..." />
<FieldError message={errors.email} />
```

## 🎨 Tailwind CSS Classes Reference

### Colors
- Primary: `indigo-600`, `blue-600`
- Success: `green-600`
- Error: `red-600`
- Warning: `yellow-600`

### Common Patterns
```jsx
// Button
className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"

// Input
className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"

// Card
className="bg-white rounded-lg shadow-sm border border-slate-200 p-6"
```

## 📂 Project Structure Overview

```
backend/src/
├── controllers/  → Business logic
├── middleware/   → Auth, validation, errors
├── models/       → Database schemas
└── routes/       → API endpoints

frontend/src/
├── components/   → Reusable UI components
├── pages/        → Page components
├── hooks/        → Custom React hooks
├── services/     → API calls
└── utils/        → Helper functions
```

## 🔍 Common Tasks

### Add New API Endpoint

1. Create controller in `backend/src/controllers/`
2. Add validation in `backend/src/middleware/validator.js`
3. Define route in `backend/src/routes/`
4. Import route in `backend/src/server.js`
5. Add service function in `frontend/src/services/api.js`

### Add New Page

1. Create page component in `frontend/src/pages/`
2. Add route in `frontend/src/routes/AppRoutes.jsx`
3. Add navigation link in `Navbar.jsx` or `Sidebar.jsx`

### Add Form Validation

1. Create validation function in `frontend/src/utils/validation.js`
2. Use with `useForm` hook
3. Display errors with `FieldError` component

## 🧪 Testing

### Backend Test Example
```javascript
import { authService } from '../services/api';

describe('Auth Service', () => {
  it('should login successfully', async () => {
    const result = await authService.login({
      email: 'test@example.com',
      password: 'Test123'
    });
    expect(result.success).toBe(true);
  });
});
```

### Frontend Test Example
```jsx
import { render, screen } from '@testing-library/react';
import App from './App';

describe('App', () => {
  it('renders without crashing', () => {
    render(<App />);
    expect(true).toBe(true);
  });
});
```

## 🐛 Debugging Tips

### Check API Response
```javascript
console.log('API Response:', response.data);
console.log('Error:', error.response?.data);
```

### Check Form Values
```javascript
console.log('Form Values:', values);
console.log('Form Errors:', errors);
```

### MongoDB Queries
```javascript
// In controller
console.log('Query:', req.query);
console.log('Body:', req.body);
console.log('User:', req.user);
```

## 🔑 Environment Variables Quick Reference

### Backend
- `PORT` - Server port (default: 5000)
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret for JWT tokens
- `JWT_EXPIRE` - Token expiration time
- `NODE_ENV` - development/production

### Frontend
- `VITE_API_URL` - Backend API URL
- `VITE_APP_NAME` - Application name

## 📚 Documentation Links

- [Express.js](https://expressjs.com/)
- [React](https://react.dev/)
- [MongoDB/Mongoose](https://mongoosejs.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [React Router](https://reactrouter.com/)
- [Vite](https://vitejs.dev/)

## 🚀 Performance Tips

1. **Backend**: Use indexes on frequently queried fields
2. **Frontend**: Lazy load pages with `React.lazy()`
3. **API**: Implement pagination for large datasets
4. **Images**: Optimize and use proper formats
5. **Caching**: Consider Redis for session management

## 🔒 Security Checklist

- ✅ Passwords hashed with bcrypt
- ✅ JWT for authentication
- ✅ Input validation on all endpoints
- ✅ CORS configured
- ⚠️ TODO: Rate limiting
- ⚠️ TODO: Helmet for security headers
- ⚠️ TODO: Input sanitization

## 📦 Deployment Checklist

- [ ] Update JWT_SECRET to strong random string
- [ ] Set NODE_ENV=production
- [ ] Update MONGODB_URI to production database
- [ ] Build frontend: `npm run build`
- [ ] Test all endpoints
- [ ] Set up monitoring/logging
- [ ] Configure domain and SSL
- [ ] Set up backups
- [ ] Review security settings

---

**Need help?** Check [SETUP_GUIDE.md](./SETUP_GUIDE.md) or [API_DOCUMENTATION.md](./backend/API_DOCUMENTATION.md)
