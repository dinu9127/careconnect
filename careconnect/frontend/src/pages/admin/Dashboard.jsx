import React, { useState, useEffect } from 'react'
import Navbar from '../../components/layout/Navbar'
import Sidebar from '../../components/layout/Sidebar'
import { userService, caregiverService, bookingService, complaintService } from '../../services/api'

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalClients: 0,
    totalCaregivers: 0,
    verifiedCaregivers: 0,
    activeBookings: 0,
    pendingVerifications: 0,
    openComplaints: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch all data in parallel
      const [usersRes, caregiversRes, bookingsRes, complaintsRes] = await Promise.all([
        userService.getUsers().catch(() => ({ data: { data: [] } })),
        caregiverService.getCaregivers().catch(() => ({ data: { data: [] } })),
        bookingService.getBookings().catch(() => ({ data: { data: [] } })),
        complaintService.getAllComplaints().catch(() => ({ data: { data: [] } })),
      ])

      const users = usersRes.data.data || []
      const caregivers = caregiversRes.data.data || []
      const bookings = bookingsRes.data.data || []
      const complaints = complaintsRes.data.data || []

      // Calculate stats
      const clients = users.filter(user => user.role === 'client')
      const verifiedCaregivers = caregivers.filter(cg => cg.verificationStatus === 'verified')
      const pendingCaregivers = caregivers.filter(cg => cg.verificationStatus === 'pending')
      const activeBookings = bookings.filter(booking => 
        booking.status === 'confirmed' || booking.status === 'pending'
      )
      const openComplaints = complaints.filter(complaint => complaint.status === 'open')

      setStats({
        totalUsers: users.length,
        totalClients: clients.length,
        totalCaregivers: caregivers.length,
        verifiedCaregivers: verifiedCaregivers.length,
        activeBookings: activeBookings.length,
        pendingVerifications: pendingCaregivers.length,
        openComplaints: openComplaints.length,
      })
    } catch (err) {
      console.error('Error fetching dashboard data:', err)
      setError('Failed to load dashboard data. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex">
          <Sidebar role="admin" />
          <main className="flex-1 p-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Admin Dashboard</h1>
            <div className="flex justify-center items-center h-64">
              <div className="text-gray-600">Loading dashboard data...</div>
            </div>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex">
        <Sidebar role="admin" />
        <main className="flex-1 p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Admin Dashboard</h1>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}
          
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Users</h3>
              <p className="text-3xl font-bold text-blue-600">{stats.totalUsers}</p>
              <p className="text-sm text-gray-500 mt-2">All registered users</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Clients</h3>
              <p className="text-3xl font-bold text-blue-600">{stats.totalClients}</p>
              <p className="text-sm text-gray-500 mt-2">Registered clients</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Verified Caregivers</h3>
              <p className="text-3xl font-bold text-purple-600">{stats.verifiedCaregivers}</p>
              <p className="text-sm text-gray-500 mt-2">Out of {stats.totalCaregivers} total</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Active Bookings</h3>
              <p className="text-3xl font-bold text-orange-600">{stats.activeBookings}</p>
              <p className="text-sm text-gray-500 mt-2">Confirmed & pending</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Pending Verifications</h2>
              {stats.pendingVerifications > 0 ? (
                <div>
                  <p className="text-4xl font-bold text-yellow-600 mb-2">{stats.pendingVerifications}</p>
                  <p className="text-gray-600">Caregivers waiting for verification</p>
                </div>
              ) : (
                <p className="text-gray-600">No pending verifications</p>
              )}
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Open Complaints</h2>
              {stats.openComplaints > 0 ? (
                <div>
                  <p className="text-4xl font-bold text-red-600 mb-2">{stats.openComplaints}</p>
                  <p className="text-gray-600">Complaints requiring attention</p>
                </div>
              ) : (
                <p className="text-blue-600 font-semibold">No open complaints</p>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default AdminDashboard

