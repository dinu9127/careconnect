import React, { useState, useEffect } from 'react'
import Navbar from '../../components/layout/Navbar'
import Sidebar from '../../components/layout/Sidebar'
import { FileText, Upload, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import api from '../../services/api'

const UpdateVerification = () => {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [verificationData, setVerificationData] = useState({
    idType: '',
    idNumber: '',
    isVerified: false,
    verificationStatus: 'pending',
    documents: []
  })

  const idTypes = [
    'National Identity Card',
    'Passport',
    'Driving License'
  ]

  useEffect(() => {
    fetchVerificationData()
  }, [])

  const fetchVerificationData = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'))
      const response = await api.get(`/api/caregivers/${user.id}`)
      const caregiver = response.data

      setVerificationData({
        idType: caregiver.idType || '',
        idNumber: caregiver.idNumber || '',
        isVerified: caregiver.isVerified || false,
        verificationStatus: caregiver.verificationStatus || 'pending',
        documents: caregiver.documents || []
      })
    } catch (error) {
      console.error('Error fetching verification data:', error)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setVerificationData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const user = JSON.parse(localStorage.getItem('user'))
      
      await api.put(`/api/caregivers/${user.id}`, {
        idType: verificationData.idType,
        idNumber: verificationData.idNumber,
        verificationStatus: 'pending'
      })

      setMessage('Verification information submitted! Awaiting admin approval.')
      setTimeout(() => setMessage(''), 5000)
      fetchVerificationData()
    } catch (error) {
      setMessage('Error submitting verification information')
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = () => {
    const status = verificationData.verificationStatus
    
    if (verificationData.isVerified) {
      return (
        <div className="flex items-center gap-2 text-green-600 bg-green-50 px-4 py-2 rounded-lg">
          <CheckCircle className="w-5 h-5" />
          <span className="font-medium">Verified</span>
        </div>
      )
    }

    if (status === 'pending') {
      return (
        <div className="flex items-center gap-2 text-yellow-600 bg-yellow-50 px-4 py-2 rounded-lg">
          <AlertCircle className="w-5 h-5" />
          <span className="font-medium">Pending Review</span>
        </div>
      )
    }

    if (status === 'rejected') {
      return (
        <div className="flex items-center gap-2 text-red-600 bg-red-50 px-4 py-2 rounded-lg">
          <XCircle className="w-5 h-5" />
          <span className="font-medium">Rejected - Please Resubmit</span>
        </div>
      )
    }

    return (
      <div className="flex items-center gap-2 text-gray-600 bg-gray-50 px-4 py-2 rounded-lg">
        <AlertCircle className="w-5 h-5" />
        <span className="font-medium">Not Submitted</span>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex">
        <Sidebar role="caregiver" />
        <main className="flex-1 p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Update Verification</h1>

          {message && (
            <div className={`p-4 mb-6 rounded-lg ${message.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
              {message}
            </div>
          )}

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Verification Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-md p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Verification Information
                  </h2>
                  {getStatusBadge()}
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* ID Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ID Document Type *
                    </label>
                    <select
                      name="idType"
                      value={verificationData.idType}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select ID Type</option>
                      {idTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>

                  {/* ID Number */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ID Number *
                    </label>
                    <input
                      type="text"
                      name="idNumber"
                      value={verificationData.idNumber}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      placeholder="Enter your ID number"
                      required
                    />
                  </div>

                  {/* Document Upload (Placeholder) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Upload ID Document
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                      <Upload className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                      <p className="text-gray-600 mb-2">Drag and drop or click to upload</p>
                      <p className="text-sm text-gray-500">PDF, JPG, PNG (Max 5MB)</p>
                      <button
                        type="button"
                        className="mt-4 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                      >
                        Choose File
                      </button>
                    </div>
                  </div>

                  {/* Police Clearance (Optional) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Police Clearance Certificate (Optional)
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                      <Upload className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                      <p className="text-gray-600 mb-2">Upload Police Clearance</p>
                      <p className="text-sm text-gray-500">PDF, JPG, PNG (Max 5MB)</p>
                      <button
                        type="button"
                        className="mt-4 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                      >
                        Choose File
                      </button>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading || verificationData.isVerified}
                    className="w-full bg-teal-600 text-white py-3 rounded-lg font-medium hover:bg-teal-700 transition disabled:bg-gray-400"
                  >
                    {loading ? 'Submitting...' : verificationData.isVerified ? 'Already Verified' : 'Submit for Verification'}
                  </button>
                </form>
              </div>
            </div>

            {/* Info Card */}
            <div className="lg:col-span-1">
              <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                <h3 className="font-bold text-blue-900 mb-3">Verification Requirements</h3>
                <ul className="space-y-2 text-sm text-blue-800">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>Valid government-issued ID</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>Clear, readable document images</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>Police clearance (recommended)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>Professional certifications</span>
                  </li>
                </ul>
                <div className="mt-4 pt-4 border-t border-blue-200">
                  <p className="text-xs text-blue-700">
                    Verification typically takes 2-3 business days. You'll be notified via email once approved.
                  </p>
                </div>
              </div>

              {/* Uploaded Documents */}
              {verificationData.documents.length > 0 && (
                <div className="bg-white rounded-lg shadow-md p-6 mt-6">
                  <h3 className="font-bold text-gray-800 mb-3">Uploaded Documents</h3>
                  <div className="space-y-2">
                    {verificationData.documents.map((doc, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm text-gray-700 p-2 bg-gray-50 rounded">
                        <FileText className="w-4 h-4" />
                        <span>{doc.name || `Document ${index + 1}`}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default UpdateVerification
