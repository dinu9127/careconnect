import React, { useState, useEffect } from 'react'
import Navbar from '../../components/layout/Navbar'
import Sidebar from '../../components/layout/Sidebar'
import { userService, caregiverService, bookingService, complaintService } from '../../services/api'
import { Users, CheckCircle, AlertCircle, Calendar } from 'lucide-react'

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
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="flex">
          <Sidebar role="admin" />
          <main className="flex-1 p-8">
            <div className="mb-8 border-b-2 border-purple-200 pb-4">
              <h1 className="text-4xl font-bold text-slate-900">Admin Dashboard</h1>
              <p className="text-slate-600 mt-1">Welcome back! Here's your platform overview</p>
            </div>
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="flex">
        <Sidebar role="admin" />
        <main className="flex-1 p-8">
          <div className="mb-8 border-b-2 border-purple-200 pb-4">
            <h1 className="text-4xl font-bold text-slate-900">Admin Dashboard</h1>
            <p className="text-slate-600 mt-1">Welcome back! Here's your platform overview</p>
          </div>
          
          {error && (
            <div className="bg-red-50 border-l-4 border-red-600 text-red-800 px-4 py-4 rounded-lg mb-6 shadow-md">
              <p className="font-semibold">Error</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
          )}
          
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border-t-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 text-sm font-medium mb-1">Total Users</p>
                  <p className="text-4xl font-bold text-slate-900">{stats.totalUsers}</p>
                  <p className="text-xs text-slate-500 mt-2">All registered users</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border-t-4 border-indigo-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 text-sm font-medium mb-1">Total Clients</p>
                  <p className="text-4xl font-bold text-slate-900">{stats.totalClients}</p>
                  <p className="text-xs text-slate-500 mt-2">Registered clients</p>
                </div>
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-indigo-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border-t-4 border-purple-600">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 text-sm font-medium mb-1">Verified Caregivers</p>
                  <p className="text-4xl font-bold text-slate-900">{stats.verifiedCaregivers}</p>
                  <p className="text-xs text-slate-500 mt-2">Out of {stats.totalCaregivers} total</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border-t-4 border-blue-400">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 text-sm font-medium mb-1">Active Bookings</p>
                  <p className="text-4xl font-bold text-slate-900">{stats.activeBookings}</p>
                  <p className="text-xs text-slate-500 mt-2">Confirmed & pending</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-blue-500" />
                </div>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border-t-4 border-yellow-500">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 mb-1">Pending Verifications</h2>
                  <p className="text-xs text-slate-600 mb-4">Awaiting approval</p>
                  {stats.pendingVerifications > 0 ? (
                    <div>
                      <p className="text-5xl font-bold text-yellow-600 mb-2">{stats.pendingVerifications}</p>
                      <p className="text-sm text-slate-600">Caregivers waiting for verification</p>
                    </div>
                  ) : (
                    <p className="text-sm text-slate-600">No pending verifications</p>
                  )}
                </div>
                <div className="w-14 h-14 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-7 h-7 text-yellow-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border-t-4 border-red-500">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 mb-1">Open Complaints</h2>
                  <p className="text-xs text-slate-600 mb-4">Requiring attention</p>
                  {stats.openComplaints > 0 ? (
                    <div>
                      <p className="text-5xl font-bold text-red-600 mb-2">{stats.openComplaints}</p>
                      <p className="text-sm text-slate-600">Complaints requiring attention</p>
                    </div>
                  ) : (
                    <p className="text-sm text-green-600 font-semibold">No open complaints</p>
                  )}
                </div>
                <div className="w-14 h-14 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-7 h-7 text-red-600" />
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default AdminDashboard

