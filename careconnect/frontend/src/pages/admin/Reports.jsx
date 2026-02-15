import React, { useEffect, useState } from 'react'
import Navbar from '../../components/layout/Navbar'
import Sidebar from '../../components/layout/Sidebar'
import { userService, caregiverService, bookingService, complaintService } from '../../services/api'
import jsPDF from 'jspdf'

const AdminReports = () => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [data, setData] = useState({ users: [], caregivers: [], bookings: [], complaints: [] })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)
      const [usersRes, caregiversRes, bookingsRes, complaintsRes] = await Promise.all([
        userService.getUsers(),
        caregiverService.getCaregivers(),
        bookingService.getBookings(),
        complaintService.getAllComplaints().catch(() => ({ data: { data: [] } })),
      ])

      setData({
        users: usersRes.data.data || [],
        caregivers: caregiversRes.data.data || [],
        bookings: bookingsRes.data.data || [],
        complaints: complaintsRes.data.data || [],
      })
    } catch (err) {
      console.error('Error fetching report data:', err)
      setError('Failed to load report data. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const generatePdf = () => {
    const doc = new jsPDF()
    const now = new Date().toLocaleString()

    const totalUsers = data.users.length
    const totalAdmins = data.users.filter(u => u.role === 'admin').length
    const totalClients = data.users.filter(u => u.role === 'client').length
    const totalCaregiverUsers = data.users.filter(u => u.role === 'caregiver').length
    const totalCaregiverProfiles = data.caregivers.length
    const verifiedCaregivers = data.caregivers.filter(cg => cg.verificationStatus === 'verified').length
    const pendingCaregivers = data.caregivers.filter(cg => cg.verificationStatus === 'pending').length
    const activeBookings = data.bookings.filter(b => b.status === 'confirmed' || b.status === 'pending').length
    const openComplaints = data.complaints.filter(c => c.status === 'open').length

    doc.setFontSize(16)
    doc.text('CareConnect Admin Report', 14, 20)
    doc.setFontSize(10)
    doc.text(`Generated: ${now}`, 14, 28)

    let y = 40
    const lineHeight = 8

    const section = (title, rows) => {
      doc.setFontSize(12)
      doc.text(title, 14, y)
      y += 4
      doc.setFontSize(10)
      rows.forEach(row => {
        doc.text(row, 16, y)
        y += lineHeight
      })
      y += 2
    }

    section('Overview', [
      `Total Users: ${totalUsers} (Admins: ${totalAdmins}, Caregivers: ${totalCaregiverUsers}, Clients: ${totalClients})`,
      `Caregiver Profiles: ${totalCaregiverProfiles}`,
      `Verified Caregivers: ${verifiedCaregivers}, Pending: ${pendingCaregivers}`,
      `Active Bookings: ${activeBookings}`,
      `Open Complaints: ${openComplaints}`,
    ])

    const recentBookings = data.bookings.slice(0, 5).map((b, idx) => {
      const client = b.client?.name || 'N/A'
      const caregiver = b.caregiver?.user?.name || 'N/A'
      const status = b.status || 'N/A'
      return `${idx + 1}. ${client} -> ${caregiver} (${status})`
    })

    if (recentBookings.length > 0) {
      section('Recent Bookings (top 5)', recentBookings)
    }

    const recentComplaints = data.complaints.slice(0, 5).map((c, idx) => {
      const title = c.title || 'Complaint'
      const status = c.status || 'N/A'
      return `${idx + 1}. ${title} (${status})`
    })

    if (recentComplaints.length > 0) {
      section('Recent Complaints (top 5)', recentComplaints)
    }

    doc.save('careconnect-admin-report.pdf')
  }

  const stats = {
    totalUsers: data.users.length,
    totalAdmins: data.users.filter(u => u.role === 'admin').length,
    totalClients: data.users.filter(u => u.role === 'client').length,
    totalCaregiverUsers: data.users.filter(u => u.role === 'caregiver').length,
    totalCaregiverProfiles: data.caregivers.length,
    verifiedCaregivers: data.caregivers.filter(cg => cg.verificationStatus === 'verified').length,
    pendingCaregivers: data.caregivers.filter(cg => cg.verificationStatus === 'pending').length,
    activeBookings: data.bookings.filter(b => b.status === 'confirmed' || b.status === 'pending').length,
    openComplaints: data.complaints.filter(c => c.status === 'open').length,
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex">
        <Sidebar role="admin" />
        <main className="flex-1 p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Reports</h1>
              <p className="text-gray-600">Generate downloadable PDF summaries</p>
            </div>
            <button
              onClick={generatePdf}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              Download PDF
            </button>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          {loading ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center text-gray-600">
              Loading report data...
            </div>
          ) : (
            <>
              <div className="grid md:grid-cols-3 gap-4 mb-8">
                <div className="bg-white p-5 rounded-lg shadow-md">
                  <h3 className="text-sm text-gray-500">Users</h3>
                  <p className="text-3xl font-bold text-blue-600">{stats.totalUsers}</p>
                  <p className="text-sm text-gray-500">Admins: {stats.totalAdmins}</p>
                  <p className="text-sm text-gray-500">Caregivers: {stats.totalCaregiverUsers}</p>
                  <p className="text-sm text-gray-500">Clients: {stats.totalClients}</p>
                </div>
                <div className="bg-white p-5 rounded-lg shadow-md">
                  <h3 className="text-sm text-gray-500">Caregivers</h3>
                  <p className="text-3xl font-bold text-purple-600">{stats.totalCaregiverProfiles}</p>
                  <p className="text-sm text-gray-500">Verified: {stats.verifiedCaregivers}</p>
                  <p className="text-sm text-gray-500">Pending: {stats.pendingCaregivers}</p>
                </div>
                <div className="bg-white p-5 rounded-lg shadow-md">
                  <h3 className="text-sm text-gray-500">Bookings</h3>
                  <p className="text-3xl font-bold text-orange-600">{stats.activeBookings}</p>
                  <p className="text-sm text-gray-500">Open Complaints: {stats.openComplaints}</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Bookings</h2>
                  {data.bookings.length === 0 ? (
                    <p className="text-gray-600">No bookings available</p>
                  ) : (
                    <ul className="space-y-3 max-h-80 overflow-auto">
                      {data.bookings.slice(0, 8).map((booking) => (
                        <li key={booking._id} className="border-b border-gray-100 pb-3">
                          <div className="text-sm font-semibold text-gray-800">
                            {booking.client?.name || 'Client'} ➜ {booking.caregiver?.user?.name || 'Caregiver'}
                          </div>
                          <div className="text-xs text-gray-500 capitalize">Status: {booking.status || 'N/A'}</div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-bold text-gray-800 mb-4">Open Complaints</h2>
                  {stats.openComplaints === 0 ? (
                    <p className="text-blue-600 font-semibold">No open complaints</p>
                  ) : (
                    <ul className="space-y-3 max-h-80 overflow-auto">
                      {data.complaints
                        .filter((c) => c.status === 'open')
                        .slice(0, 8)
                        .map((complaint) => (
                          <li key={complaint._id} className="border-b border-gray-100 pb-3">
                            <div className="text-sm font-semibold text-gray-800">{complaint.title || 'Complaint'}</div>
                            <div className="text-xs text-gray-500">Severity: {complaint.severity || 'medium'}</div>
                          </li>
                        ))}
                    </ul>
                  )}
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  )
}

export default AdminReports

