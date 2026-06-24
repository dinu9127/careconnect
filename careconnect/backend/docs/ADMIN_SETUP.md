# Admin Users Page - Setup Instructions

## Issue
The admin users page was showing "Failed to load users. Please try again." error.

## Root Cause
The `/api/users` endpoint requires:
1. **Authentication**: Valid JWT token (Bearer token in Authorization header)
2. **Authorization**: User must have `admin` role

The database had no admin user, so login was not possible.

## Solution

### Step 1: Seed Admin User
Run the seed script to create the admin user:

```bash
cd backend
node seed-data.js
```

This will create:
- **Admin User**
  - Email: `admin@careconnect.lk`
  - Password: `admin123456`
  - Role: `admin`

- **10 Caregiver test users** (for testing)

### Step 2: Login as Admin
1. Navigate to `http://localhost:3000/login`
2. Login with:
   - Email: `admin@careconnect.lk`
   - Password: `admin123456`

### Step 3: Access Admin Dashboard
- Go to `http://localhost:3000/admin/users`
- The users page should now load successfully

## Files Modified/Created

### Created Files:
- `backend/src/seeds/adminSeeds.js` - Admin user seed script
- `backend/seed-data.js` - Master seed script for all data

### Modified Files:
- `frontend/src/pages/admin/Users.jsx` - Enhanced error handling with better error messages

## What Changed in Frontend
- Added filter dependency to useEffect (refetch when filter changes)
- Improved error messaging to show actual error from server
- Better logging for debugging

## Important Notes
⚠️ **Security Warning**: The default admin password `admin123456` should be changed immediately in production. This is for testing purposes only.

## Troubleshooting

If you still see "Failed to load users":
1. **Check your login**: Make sure you're logged in with the admin account
2. **Check browser console**: Look for the actual error message
3. **Check server logs**: Backend should show authorization errors if user doesn't have admin role
4. **Clear session**: Log out and log back in with admin credentials
