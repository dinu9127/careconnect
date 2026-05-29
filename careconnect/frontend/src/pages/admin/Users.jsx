import React, { useState, useEffect } from 'react'
import Navbar from '../../components/layout/Navbar'
import Sidebar from '../../components/layout/Sidebar'
import { userService, caregiverService, uploadService } from '../../services/api'
import { AlertCircle, CheckCircle, XCircle } from 'lucide-react'

const AdminUsers = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState('all') // all, client, caregiver, admin
  const [deleteConfirmation, setDeleteConfirmation] = useState({ show: false, user: null })
  const [caregivers, setCaregivers] = useState([])
  const [caregiverLoading, setCaregiverLoading] = useState(false)
  const [caregiverError, setCaregiverError] = useState(null)
  const [caregiverStatusFilter, setCaregiverStatusFilter] = useState('all') // all, verified, pending, rejected
  const [verificationConfirm, setVerificationConfirm] = useState({ show: false, caregiverId: null, status: null })
  const [rejectionReason, setRejectionReason] = useState('')
  const [showRejectionModal, setShowRejectionModal] = useState(false)
  const [pendingRejectionId, setPendingRejectionId] = useState(null)
  const [actionMessage, setActionMessage] = useState({ type: '', text: '' })
  const [documentsModal, setDocumentsModal] = useState({ open: false, caregiver: null })
  const [documentsLoading, setDocumentsLoading] = useState(false)
  const [documentsError, setDocumentsError] = useState('')
  const [documentsData, setDocumentsData] = useState({
    uploads: [],
    nvqCertifications: [],
    professionalDocuments: [],
    verificationDocuments: []
  })

  const showActionMessage = (type, text) => {
    setActionMessage({ type, text })
    window.setTimeout(() => {
      setActionMessage({ type: '', text: '' })
    }, 4000)
  }

  const formatDate = (value) => {
    if (!value) return 'N/A'
    const parsed = new Date(value)
    if (Number.isNaN(parsed.getTime())) return 'N/A'
    return parsed.toLocaleDateString()
  }

  const openDocumentsModal = async (caregiver) => {
    setDocumentsModal({ open: true, caregiver })
    setDocumentsLoading(true)
    setDocumentsError('')
    setDocumentsData({
      uploads: [],
      nvqCertifications: [],
      professionalDocuments: [],
      verificationDocuments: caregiver?.verificationDocuments || []
    })

    try {
      const userId = caregiver?.user?._id
      const [caregiverDocsResponse, userDocsResponse] = await Promise.all([
        caregiverService.getCaregiverDocuments(caregiver._id),
        userId ? uploadService.getUserDocuments(userId) : Promise.resolve({ data: { data: [] } })
      ])

      setDocumentsData({
        uploads: userDocsResponse.data?.data || [],
        nvqCertifications: caregiverDocsResponse.data?.data?.nvqCertifications || [],
        professionalDocuments: caregiverDocsResponse.data?.data?.professionalDocuments || [],
        verificationDocuments: caregiver?.verificationDocuments || []
      })
    } catch (err) {
      console.error('Error fetching caregiver documents:', err)
      setDocumentsError('Failed to load caregiver documents. Please try again.')
    } finally {
      setDocumentsLoading(false)
    }
  }

  const closeDocumentsModal = () => {
    setDocumentsModal({ open: false, caregiver: null })
    setDocumentsError('')
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  useEffect(() => {
    if (filter === 'caregiver') {
      fetchCaregivers()
    } else {
      setCaregiverStatusFilter('all')
    }
  }, [filter])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await userService.getUsers()
      setUsers(response.data.data || [])
    } catch (err) {
      console.error('Error fetching users:', err)
      const errorMsg = err.response?.data?.message || err.message || 'Failed to load users'
      console.error('Error details:', err.response?.data || err.message)
      setError(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  const fetchCaregivers = async () => {
    try {
      setCaregiverLoading(true)
      setCaregiverError(null)
      const response = await caregiverService.getAllCaregiversAdmin()
      setCaregivers(response.data.data || [])
    } catch (err) {
      console.error('Error fetching caregivers:', err)
      setCaregiverError('Failed to load caregiver details. Please try again.')
    } finally {
      setCaregiverLoading(false)
    }
  }

  const handleVerificationUpdate = (caregiverId, status) => {
    if (status === 'rejected') {
      setPendingRejectionId(caregiverId)
      setShowRejectionModal(true)
    } else {
      setVerificationConfirm({ show: true, caregiverId, status })
    }
  }

  const submitRejection = () => {
    if (!rejectionReason.trim()) {
      showActionMessage('error', 'Please provide a reason for rejection')
      return
    }
    setVerificationConfirm({ show: true, caregiverId: pendingRejectionId, status: 'rejected', reason: rejectionReason })
    setShowRejectionModal(false)
    setRejectionReason('')
    setPendingRejectionId(null)
  }

  const confirmVerificationUpdate = async () => {
    const { caregiverId, status, reason } = verificationConfirm
    try {
      const updateData = { verificationStatus: status }
      if (status === 'rejected' && reason) {
        updateData.verificationNotes = reason
      }
      await caregiverService.updateCaregiver(caregiverId, updateData)
      setCaregivers(caregivers.map(cg =>
        cg._id === caregiverId ? { ...cg, verificationStatus: status, verificationNotes: reason || cg.verificationNotes } : cg
      ))
      setVerificationConfirm({ show: false, caregiverId: null, status: null })
      showActionMessage('success', `Caregiver ${status} successfully${reason ? ' with reason: ' + reason : ''}`)
    } catch (err) {
      console.error('Error updating verification:', err)
      showActionMessage('error', `Failed to update verification status: ${err.response?.data?.message || err.message}`)
      setVerificationConfirm({ show: false, caregiverId: null, status: null })
    }
  }

  const handleDeleteUser = async (userId) => {
    try {
      const response = await userService.deleteUser(userId)
      setUsers(users.filter(user => user._id !== userId))
      setCaregivers(caregivers.filter(caregiver => caregiver.user?._id !== userId))
      setDeleteConfirmation({ show: false, user: null })
      
      // Show success message with any warnings
      if (response.data.warning) {
        showActionMessage('success', `User deleted successfully. Note: ${response.data.warning}`)
      } else {
        showActionMessage('success', 'User deleted successfully')
      }
    } catch (err) {
      console.error('Error deleting user:', err)
      setDeleteConfirmation({ show: false, user: null })
      
      // Show user-friendly error message
      const errorMsg = err.response?.data?.message || 'Failed to delete user'
      showActionMessage('error', errorMsg)
    }
  }

  const openDeleteConfirmation = (user) => {
    setDeleteConfirmation({ show: true, user })
  }

  const closeDeleteConfirmation = () => {
    setDeleteConfirmation({ show: false, user: null })
  }

  const filteredUsers = users.filter(user => {
    if (filter === 'all') return true
    return user.role === filter
  })

  const pendingCaregivers = caregivers.filter(c => (c.verificationStatus || 'pending') === 'pending')
  const verifiedCaregivers = caregivers.filter(c => c.verificationStatus === 'verified')
  const rejectedCaregivers = caregivers.filter(c => c.verificationStatus === 'rejected')

  const totalCount = filter === 'caregiver'
    ? caregivers.length
    : filteredUsers.length

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800'
      case 'caregiver':
        return 'bg-purple-100 text-purple-800'
      case 'client':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getVerificationBadgeColor = (status) => {
    switch (status) {
      case 'verified':
        return 'bg-blue-100 text-blue-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const groupedUploads = documentsData.uploads.reduce((acc, doc) => {
    const key = doc.fileType || 'Other'
    if (!acc[key]) {
      acc[key] = []
    }
    acc[key].push(doc)
    return acc
  }, {})

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex">
        <Sidebar role="admin" />
        <main className="flex-1 p-8">
          <div className="mb-8 border-b-2 border-purple-200 pb-4 flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-slate-900">User Management</h1>
              <p className="text-slate-600 mt-1">Manage and monitor all users and caregivers</p>
            </div>
            <div className="text-sm font-semibold text-purple-700 bg-purple-50 px-4 py-2 rounded-lg">
              Total: {totalCount} user{totalCount !== 1 ? 's' : ''}
            </div>
          </div>

          {/* Filter Buttons */}
          <div className="mb-6 flex gap-2 flex-wrap">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 shadow-md hover:shadow-lg ${
                filter === 'all'
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
              }`}
            >
              All Users
            </button>
            <button
              onClick={() => setFilter('client')}
              className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 shadow-md hover:shadow-lg ${
                filter === 'client'
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
              }`}
            >
              Clients
            </button>
            <button
              onClick={() => setFilter('caregiver')}
              className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 shadow-md hover:shadow-lg ${
                filter === 'caregiver'
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
              }`}
            >
              Caregivers
            </button>
            <button
              onClick={() => setFilter('admin')}
              className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 shadow-md hover:shadow-lg ${
                filter === 'admin'
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
              }`}
            >
              Admins
            </button>
          </div>

          {error && filter !== 'caregiver' && (
            <div className="bg-red-50 border-l-4 border-red-600 text-red-800 px-4 py-4 rounded-lg mb-6 shadow-md">
              <p className="font-semibold">Error</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
          )}

          {caregiverError && filter === 'caregiver' && (
            <div className="bg-red-50 border-l-4 border-red-600 text-red-800 px-4 py-4 rounded-lg mb-6 shadow-md">
              <p className="font-semibold">Error</p>
              <p className="text-sm mt-1">{caregiverError}</p>
            </div>
          )}

          {actionMessage.text && (
            <div className={`px-4 py-4 rounded-lg mb-6 shadow-md border-l-4 ${
              actionMessage.type === 'success'
                ? 'bg-green-50 border-green-600 text-green-800'
                : 'bg-red-50 border-red-600 text-red-800'
            }`}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold">
                    {actionMessage.type === 'success' ? 'Success' : 'Error'}
                  </p>
                  <p className="text-sm mt-1">{actionMessage.text}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setActionMessage({ type: '', text: '' })}
                  className="text-sm font-semibold hover:underline"
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}

          {filter === 'caregiver' ? (
            caregiverLoading ? (
              <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-slate-200">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                <div className="text-slate-600">Loading caregivers...</div>
              </div>
            ) : caregivers.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-slate-200">
                <div className="text-slate-600">No caregivers found</div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Pending Caregivers Section */}
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden border-t-4 border-yellow-500">
                  <div className="bg-yellow-50 px-6 py-4 border-b border-yellow-100">
                    <h3 className="text-lg font-bold text-slate-900">Pending Review ({pendingCaregivers.length})</h3>
                    <p className="text-sm text-slate-600 mt-1">Awaiting approval</p>
                  </div>
                  {pendingCaregivers.length === 0 ? (
                    <div className="p-6 text-center text-slate-500 font-medium">No pending caregivers</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Experience</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {pendingCaregivers.map((caregiver) => (
                        <tr key={caregiver._id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-semibold text-slate-900">{caregiver.user?.name || 'N/A'}</div>
                            <div className="text-xs text-slate-500 mt-1">{caregiver.serviceTypes?.slice(0, 2).join(', ') || 'N/A'}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-slate-700">{caregiver.user?.email || 'N/A'}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-slate-700">{caregiver.user?.phone || 'N/A'}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-slate-700">{caregiver.location || 'N/A'}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-slate-700">{caregiver.experience || 0} years</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex gap-2 items-center">
                              <button
                                onClick={() => openDocumentsModal(caregiver)}
                                className="inline-flex items-center gap-1 px-3 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-all duration-200 text-xs font-bold shadow-md hover:shadow-lg"
                              >
                                Documents
                              </button>
                              {(caregiver.verificationStatus || 'pending') === 'pending' && (
                                <>
                                  <button
                                    onClick={() => handleVerificationUpdate(caregiver._id, 'verified')}
                                    className="inline-flex items-center gap-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all duration-200 text-xs font-bold shadow-md hover:shadow-lg"
                                  >
                                    <CheckCircle className="w-4 h-4" />
                                    Approve
                                  </button>
                                  <button
                                    onClick={() => handleVerificationUpdate(caregiver._id, 'rejected')}
                                    className="inline-flex items-center gap-1 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all duration-200 text-xs font-bold shadow-md hover:shadow-lg"
                                  >
                                    <XCircle className="w-4 h-4" />
                                    Reject
                                  </button>
                                </>
                              )}
                              {(caregiver.verificationStatus || 'pending') === 'verified' && (
                                <button
                                  onClick={() => handleVerificationUpdate(caregiver._id, 'rejected')}
                                  className="inline-flex items-center gap-1 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all duration-200 text-xs font-bold shadow-md hover:shadow-lg"
                                >
                                  <XCircle className="w-4 h-4" />
                                  Revoke
                                </button>
                              )}
                              {(caregiver.verificationStatus || 'pending') === 'rejected' && (
                                <button
                                  onClick={() => handleVerificationUpdate(caregiver._id, 'verified')}
                                  className="inline-flex items-center gap-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all duration-200 text-xs font-bold shadow-md hover:shadow-lg"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                  Approve
                                </button>
                              )}
                              <button
                                onClick={() => openDeleteConfirmation(caregiver.user)}
                                className="text-red-600 hover:text-red-900 transition font-semibold"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Verified Caregivers Section */}
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden border-t-4 border-green-500">
                  <div className="bg-green-50 px-6 py-4 border-b border-green-100">
                    <h3 className="text-lg font-bold text-slate-900">Verified ({verifiedCaregivers.length})</h3>
                    <p className="text-sm text-slate-600 mt-1">Approved caregivers</p>
                  </div>
                  {verifiedCaregivers.length === 0 ? (
                    <div className="p-6 text-center text-slate-500 font-medium">No verified caregivers</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Experience</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {verifiedCaregivers.map((caregiver) => (
                            <tr key={caregiver._id} className="hover:bg-green-50 transition-colors">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-semibold text-slate-900">{caregiver.user?.name || 'N/A'}</div>
                                <div className="text-xs text-slate-500 mt-1">{caregiver.serviceTypes?.slice(0, 2).join(', ') || 'N/A'}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-slate-700">{caregiver.user?.email || 'N/A'}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-slate-700">{caregiver.user?.phone || 'N/A'}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-slate-700">{caregiver.location || 'N/A'}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-slate-700">{caregiver.experience || 0} years</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <div className="flex gap-2 items-center">
                                  <button
                                    onClick={() => openDocumentsModal(caregiver)}
                                    className="inline-flex items-center gap-1 px-3 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-all duration-200 text-xs font-bold shadow-md hover:shadow-lg"
                                  >
                                    Documents
                                  </button>
                                  <button
                                    onClick={() => handleVerificationUpdate(caregiver._id, 'rejected')}
                                    className="inline-flex items-center gap-1 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all duration-200 text-xs font-bold shadow-md hover:shadow-lg"
                                  >
                                    <XCircle className="w-4 h-4" />
                                    Revoke
                                  </button>
                                  <button
                                    onClick={() => openDeleteConfirmation(caregiver.user)}
                                    className="text-red-600 hover:text-red-900 transition font-semibold"
                                  >
                                    Delete
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Rejected Caregivers Section */}
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden border-t-4 border-red-500">
                  <div className="bg-red-50 px-6 py-4 border-b border-red-100">
                    <h3 className="text-lg font-bold text-slate-900">Rejected ({rejectedCaregivers.length})</h3>
                    <p className="text-sm text-slate-600 mt-1">Verification not approved</p>
                  </div>
                  {rejectedCaregivers.length === 0 ? (
                    <div className="p-6 text-center text-slate-500 font-medium">No rejected caregivers</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-100">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-bold text-slate-900 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-slate-900 uppercase tracking-wider">Email</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-slate-900 uppercase tracking-wider">Phone</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-slate-900 uppercase tracking-wider">Location</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-slate-900 uppercase tracking-wider">Experience</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-slate-900 uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                          {rejectedCaregivers.map((caregiver) => (
                            <tr key={caregiver._id} className="hover:bg-red-50 transition-colors">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-semibold text-slate-900">{caregiver.user?.name || 'N/A'}</div>
                                <div className="text-xs text-slate-500 mt-1">{caregiver.serviceTypes?.slice(0, 2).join(', ') || 'N/A'}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-slate-700">{caregiver.user?.email || 'N/A'}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-slate-700">{caregiver.user?.phone || 'N/A'}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-slate-700">{caregiver.location || 'N/A'}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-slate-700">{caregiver.experience || 0} years</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <div className="flex gap-2 items-center">
                                  <button
                                    onClick={() => openDocumentsModal(caregiver)}
                                    className="inline-flex items-center gap-1 px-3 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-all duration-200 text-xs font-bold shadow-md hover:shadow-lg"
                                  >
                                    Documents
                                  </button>
                                  <button
                                    onClick={() => handleVerificationUpdate(caregiver._id, 'verified')}
                                    className="inline-flex items-center gap-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all duration-200 text-xs font-bold shadow-md hover:shadow-lg"
                                  >
                                    <CheckCircle className="w-4 h-4" />
                                    Approve
                                  </button>
                                  <button
                                    onClick={() => openDeleteConfirmation(caregiver.user)}
                                    className="text-red-600 hover:text-red-900 transition font-semibold"
                                  >
                                    Delete
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )
          ) : loading ? (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-slate-200">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <div className="text-slate-600">Loading users...</div>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-slate-200">
              <div className="text-slate-600">No users found</div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-100">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-bold text-slate-900 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-slate-900 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-slate-900 uppercase tracking-wider">
                        Phone
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-slate-900 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-slate-900 uppercase tracking-wider">
                        Registered
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-slate-900 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                    {filteredUsers.map((user) => (
                      <tr key={user._id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-slate-900">{user.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-slate-700">{user.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-slate-700">{user.phone || 'N/A'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full ${getRoleBadgeColor(user.role)}`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                          {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {user.role !== 'admin' && (
                            <button
                              onClick={() => openDeleteConfirmation(user)}
                              className="text-red-600 hover:text-red-900 transition font-semibold"
                            >
                              Delete
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Documents Modal */}
      {documentsModal.open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full p-6 max-h-[85vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Caregiver Documents</h3>
                <p className="text-sm text-slate-600">
                  {documentsModal.caregiver?.user?.name || 'Caregiver'}
                </p>
              </div>
              <button
                onClick={closeDocumentsModal}
                className="text-sm font-semibold text-slate-600 hover:text-slate-900"
              >
                Close
              </button>
            </div>

            {documentsLoading ? (
              <div className="py-12 text-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600 mx-auto mb-3"></div>
                <p className="text-slate-600">Loading documents...</p>
              </div>
            ) : documentsError ? (
              <div className="bg-red-50 border-l-4 border-red-600 text-red-800 px-4 py-4 rounded-lg">
                <p className="font-semibold">Error</p>
                <p className="text-sm mt-1">{documentsError}</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 mb-2">Uploaded Files (Identity/Police/Qualification)</h4>
                  {Object.keys(groupedUploads).length === 0 ? (
                    <p className="text-sm text-slate-500">No uploaded files found.</p>
                  ) : (
                    <div className="space-y-3">
                      {Object.entries(groupedUploads).map(([type, docs]) => (
                        <div key={type} className="rounded-lg border border-slate-200 p-3">
                          <p className="text-xs font-bold uppercase text-slate-500">{type}</p>
                          <div className="mt-2 space-y-2">
                            {docs.map((doc) => (
                              <div key={doc._id} className="flex items-center justify-between gap-3 text-sm">
                                <div>
                                  <a
                                    href={doc.fileUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-blue-700 underline"
                                  >
                                    {doc.fileName || 'View document'}
                                  </a>
                                  <p className="text-xs text-slate-500">Uploaded: {formatDate(doc.createdAt)}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <h4 className="text-sm font-bold text-slate-900 mb-2">NVQ Certifications</h4>
                  {documentsData.nvqCertifications.length === 0 ? (
                    <p className="text-sm text-slate-500">No NVQ certifications uploaded.</p>
                  ) : (
                    <div className="space-y-3">
                      {documentsData.nvqCertifications.map((cert) => (
                        <div key={cert._id} className="rounded-lg border border-slate-200 p-3">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-sm font-semibold text-slate-900">{cert.level || 'NVQ'}</p>
                              <p className="text-xs text-slate-500">{cert.subject || 'Subject not provided'}</p>
                              <p className="text-xs text-slate-500">Issued: {formatDate(cert.issueDate)}</p>
                            </div>
                            {cert.documentUrl && (
                              <a
                                href={cert.documentUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-sm text-blue-700 underline"
                              >
                                View document
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <h4 className="text-sm font-bold text-slate-900 mb-2">Professional Documents</h4>
                  {documentsData.professionalDocuments.length === 0 ? (
                    <p className="text-sm text-slate-500">No professional documents uploaded.</p>
                  ) : (
                    <div className="space-y-3">
                      {documentsData.professionalDocuments.map((doc) => (
                        <div key={doc._id} className="rounded-lg border border-slate-200 p-3">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-sm font-semibold text-slate-900">{doc.title || doc.documentType || 'Document'}</p>
                              <p className="text-xs text-slate-500">{doc.issuer || 'Issuer not provided'}</p>
                              <p className="text-xs text-slate-500">Issued: {formatDate(doc.issueDate)}</p>
                            </div>
                            {doc.documentUrl && (
                              <a
                                href={doc.documentUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-sm text-blue-700 underline"
                              >
                                View document
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <h4 className="text-sm font-bold text-slate-900 mb-2">Verification Documents</h4>
                  {documentsData.verificationDocuments.length === 0 ? (
                    <p className="text-sm text-slate-500">No verification documents uploaded.</p>
                  ) : (
                    <div className="space-y-3">
                      {documentsData.verificationDocuments.map((doc) => (
                        <div key={doc._id} className="rounded-lg border border-slate-200 p-3">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-sm font-semibold text-slate-900">{doc.originalName || 'Verification Document'}</p>
                              <p className="text-xs text-slate-500">Uploaded: {formatDate(doc.uploadedAt)}</p>
                            </div>
                            {doc.url && (
                              <a
                                href={doc.url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-sm text-blue-700 underline"
                              >
                                View document
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Rejection Reason Modal */}
      {showRejectionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-slate-900 mb-2">Rejection Reason</h3>
            <p className="text-slate-600 mb-4 text-sm">Please provide a reason for rejecting this caregiver. This will be recorded and may be communicated to them.</p>

            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Enter rejection reason..."
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none bg-white text-slate-900 placeholder-slate-500"
              rows="4"
            />

            <div className="flex gap-3 justify-end mt-6">
              <button
                onClick={() => {
                  setShowRejectionModal(false)
                  setRejectionReason('')
                  setPendingRejectionId(null)
                }}
                className="px-4 py-2 border-2 border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 font-semibold transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={submitRejection}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg"
              >
                Submit Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Verification Confirmation Modal */}
      {verificationConfirm.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg ${
                  verificationConfirm.status === 'verified'
                    ? 'bg-green-100'
                    : 'bg-red-100'
                }`}>
                  {verificationConfirm.status === 'verified' ? (
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  ) : (
                    <XCircle className="w-6 h-6 text-red-600" />
                  )}
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  {verificationConfirm.status === 'verified'
                    ? 'Approve Caregiver'
                    : verificationConfirm.status === 'rejected'
                    ? 'Reject Caregiver'
                    : 'Update Verification'}
                </h3>
                <p className="text-slate-600 text-sm mb-4">
                  {verificationConfirm.status === 'verified'
                    ? 'This caregiver will be marked as verified and can accept bookings.'
                    : 'This caregiver will be marked as rejected and cannot accept new bookings.'}
                </p>
                {verificationConfirm.reason && verificationConfirm.status === 'rejected' && (
                  <div className="bg-red-50 border-l-4 border-red-600 p-3 rounded">
                    <p className="text-xs font-bold text-red-800 mb-1">REJECTION REASON</p>
                    <p className="text-xs text-red-700">{verificationConfirm.reason}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3 justify-end mt-6">
              <button
                onClick={() => setVerificationConfirm({ show: false, caregiverId: null, status: null })}
                className="px-4 py-2 border-2 border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 font-semibold transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={confirmVerificationUpdate}
                className={`px-4 py-2 text-white rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg ${
                  verificationConfirm.status === 'verified'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {verificationConfirm.status === 'verified' ? 'Approve' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmation.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center shadow-lg">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  Delete User Account
                </h3>
                <p className="text-slate-600 text-sm mb-4">
                  Are you sure you want to delete <strong>{deleteConfirmation.user?.name}</strong>? This action cannot be undone.
                </p>
                <div className="bg-yellow-50 border-l-4 border-yellow-500 p-3 rounded">
                  <div className="flex gap-2">
                    <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div className="text-xs text-yellow-800">
                      <p className="font-bold mb-2">Important Warnings:</p>
                      <ul className="list-disc ml-4 space-y-1">
                        <li>This action cannot be undone</li>
                        <li>Users with active bookings cannot be deleted</li>
                        <li>Pending bookings will be auto-cancelled</li>
                        {deleteConfirmation.user?.role === 'caregiver' && (
                          <li>The caregiver profile will also be removed</li>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3 justify-end mt-6">
              <button
                onClick={closeDeleteConfirmation}
                className="px-4 py-2 border-2 border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 font-semibold transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteUser(deleteConfirmation.user._id)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold transition-all duration-200 shadow-md hover:shadow-lg"
              >
                Delete User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminUsers

