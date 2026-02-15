import React, { useState, useEffect } from 'react'
import { Eye, CheckCircle, XCircle, X } from 'lucide-react'
import Navbar from '../../components/layout/Navbar'
import Sidebar from '../../components/layout/Sidebar'
import { caregiverService } from '../../services/api'

const AdminCaregivers = () => {
  const [caregivers, setCaregivers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState('all') // all, verified, pending, rejected
  const [selectedCaregiver, setSelectedCaregiver] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [verificationConfirm, setVerificationConfirm] = useState({ show: false, caregiverId: null, status: null })
  const [rejectionReason, setRejectionReason] = useState('')
  const [showRejectionModal, setShowRejectionModal] = useState(false)
  const [pendingRejectionId, setPendingRejectionId] = useState(null)

  useEffect(() => {
    fetchCaregivers()
  }, [filter])

  const fetchCaregivers = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await caregiverService.getCaregivers()
      setCaregivers(response.data.data || [])
    } catch (err) {
      console.error('Error fetching caregivers:', err)
      setError('Failed to load caregivers. Please try again.')
    } finally {
      setLoading(false)
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
      alert('Please provide a reason for rejection')
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
      console.log('Updating caregiver:', caregiverId, 'with data:', updateData)
      const response = await caregiverService.updateCaregiver(caregiverId, updateData)
      console.log('Update response:', response)
      setCaregivers(caregivers.map(cg => 
        cg._id === caregiverId ? { ...cg, verificationStatus: status, verificationNotes: reason || cg.verificationNotes } : cg
      ))
      if (selectedCaregiver?._id === caregiverId) {
        setSelectedCaregiver(prev => ({ ...prev, verificationStatus: status, verificationNotes: reason || prev.verificationNotes }))
      }
      setVerificationConfirm({ show: false, caregiverId: null, status: null })
      alert(`Caregiver ${status} successfully${reason ? ' with reason: ' + reason : ''}`)
    } catch (err) {
      console.error('Error updating verification:', err)
      console.error('Error response:', err.response?.data)
      alert(`Failed to update verification status: ${err.response?.data?.message || err.message}`)
      setVerificationConfirm({ show: false, caregiverId: null, status: null })
    }
  }

  const handleViewDetails = (caregiver) => {
    setSelectedCaregiver(caregiver)
    setShowModal(true)
  }

  const filteredCaregivers = caregivers.filter(caregiver => {
    if (filter === 'all') return true
    return caregiver.verificationStatus === filter
  })

  const getStatusBadgeColor = (status) => {
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex">
        <Sidebar role="admin" />
        <main className="flex-1 p-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">Caregiver Management</h1>
            <div className="text-sm text-gray-600">
              Total: {filteredCaregivers.length} caregiver{filteredCaregivers.length !== 1 ? 's' : ''}
            </div>
          </div>

          {/* Filter Buttons */}
          <div className="mb-6 flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              All Caregivers
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === 'pending'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Pending caregivers
            </button>
            <button
              onClick={() => setFilter('verified')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === 'verified'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Verified Caregivers
            </button>
            
            <button
              onClick={() => setFilter('rejected')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === 'rejected'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Rejected Caregivers
            </button>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          {loading ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <div className="text-gray-600">Loading caregivers...</div>
            </div>
          ) : filteredCaregivers.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <div className="text-gray-600">No caregivers found</div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Caregiver
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contact
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Location
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Experience
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Rating
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredCaregivers.map((caregiver) => (
                      <tr key={caregiver._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {caregiver.user?.name || 'N/A'}
                              </div>
                              <div className="text-xs text-gray-500">
                                {caregiver.serviceTypes?.slice(0, 2).join(', ')}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-600">{caregiver.user?.email || 'N/A'}</div>
                          <div className="text-xs text-gray-500">{caregiver.user?.phone || 'N/A'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-600">{caregiver.location || 'N/A'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-600">{caregiver.experience || 0} years</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className="text-yellow-400">★</span>
                            <span className="ml-1 text-sm text-gray-600">{caregiver.rating?.toFixed(1) || 'N/A'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(caregiver.verificationStatus)}`}>
                            {caregiver.verificationStatus || 'pending'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex gap-2 items-center">
                            <button
                              onClick={() => handleViewDetails(caregiver)}
                              className="inline-flex items-center gap-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded transition text-xs"
                            >
                              <Eye className="w-4 h-4" />
                              View
                            </button>
                            
                            {caregiver.verificationStatus === 'pending' && (
                              <div className="flex gap-1">
                                <button
                                  onClick={() => handleVerificationUpdate(caregiver._id, 'verified')}
                                  className="inline-flex items-center gap-1 px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded transition text-xs font-medium"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                  Approve
                                </button>
                                <button
                                  onClick={() => handleVerificationUpdate(caregiver._id, 'rejected')}
                                  className="inline-flex items-center gap-1 px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded transition text-xs font-medium"
                                >
                                  <XCircle className="w-4 h-4" />
                                  Reject
                                </button>
                              </div>
                            )}
                            {caregiver.verificationStatus === 'verified' && (
                              <button
                                onClick={() => handleVerificationUpdate(caregiver._id, 'rejected')}
                                className="inline-flex items-center gap-1 px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded transition text-xs font-medium"
                              >
                                <XCircle className="w-4 h-4" />
                                Revoke
                              </button>
                            )}
                            {caregiver.verificationStatus === 'rejected' && (
                              <button
                                onClick={() => handleVerificationUpdate(caregiver._id, 'verified')}
                                className="inline-flex items-center gap-1 px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded transition text-xs font-medium"
                              >
                                <CheckCircle className="w-4 h-4" />
                                Approve
                              </button>
                            )}
                          </div>
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

      {/* Details Modal */}
      {showModal && selectedCaregiver && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Caregiver Details</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Personal Information */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Personal Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600">Name</label>
                  <p className="text-gray-900">{selectedCaregiver.user?.name || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">Email</label>
                  <p className="text-gray-900">{selectedCaregiver.user?.email || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">Phone</label>
                  <p className="text-gray-900">{selectedCaregiver.user?.phone || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">Location</label>
                  <p className="text-gray-900">{selectedCaregiver.location || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Professional Information */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Professional Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600">Specialization</label>
                  <p className="text-gray-900">{selectedCaregiver.specialization || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">Experience</label>
                  <p className="text-gray-900">{selectedCaregiver.experience || 0} years</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">Hourly Rate</label>
                  <p className="text-gray-900">Rs. {selectedCaregiver.hourlyRate || 0}/hour</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">Rating</label>
                  <div className="flex items-center">
                    <span className="text-yellow-400">★</span>
                    <span className="ml-1 text-gray-900">{selectedCaregiver.rating?.toFixed(1) || 'No ratings'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Service Types */}
            {selectedCaregiver.serviceTypes && selectedCaregiver.serviceTypes.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Service Types</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedCaregiver.serviceTypes.map((service, idx) => (
                    <span key={idx} className="bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full">
                      {service}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Certifications */}
            {selectedCaregiver.certifications && selectedCaregiver.certifications.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Certifications</h3>
                <div className="space-y-3">
                  {selectedCaregiver.certifications.map((cert, idx) => (
                    <div key={idx} className="bg-gray-50 p-3 rounded-lg">
                      <p className="font-medium text-gray-900">{cert.name || 'N/A'}</p>
                      <p className="text-sm text-gray-600">Issuer: {cert.issuer || 'Not specified'}</p>
                      <p className="text-sm text-gray-600">Date: {cert.date ? new Date(cert.date).toLocaleDateString() : 'Not specified'}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Verification Status */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Verification Status</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusBadgeColor(selectedCaregiver.verificationStatus)}`}>
                    {selectedCaregiver.verificationStatus || 'pending'}
                  </span>
                </div>
                {selectedCaregiver.verificationNotes && selectedCaregiver.verificationStatus === 'rejected' && (
                  <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded">
                    <p className="text-sm font-medium text-red-800 mb-1">Rejection Reason:</p>
                    <p className="text-sm text-red-700">{selectedCaregiver.verificationNotes}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Bio */}
            {selectedCaregiver.bio && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Bio</h3>
                <p className="text-gray-700">{selectedCaregiver.bio}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 justify-end mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition"
              >
                Close
              </button>
              
              {selectedCaregiver.verificationStatus === 'pending' && (
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      handleVerificationUpdate(selectedCaregiver._id, 'verified')
                      setShowModal(false)
                    }}
                    className="inline-flex items-center gap-2 px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition"
                  >
                    <CheckCircle className="w-5 h-5" />
                    Approve
                  </button>
                  <button
                    onClick={() => {
                      handleVerificationUpdate(selectedCaregiver._id, 'rejected')
                      setShowModal(false)
                    }}
                    className="inline-flex items-center gap-2 px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition"
                  >
                    <XCircle className="w-5 h-5" />
                    Reject
                  </button>
                </div>
              )}
              
              {selectedCaregiver.verificationStatus === 'verified' && (
                <button
                  onClick={() => {
                    handleVerificationUpdate(selectedCaregiver._id, 'rejected')
                    setShowModal(false)
                  }}
                  className="inline-flex items-center gap-2 px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition"
                >
                  <XCircle className="w-5 h-5" />
                  Revoke
                </button>
              )}
              
              {selectedCaregiver.verificationStatus === 'rejected' && (
                <button
                  onClick={() => {
                    handleVerificationUpdate(selectedCaregiver._id, 'verified')
                    setShowModal(false)
                  }}
                  className="inline-flex items-center gap-2 px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition"
                >
                  <CheckCircle className="w-5 h-5" />
                  Approve
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Rejection Reason Modal */}
      {showRejectionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Rejection Reason</h3>
            <p className="text-gray-600 mb-4">Please provide a reason for rejecting this caregiver. This will be recorded and may be communicated to them.</p>
            
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Enter rejection reason..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows="4"
            />
            
            <div className="flex gap-3 justify-end mt-6">
              <button
                onClick={() => {
                  setShowRejectionModal(false)
                  setRejectionReason('')
                  setPendingRejectionId(null)
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition"
              >
                Cancel
              </button>
              <button
                onClick={submitRejection}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition"
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
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  verificationConfirm.status === 'verified' 
                    ? 'bg-green-100' 
                    : 'bg-red-100'
                }`}>
                  {verificationConfirm.status === 'verified' ? (
                    <CheckCircle className={`w-6 h-6 ${
                      verificationConfirm.status === 'verified' 
                        ? 'text-green-600' 
                        : 'text-red-600'
                    }`} />
                  ) : (
                    <XCircle className="w-6 h-6 text-red-600" />
                  )}
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {verificationConfirm.status === 'verified' 
                    ? 'Approve Caregiver' 
                    : verificationConfirm.status === 'rejected'
                    ? 'Reject Caregiver'
                    : 'Update Verification'}
                </h3>
                <p className="text-gray-600 mb-4">
                  {verificationConfirm.status === 'verified' 
                    ? 'This caregiver will be marked as verified and can accept bookings.'
                    : 'This caregiver will be marked as rejected and cannot accept new bookings.'}
                </p>
                {verificationConfirm.reason && verificationConfirm.status === 'rejected' && (
                  <div className="bg-red-50 border border-red-200 p-3 rounded mb-4">
                    <p className="text-sm font-medium text-red-800 mb-1">Rejection Reason:</p>
                    <p className="text-sm text-red-700">{verificationConfirm.reason}</p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex gap-3 justify-end mt-6">
              <button
                onClick={() => setVerificationConfirm({ show: false, caregiverId: null, status: null })}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmVerificationUpdate}
                className={`px-4 py-2 text-white rounded-lg font-medium transition ${
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
    </div>
  )
}

export default AdminCaregivers

