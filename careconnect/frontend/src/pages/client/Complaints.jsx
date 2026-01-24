import React, { useState, useEffect } from 'react'
import { AlertCircle, CheckCircle, Clock, Send, X } from 'lucide-react'
import Navbar from '../../components/layout/Navbar'
import Sidebar from '../../components/layout/Sidebar'
import api from '../../services/api'

const Complaints = () => {
  const [complaints, setComplaints] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [selectedComplaint, setSelectedComplaint] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'service_quality',
    severity: 'medium',
    caregiverId: '',
    bookingId: ''
  })
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  // Fetch complaints on mount
  useEffect(() => {
    fetchComplaints()
  }, [])

  const fetchComplaints = async () => {
    try {
      setLoading(true)
      const response = await api.get('/complaints/my-complaints')
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

  const handleFormChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmitComplaint = async (e) => {
    e.preventDefault()
    
    // Validation
    if (!formData.title.trim() || !formData.description.trim()) {
      setMessage({
        type: 'error',
        text: 'Please fill in all required fields'
      })
      return
    }

    try {
      setSubmitting(true)
      const response = await api.post('/complaints', formData)
      
      setMessage({
        type: 'success',
        text: 'Complaint submitted successfully! Admin will review it shortly.'
      })
      
      // Reset form and refresh list
      setFormData({
        title: '',
        description: '',
        category: 'service_quality',
        severity: 'medium',
        caregiverId: '',
        bookingId: ''
      })
      setShowForm(false)
      
      // Add new complaint to list
      setComplaints(prev => [response.data.data, ...prev])
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage({ type: '', text: '' }), 3000)
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to submit complaint'
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
        <Sidebar role="client" />
        <main className="flex-1 p-8">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-800 mb-2">My Complaints</h1>
                <p className="text-gray-600">Submit and track your service complaints</p>
              </div>
              <button
                onClick={() => setShowForm(!showForm)}
                className={`px-6 py-2 rounded-lg font-semibold transition ${
                  showForm
                    ? 'bg-red-500 hover:bg-red-600 text-white'
                    : 'bg-teal-600 hover:bg-teal-700 text-white'
                }`}
              >
                {showForm ? 'Cancel' : '+ New Complaint'}
              </button>
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

            {/* Form */}
            {showForm && (
              <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <h2 className="text-xl font-bold text-gray-800 mb-6">Submit a Complaint</h2>
                <form onSubmit={handleSubmitComplaint}>
                  <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Title *
                      </label>
                      <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleFormChange}
                        placeholder="Brief summary of your complaint"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Category *
                      </label>
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleFormChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                        required
                      >
                        <option value="service_quality">Service Quality</option>
                        <option value="behavior">Behavior</option>
                        <option value="payment">Payment</option>
                        <option value="cancellation">Cancellation</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Severity
                      </label>
                      <select
                        name="severity"
                        value={formData.severity}
                        onChange={handleFormChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="critical">Critical</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Booking ID (Optional)
                      </label>
                      <input
                        type="text"
                        name="bookingId"
                        value={formData.bookingId}
                        onChange={handleFormChange}
                        placeholder="Related booking ID"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description *
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleFormChange}
                      placeholder="Please provide detailed information about your complaint..."
                      rows="5"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-semibold transition"
                  >
                    <Send className="w-5 h-5" />
                    {submitting ? 'Submitting...' : 'Submit Complaint'}
                  </button>
                </form>
              </div>
            )}

            {/* Complaints List */}
            <div>
              {loading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-600"></div>
                  <p className="mt-4 text-gray-600">Loading complaints...</p>
                </div>
              ) : complaints.length === 0 ? (
                <div className="bg-white rounded-lg shadow-md p-12 text-center">
                  <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">No Complaints Yet</h3>
                  <p className="text-gray-600 mb-6">
                    You haven't submitted any complaints. If you experience any issues with our service, please submit a complaint.
                  </p>
                  <button
                    onClick={() => setShowForm(true)}
                    className="inline-block bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-lg font-semibold transition"
                  >
                    Submit Your First Complaint
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {complaints.map((complaint) => (
                    <div
                      key={complaint._id}
                      className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition cursor-pointer"
                      onClick={() => setSelectedComplaint(complaint)}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-800">{complaint.title}</h3>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${getStatusColor(complaint.status)}`}>
                              {getStatusIcon(complaint.status)}
                              {complaint.status.replace('_', ' ').toUpperCase()}
                            </span>
                          </div>
                          <p className="text-gray-600 text-sm mb-2">{complaint.description.substring(0, 100)}...</p>
                          <div className="flex gap-4 text-sm text-gray-600">
                            <span className="font-medium">
                              Category: {getCategoryLabel(complaint.category)}
                            </span>
                            <span className={`font-medium ${getSeverityColor(complaint.severity)}`}>
                              Severity: {complaint.severity.toUpperCase()}
                            </span>
                          </div>
                        </div>
                      </div>

                      {complaint.adminNotes && (
                        <div className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded">
                          <p className="text-sm text-gray-700">
                            <span className="font-semibold">Admin Response:</span> {complaint.adminNotes}
                          </p>
                        </div>
                      )}

                      {complaint.adminAction && complaint.adminAction !== 'none' && (
                        <div className="mt-3 text-sm">
                          <span className="font-semibold text-gray-700">Action Taken: </span>
                          <span className="text-teal-600 font-medium">
                            {complaint.adminAction.replace('_', ' ').toUpperCase()}
                          </span>
                        </div>
                      )}

                      <div className="mt-4 text-xs text-gray-500">
                        Submitted: {new Date(complaint.createdAt).toLocaleDateString()}
                        {complaint.resolvedAt && ` • Resolved: ${new Date(complaint.resolvedAt).toLocaleDateString()}`}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Detail Modal */}
      {selectedComplaint && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-96 overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-start">
              <h2 className="text-2xl font-bold text-gray-800">{selectedComplaint.title}</h2>
              <button
                onClick={() => setSelectedComplaint(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 font-medium mb-1">Status</p>
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedComplaint.status)}`}>
                    {getStatusIcon(selectedComplaint.status)}
                    {selectedComplaint.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-medium mb-1">Category</p>
                  <p className="font-semibold text-gray-800">{getCategoryLabel(selectedComplaint.category)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-medium mb-1">Severity</p>
                  <p className={`font-semibold ${getSeverityColor(selectedComplaint.severity)}`}>
                    {selectedComplaint.severity.toUpperCase()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-medium mb-1">Submitted Date</p>
                  <p className="font-semibold text-gray-800">
                    {new Date(selectedComplaint.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-600 font-medium mb-2">Description</p>
                <p className="text-gray-800 leading-relaxed">{selectedComplaint.description}</p>
              </div>

              {selectedComplaint.adminNotes && (
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                  <p className="text-sm text-gray-700 font-semibold mb-2">Admin Response:</p>
                  <p className="text-gray-800">{selectedComplaint.adminNotes}</p>
                </div>
              )}

              {selectedComplaint.adminAction && selectedComplaint.adminAction !== 'none' && (
                <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
                  <p className="text-sm text-gray-700 font-semibold mb-2">Action Taken by Admin:</p>
                  <p className="text-gray-800 font-medium">
                    {selectedComplaint.adminAction.replace('_', ' ').toUpperCase()}
                  </p>
                </div>
              )}

              {selectedComplaint.resolvedAt && (
                <div className="text-xs text-gray-600">
                  <span className="font-semibold">Resolved on:</span> {new Date(selectedComplaint.resolvedAt).toLocaleDateString()}
                </div>
              )}
            </div>

            <div className="border-t bg-gray-50 p-6">
              <button
                onClick={() => setSelectedComplaint(null)}
                className="w-full bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg font-semibold transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Complaints
