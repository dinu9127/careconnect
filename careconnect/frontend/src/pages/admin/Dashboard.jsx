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
    nonVerifiedCaregivers: 0,
    totalAdmins: 0,
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
        caregiverService.getAllCaregiversAdmin().catch(() => ({ data: { data: [] } })),
        bookingService.getBookings().catch(() => ({ data: { data: [] } })),
        complaintService.getAllComplaints().catch(() => ({ data: { data: [] } })),
      ])

      const users = usersRes.data.data || []
      const caregivers = caregiversRes.data.data || []
      const bookings = bookingsRes.data.data || []
      const complaints = complaintsRes.data.data || []

      // Calculate stats
      const clients = users.filter(user => user.role === 'client')
      const caregiverUsers = users.filter(user => user.role === 'caregiver')
      const admins = users.filter(user => user.role === 'admin')
      const verifiedCaregivers = caregivers.filter(cg => cg.verificationStatus === 'verified')
      const pendingCaregivers = caregivers.filter(cg => cg.verificationStatus === 'pending')
      const nonVerifiedCaregivers = Math.max(caregiverUsers.length - verifiedCaregivers.length, 0)
      const activeBookings = bookings.filter(booking => 
        booking.status === 'confirmed' || booking.status === 'pending'
      )
      const openComplaints = complaints.filter(complaint => complaint.status === 'open')

      setStats({
        totalUsers: users.length,
        totalClients: clients.length,
        totalCaregivers: caregiverUsers.length,
        verifiedCaregivers: verifiedCaregivers.length,
        nonVerifiedCaregivers: nonVerifiedCaregivers,
        totalAdmins: admins.length,
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
          
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-100 mb-8">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">User Breakdown</p>
                  <h2 className="text-3xl font-bold text-slate-900">Total Users</h2>
                 
                </div>
                <div className="text-5xl font-extrabold text-slate-900">
                  {stats.totalUsers}
                </div>
              </div>

              <div className="w-full">
                <div className="h-6 w-full rounded-full bg-slate-100 overflow-hidden border border-slate-200 flex">
                  <div
                    className="h-full bg-red-500"
                    style={{ width: `${(stats.totalAdmins / Math.max(stats.totalUsers, 1)) * 100}%` }}
                  />
                  <div
                    className="h-full bg-emerald-500"
                    style={{ width: `${(stats.verifiedCaregivers / Math.max(stats.totalUsers, 1)) * 100}%` }}
                  />
                  <div
                    className="h-full bg-amber-400"
                    style={{ width: `${(stats.nonVerifiedCaregivers / Math.max(stats.totalUsers, 1)) * 100}%` }}
                  />
                  <div
                    className="h-full bg-blue-500"
                    style={{ width: `${(stats.totalClients / Math.max(stats.totalUsers, 1)) * 100}%` }}
                  />
                </div>
                <div className="mt-4 grid gap-3 md:grid-cols-4">
                  <div className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="h-3 w-3 rounded-full bg-red-500"></span>
                      <span className="text-sm font-medium text-slate-700">Admins</span>
                    </div>
                    <span className="text-sm font-semibold text-slate-900">{stats.totalAdmins}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="h-3 w-3 rounded-full bg-emerald-500"></span>
                      <span className="text-sm font-medium text-slate-700">Verified Caregivers</span>
                    </div>
                    <span className="text-sm font-semibold text-slate-900">{stats.verifiedCaregivers}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="h-3 w-3 rounded-full bg-amber-400"></span>
                      <span className="text-sm font-medium text-slate-700">Non-verified Caregivers</span>
                    </div>
                    <span className="text-sm font-semibold text-slate-900">{stats.nonVerifiedCaregivers}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="h-3 w-3 rounded-full bg-blue-500"></span>
                      <span className="text-sm font-medium text-slate-700">Clients</span>
                    </div>
                    <span className="text-sm font-semibold text-slate-900">{stats.totalClients}</span>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-xl border border-slate-200 bg-white px-5 py-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Active Bookings</p>
                  <p className="text-3xl font-bold text-slate-900 mt-2">{stats.activeBookings}</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white px-5 py-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Pending Verifications</p>
                  <p className="text-3xl font-bold text-slate-900 mt-2">{stats.pendingVerifications}</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white px-5 py-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Open Complaints</p>
                  <p className="text-3xl font-bold text-slate-900 mt-2">{stats.openComplaints}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-100">
              <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Pending Verifications</p>
                  <h2 className="text-3xl font-bold text-slate-900">Awaiting approval</h2>
                  <p className="text-sm text-slate-600 mt-2">Caregivers waiting for verification</p>
                </div>
                <div className="text-5xl font-extrabold text-slate-900">
                  {stats.pendingVerifications}
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-100">
              <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Open Complaints</p>
                  <h2 className="text-3xl font-bold text-slate-900">Requiring attention</h2>
                  <p className="text-sm text-slate-600 mt-2">Complaints requiring attention</p>
                </div>
                <div className="text-5xl font-extrabold text-slate-900">
                  {stats.openComplaints}
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

