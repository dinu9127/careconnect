import React, { useEffect, useState } from 'react'
import Navbar from '../../components/layout/Navbar'
import Sidebar from '../../components/layout/Sidebar'
import { userService, caregiverService, bookingService, complaintService } from '../../services/api'
import jsPDF from 'jsPDF'
import { Users, ShieldCheck, BookOpen, AlertCircle, FileText, TrendingUp } from 'lucide-react'

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
              {/* Main Stats Cards */}
              <div className="grid md:grid-cols-4 gap-4 mb-8">
                {/* Users Card */}
                <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-blue-500">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-gray-600 text-sm font-medium">Total Users</p>
                      <p className="text-4xl font-bold text-gray-800 mt-2">{stats.totalUsers}</p>
                    </div>
                    <Users className="w-8 h-8 text-blue-500 opacity-60" />
                  </div>
                  <div className="space-y-1 text-sm text-gray-600 mt-4">
                    <p>Admins: {stats.totalAdmins}</p>
                    <p>Caregivers: {stats.totalCaregiverUsers}</p>
                    <p>Clients: {stats.totalClients}</p>
                  </div>
                </div>

                {/* Caregivers Card */}
                <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-purple-500">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-gray-600 text-sm font-medium">Caregiver Profiles</p>
                      <p className="text-4xl font-bold text-gray-800 mt-2">{stats.totalCaregiverProfiles}</p>
                    </div>
                    <ShieldCheck className="w-8 h-8 text-purple-500 opacity-60" />
                  </div>
                  <div className="space-y-1 text-sm text-gray-600 mt-4">
                    <p>Verified: {stats.verifiedCaregivers}</p>
                    <p>Pending: {stats.pendingCaregivers}</p>
                  </div>
                </div>

                {/* Bookings Card */}
                <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-orange-500">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-gray-600 text-sm font-medium">Active Bookings</p>
                      <p className="text-4xl font-bold text-gray-800 mt-2">{stats.activeBookings}</p>
                    </div>
                    <BookOpen className="w-8 h-8 text-orange-500 opacity-60" />
                  </div>
                  <p className="text-sm text-gray-500 mt-4">Current active and pending</p>
                </div>

                {/* Complaints Card */}
                <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-red-500">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-gray-600 text-sm font-medium">Open Complaints</p>
                      <p className="text-4xl font-bold text-gray-800 mt-2">{stats.openComplaints}</p>
                    </div>
                    <AlertCircle className="w-8 h-8 text-red-500 opacity-60" />
                  </div>
                  <p className="text-sm text-gray-500 mt-4">Require attention</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Recent Bookings */}
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="bg-gray-100 px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-orange-600" />
                      <h2 className="text-lg font-bold text-gray-800">Recent Bookings</h2>
                    </div>
                  </div>
                  <div className="p-6">
                    {data.bookings.length === 0 ? (
                      <p className="text-gray-600">No bookings available</p>
                    ) : (
                      <ul className="space-y-3 max-h-96 overflow-auto">
                        {data.bookings.slice(0, 8).map((booking) => (
                          <li key={booking._id} className="border-l-4 border-orange-300 pl-4 py-2">
                            <div className="text-sm font-semibold text-gray-800">
                              {booking.client?.name || 'Client'} ➜ {booking.caregiver?.user?.name || 'Caregiver'}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                                booking.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                              }`}>
                                {booking.status || 'N/A'}
                              </span>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>

                {/* Open Complaints */}
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="bg-gray-100 px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-red-600" />
                      <h2 className="text-lg font-bold text-gray-800">Open Complaints</h2>
                    </div>
                  </div>
                  <div className="p-6">
                    {stats.openComplaints === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-lg text-green-600 font-semibold">✓ No open complaints</p>
                        <p className="text-xs text-gray-500 mt-2">All issues resolved</p>
                      </div>
                    ) : (
                      <ul className="space-y-3 max-h-96 overflow-auto">
                        {data.complaints
                          .filter((c) => c.status === 'open')
                          .slice(0, 8)
                          .map((complaint) => (
                            <li key={complaint._id} className="border-l-4 border-red-300 pl-4 py-2">
                              <div className="text-sm font-semibold text-gray-800">{complaint.title || 'Complaint'}</div>
                              <div className="flex items-center gap-2 mt-1">
                                <span className={`text-xs px-2 py-1 rounded font-medium ${
                                  complaint.severity === 'high' ? 'bg-red-100 text-red-700' :
                                  complaint.severity === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                  'bg-blue-100 text-blue-700'
                                }`}>
                                  {complaint.severity || 'medium'} priority
                                </span>
                              </div>
                            </li>
                          ))}
                      </ul>
                    )}
                  </div>
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

