import React, { useState, useEffect } from 'react'
import { AlertCircle, CheckCircle, Clock, Save, X, Filter } from 'lucide-react'
import Navbar from '../../components/layout/Navbar'
import Sidebar from '../../components/layout/Sidebar'
import api from '../../services/api'

const AdminComplaints = () => {
  const [complaints, setComplaints] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedComplaint, setSelectedComplaint] = useState(null)
  const [filterStatus, setFilterStatus] = useState('all')
  const [stats, setStats] = useState({
    totalComplaints: 0,
    openComplaints: 0,
    resolvedComplaints: 0,
    inProgressComplaints: 0
  })
  const [updateData, setUpdateData] = useState({
    status: 'open',
    adminNotes: '',
    adminAction: 'none'
  })
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  useEffect(() => {
    fetchComplaints()
    fetchStats()
  }, [filterStatus])

  const fetchComplaints = async () => {
    try {
      setLoading(true)
      const params = filterStatus !== 'all' ? `?status=${filterStatus}` : ''
      const response = await api.get(`/complaints/admin/all${params}`)
      setComplaints(response.data.data)
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to fetch complaints'
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await api.get('/complaints/admin/stats')
      setStats(response.data.data)
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    }
  }

  const handleSelectComplaint = (complaint) => {
    setSelectedComplaint(complaint)
    setUpdateData({
      status: complaint.status,
      adminNotes: complaint.adminNotes,
      adminAction: complaint.adminAction
    })
  }

  const handleUpdateChange = (e) => {
    const { name, value } = e.target
    setUpdateData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleUpdateComplaint = async (e) => {
    e.preventDefault()

    try {
      setSubmitting(true)
      const response = await api.put(`/complaints/${selectedComplaint._id}`, updateData)

      setMessage({
        type: 'success',
        text: 'Complaint updated successfully'
      })

      // Update complaint in list
      setComplaints(prev =>
        prev.map(c => c._id === selectedComplaint._id ? response.data.data : c)
      )

      setSelectedComplaint(response.data.data)

      // Refresh stats
      fetchStats()

      setTimeout(() => setMessage({ type: '', text: '' }), 3000)
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to update complaint'
      })
    } finally {
      setSubmitting(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'open':
        return 'bg-red-100 text-red-800'
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800'
      case 'resolved':
        return 'bg-green-100 text-green-800'
      case 'closed':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getCategoryLabel = (category) => {
    const labels = {
      service_quality: 'Service Quality',
      behavior: 'Behavior',
      payment: 'Payment',
      cancellation: 'Cancellation',
      other: 'Other'
    }
    return labels[category] || category
  }

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'low':
        return 'text-blue-600'
      case 'medium':
        return 'text-yellow-600'
      case 'high':
        return 'text-orange-600'
      case 'critical':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'open':
        return <AlertCircle className="w-5 h-5" />
      case 'in_progress':
        return <Clock className="w-5 h-5" />
      case 'resolved':
        return <CheckCircle className="w-5 h-5" />
      default:
        return <AlertCircle className="w-5 h-5" />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex">
        <Sidebar role="admin" />
        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Manage Complaints</h1>
              <p className="text-gray-600">Review and take action on client complaints</p>
            </div>

            {/* Stats */}
            <div className="grid md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <p className="text-gray-600 text-sm mb-2">Total Complaints</p>
                <p className="text-3xl font-bold text-gray-800">{stats.totalComplaints}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <p className="text-gray-600 text-sm mb-2">Open</p>
                <p className="text-3xl font-bold text-red-600">{stats.openComplaints}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <p className="text-gray-600 text-sm mb-2">In Progress</p>
                <p className="text-3xl font-bold text-yellow-600">{stats.inProgressComplaints}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <p className="text-gray-600 text-sm mb-2">Resolved</p>
                <p className="text-3xl font-bold text-green-600">{stats.resolvedComplaints}</p>
              </div>
            </div>

            {/* Messages */}
            {message.text && (
              <div className={`mb-6 p-4 rounded-lg ${
                message.type === 'error'
                  ? 'bg-red-100 text-red-800 border border-red-300'
                  : 'bg-green-100 text-green-800 border border-green-300'
              }`}>
                <div className="flex justify-between items-start">
                  <p>{message.text}</p>
                  <button onClick={() => setMessage({ type: '', text: '' })}>
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}

            <div className="flex gap-4 mb-6">
              <button
                onClick={() => setFilterStatus('all')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${
                  filterStatus === 'all'
                    ? 'bg-teal-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:border-gray-400'
                }`}
              >
                <Filter className="w-4 h-4" />
                All
              </button>
              <button
                onClick={() => setFilterStatus('open')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  filterStatus === 'open'
                    ? 'bg-red-600 text-white'
                    : 'bg-white text-red-600 border border-red-300 hover:border-red-400'
                }`}
              >
                Open
              </button>
              <button
                onClick={() => setFilterStatus('in_progress')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  filterStatus === 'in_progress'
                    ? 'bg-yellow-600 text-white'
                    : 'bg-white text-yellow-600 border border-yellow-300 hover:border-yellow-400'
                }`}
              >
                In Progress
              </button>
              <button
                onClick={() => setFilterStatus('resolved')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  filterStatus === 'resolved'
                    ? 'bg-green-600 text-white'
                    : 'bg-white text-green-600 border border-green-300 hover:border-green-400'
                }`}
              >
                Resolved
              </button>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {/* Complaints List */}
              <div className="md:col-span-1">
                {loading ? (
                  <div className="bg-white rounded-lg shadow-md p-8 text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-600"></div>
                    <p className="mt-4 text-gray-600">Loading complaints...</p>
                  </div>
                ) : complaints.length === 0 ? (
                  <div className="bg-white rounded-lg shadow-md p-8 text-center">
                    <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No complaints found</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-screen overflow-y-auto">
                    {complaints.map((complaint) => (
                      <button
                        key={complaint._id}
                        onClick={() => handleSelectComplaint(complaint)}
                        className={`w-full text-left p-4 rounded-lg border-2 transition ${
                          selectedComplaint?._id === complaint._id
                            ? 'border-teal-600 bg-teal-50'
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold text-gray-800 text-sm">{complaint.title}</h4>
                          <span className={`px-2 py-1 rounded text-xs font-medium flex items-center gap-1 ${getStatusColor(complaint.status)}`}>
                            {getStatusIcon(complaint.status)}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 mb-2">
                          {complaint.clientId?.name || 'Unknown Client'}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">
                            {getCategoryLabel(complaint.category)}
                          </span>
                          <span className={`text-xs font-medium ${getSeverityColor(complaint.severity)}`}>
                            {complaint.severity.toUpperCase()}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Complaint Details & Update Form */}
              <div className="md:col-span-2">
                {selectedComplaint ? (
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">{selectedComplaint.title}</h2>

                    {/* Complaint Details */}
                    <div className="grid md:grid-cols-2 gap-4 mb-6 pb-6 border-b">
                      <div>
                        <p className="text-sm text-gray-600 font-medium mb-1">Client</p>
                        <p className="font-semibold text-gray-800">
                          {selectedComplaint.clientId?.name || 'Unknown'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 font-medium mb-1">Category</p>
                        <p className="font-semibold text-gray-800">
                          {getCategoryLabel(selectedComplaint.category)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 font-medium mb-1">Severity</p>
                        <p className={`font-semibold ${getSeverityColor(selectedComplaint.severity)}`}>
                          {selectedComplaint.severity.toUpperCase()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 font-medium mb-1">Submitted</p>
                        <p className="font-semibold text-gray-800">
                          {new Date(selectedComplaint.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      {selectedComplaint.caregiverId && (
                        <div>
                          <p className="text-sm text-gray-600 font-medium mb-1">Caregiver</p>
                          <p className="font-semibold text-gray-800">
                            {selectedComplaint.caregiverId?.name || 'Unknown'}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="mb-6 pb-6 border-b">
                      <p className="text-sm text-gray-600 font-medium mb-2">Description</p>
                      <p className="text-gray-800 leading-relaxed">{selectedComplaint.description}</p>
                    </div>

                    {/* Update Form */}
                    <form onSubmit={handleUpdateComplaint} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Status
                        </label>
                        <select
                          name="status"
                          value={updateData.status}
                          onChange={handleUpdateChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                        >
                          <option value="open">Open</option>
                          <option value="in_progress">In Progress</option>
                          <option value="resolved">Resolved</option>
                          <option value="closed">Closed</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Action to Take
                        </label>
                        <select
                          name="adminAction"
                          value={updateData.adminAction}
                          onChange={handleUpdateChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                        >
                          <option value="none">No Action</option>
                          <option value="refund">Issue Refund</option>
                          <option value="suspend_caregiver">Suspend Caregiver</option>
                          <option value="warning">Send Warning</option>
                          <option value="investigation">Open Investigation</option>
                          <option value="other">Other</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Admin Notes
                        </label>
                        <textarea
                          name="adminNotes"
                          value={updateData.adminNotes}
                          onChange={handleUpdateChange}
                          placeholder="Add your response and notes for the client..."
                          rows="4"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={submitting}
                        className="w-full flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-semibold transition"
                      >
                        <Save className="w-5 h-5" />
                        {submitting ? 'Updating...' : 'Update Complaint'}
                      </button>
                    </form>
                  </div>
                ) : (
                  <div className="bg-white rounded-lg shadow-md p-12 text-center">
                    <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Select a complaint to view details and take action</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default AdminComplaints
