import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'

// Pages
import Home from '../pages/Home'
import Login from '../pages/auth/Login'
import Register from '../pages/auth/Register'
import Profile from '../pages/Profile'
import ClientDashboard from '../pages/client/Dashboard'
import Caregivers from '../pages/client/Caregivers'
import Bookings from '../pages/client/Bookings'
import Complaints from '../pages/client/Complaints'
import CaregiverDashboard from '../pages/caregiver/Dashboard'
import UpdateAvailability from '../pages/caregiver/UpdateAvailability'
import UpdateProfile from '../pages/caregiver/UpdateProfile'
import UpdateVerification from '../pages/caregiver/UpdateVerification'
import AdminDashboard from '../pages/admin/Dashboard'
import AdminComplaints from '../pages/admin/Complaints'
import AdminPayments from '../pages/admin/Payments'

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Profile Route */}
      <Route path="/profile" element={<Profile />} />

      {/* Client Routes */}
      <Route path="/client/dashboard" element={<ClientDashboard />} />
      <Route path="/client/caregivers" element={<Caregivers />} />
      <Route path="/client/bookings" element={<Bookings />} />
      <Route path="/client/complaints" element={<Complaints />} />
      <Route path="/caregivers" element={<Caregivers />} />

      {/* Caregiver Routes */}
      <Route path="/caregiver/dashboard" element={<CaregiverDashboard />} />
      <Route path="/caregiver/availability" element={<UpdateAvailability />} />
      <Route path="/caregiver/profile" element={<UpdateProfile />} />
      <Route path="/caregiver/verification" element={<UpdateVerification />} />

      {/* Admin Routes */}
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/admin/complaints" element={<AdminComplaints />} />
      <Route path="/admin/payments" element={<AdminPayments />} />

      {/* Catch all - redirect to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default AppRoutes
