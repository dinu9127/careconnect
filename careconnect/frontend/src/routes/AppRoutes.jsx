import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'

// Pages
import Home from '../pages/Home'
import Login from '../pages/auth/Login'
import Register from '../pages/auth/Register'
import ClientDashboard from '../pages/client/Dashboard'
import CaregiverDashboard from '../pages/caregiver/Dashboard'
import AdminDashboard from '../pages/admin/Dashboard'

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Client Routes */}
      <Route path="/client/dashboard" element={<ClientDashboard />} />

      {/* Caregiver Routes */}
      <Route path="/caregiver/dashboard" element={<CaregiverDashboard />} />

      {/* Admin Routes */}
      <Route path="/admin/dashboard" element={<AdminDashboard />} />

      {/* Catch all - redirect to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default AppRoutes
