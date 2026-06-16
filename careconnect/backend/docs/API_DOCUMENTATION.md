# CareConnect API Documentation

Base URL: `http://localhost:5000/api`

## Authentication

All authenticated endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## Auth Endpoints

### Register User
**POST** `/auth/register`

Creates a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123",
  "role": "client" // Optional: "client", "caregiver", or "admin"
}
```

**Validation Rules:**
- `name`: 2-50 characters
- `email`: Valid email format
- `password`: Min 6 characters, must contain uppercase, lowercase, and number
- `role`: Optional, defaults to "client"

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "_id": "65abc123...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "client",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Please provide a valid email"
    }
  ]
}
```

---

### Login
**POST** `/auth/login`

Authenticates a user and returns a JWT token.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "65abc123...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "client",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Response (401):**
```json
{
  "success": false,
  "message": "Invalid credentials"
}
```

---

### Get Profile
**GET** `/auth/profile`

🔒 **Protected Route** - Requires authentication

Returns the current user's profile information.

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "65abc123...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "client",
    "phone": "+1234567890",
    "address": "123 Main St",
    "isActive": true,
    "createdAt": "2026-01-20T10:00:00.000Z"
  }
}
```

---

## User Endpoints

### Get All Users
**GET** `/users`

🔒 **Admin Only** - Requires admin role

Retrieves a list of all users.

**Success Response (200):**
```json
{
  "success": true,
  "count": 25,
  "data": [
    {
      "_id": "65abc123...",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "client",
      "isActive": true
    }
  ]
}
```

---

### Get User by ID
**GET** `/users/:id`

🔒 **Protected Route** - Requires authentication

Retrieves a specific user by ID.

**URL Parameters:**
- `id` (string, required): MongoDB ObjectId

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "65abc123...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "client",
    "phone": "+1234567890",
    "address": "123 Main St"
  }
}
```

**Error Response (404):**
```json
{
  "success": false,
  "message": "User not found"
}
```

---

### Update User
**PUT** `/users/:id`

🔒 **Protected Route** - Requires authentication

Updates user information.

**URL Parameters:**
- `id` (string, required): MongoDB ObjectId

**Request Body (all fields optional):**
```json
{
  "name": "John Smith",
  "phone": "+1234567890",
  "address": "456 Oak Ave"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "65abc123...",
    "name": "John Smith",
    "email": "john@example.com",
    "phone": "+1234567890",
    "address": "456 Oak Ave"
  }
}
```

---

### Delete User
**DELETE** `/users/:id`

🔒 **Admin Only** - Requires admin role

Permanently deletes a user account.

**URL Parameters:**
- `id` (string, required): MongoDB ObjectId

**Success Response (200):**
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

---

## Caregiver Endpoints

### Get All Caregivers
**GET** `/caregivers`

🔒 **Protected Route** - Requires authentication

Retrieves all caregiver profiles with optional filtering.

**Query Parameters (optional):**
- `specialization`: Filter by specialization
- `minRate`: Minimum hourly rate
- `maxRate`: Maximum hourly rate

**Success Response (200):**
```json
{
  "success": true,
  "count": 10,
  "data": [
    {
      "_id": "65abc456...",
      "userId": "65abc123...",
      "specialization": "Elderly Care",
      "experience": 5,
      "hourlyRate": 25,
      "availability": ["Monday", "Tuesday", "Wednesday"],
      "rating": 4.8,
      "bio": "Experienced caregiver..."
    }
  ]
}
```

---

### Get Caregiver by ID
**GET** `/caregivers/:id`

🔒 **Protected Route** - Requires authentication

Retrieves a specific caregiver profile.

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "65abc456...",
    "userId": {
      "_id": "65abc123...",
      "name": "Jane Smith",
      "email": "jane@example.com"
    },
    "specialization": "Elderly Care",
    "experience": 5,
    "hourlyRate": 25,
    "availability": ["Monday", "Tuesday", "Wednesday"],
    "rating": 4.8
  }
}
```

---

### Update Caregiver Profile
**PUT** `/caregivers/:id`

🔒 **Protected Route** - Requires authentication (own profile or admin)

Updates caregiver profile information.

**Request Body:**
```json
{
  "specialization": "Elderly Care",
  "experience": 6,
  "hourlyRate": 30,
  "availability": ["Monday", "Tuesday", "Thursday"],
  "bio": "Updated bio..."
}
```

**Validation Rules:**
- `specialization`: 2-100 characters
- `experience`: 0-50 years
- `hourlyRate`: Positive number
- `availability`: Array of days

---

## Booking Endpoints

### Create Booking
**POST** `/bookings`

🔒 **Protected Route** - Requires client role

Creates a new booking request.

**Request Body:**
```json
{
  "caregiverId": "65abc456...",
  "serviceType": "Elderly Care",
  "startDate": "2026-02-01T09:00:00Z",
  "endDate": "2026-02-01T17:00:00Z",
  "notes": "Need assistance with daily activities"
}
```

**Validation Rules:**
- `caregiverId`: Valid MongoDB ObjectId
- `serviceType`: 2-100 characters
- `startDate`: Cannot be in the past
- `endDate`: Must be after startDate
- `notes`: Max 500 characters (optional)

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "_id": "65abc789...",
    "clientId": "65abc123...",
    "caregiverId": "65abc456...",
    "serviceType": "Elderly Care",
    "startDate": "2026-02-01T09:00:00Z",
    "endDate": "2026-02-01T17:00:00Z",
    "status": "pending",
    "totalCost": 200
  }
}
```

---

### Get Bookings
**GET** `/bookings`

🔒 **Protected Route** - Requires authentication

Retrieves bookings for the authenticated user.

**Query Parameters (optional):**
- `status`: Filter by status (pending, confirmed, completed, cancelled)
- `startDate`: Filter bookings from this date
- `endDate`: Filter bookings until this date

**Success Response (200):**
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "_id": "65abc789...",
      "client": {
        "name": "John Doe",
        "email": "john@example.com"
      },
      "caregiver": {
        "name": "Jane Smith",
        "specialization": "Elderly Care"
      },
      "serviceType": "Elderly Care",
      "startDate": "2026-02-01T09:00:00Z",
      "endDate": "2026-02-01T17:00:00Z",
      "status": "confirmed",
      "totalCost": 200
    }
  ]
}
```

---

### Get Booking by ID
**GET** `/bookings/:id`

🔒 **Protected Route** - Requires authentication

Retrieves a specific booking.

---

### Update Booking
**PUT** `/bookings/:id`

🔒 **Protected Route** - Requires authentication

Updates booking details or status.

**Request Body:**
```json
{
  "status": "confirmed", // pending, confirmed, completed, cancelled
  "notes": "Updated notes"
}
```

---

### Cancel Booking
**DELETE** `/bookings/:id`

🔒 **Protected Route** - Requires authentication

Cancels a booking.

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [...]
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Not authorized, token failed"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Not authorized to access this resource"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Resource not found"
}
```

### 500 Server Error
```json
{
  "success": false,
  "message": "Server error message"
}
```

---

## Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

---

## Rate Limiting

Currently no rate limiting is implemented. Consider adding this for production.

## Pagination

For endpoints returning lists, consider implementing pagination:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
