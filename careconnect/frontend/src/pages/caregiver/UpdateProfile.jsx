import React, { useState, useEffect } from 'react'
import Navbar from '../../components/layout/Navbar'
import Sidebar from '../../components/layout/Sidebar'
import { User, Phone, Mail, MapPin, DollarSign, Award, Save, FileText, CheckCircle, AlertCircle, Upload, X, Camera } from 'lucide-react'
import api from '../../services/api'

const UpdateProfile = () => {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [activeTab, setActiveTab] = useState('profile') // profile, verification
  const [currentStep, setCurrentStep] = useState(1) // 1: identity, 2: nvq, 3: professional
  const [isNewCaregiverSetup, setIsNewCaregiverSetup] = useState(false)
  const [caregiverId, setCaregiverId] = useState(null)
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    bio: '',
    hourlyRate: '',
    experience: '',
    certifications: '',
    serviceTypes: [],
    profilePicture: null,
    profilePicturePreview: ''
  })

  // Verification Documents State
  const [identityData, setIdentityData] = useState({
    idType: '',
    idNumber: '',
    documentUrl: '',
    file: null
  })
  
  const [nvqData, setNvqData] = useState({
    level: '',
    subject: '',
    issueDate: '',
    expiryDate: '',
    certificateNumber: '',
    documentUrl: '',
    file: null
  })
  
  const [professionalData, setProfessionalData] = useState({
    documentType: '',
    issuer: '',
    title: '',
    issueDate: '',
    expiryDate: '',
    documentUrl: '',
    description: '',
    file: null
  })

  const [uploadedDocuments, setUploadedDocuments] = useState({
    identity: null,
    nvq: null,
    professional: null
  })

  const locations = [
    'Colombo', 'Kandy', 'Galle', 'Jaffna', 'Negombo', 
    'Anuradhapura', 'Trincomalee', 'Batticaloa', 'Matara', 
    'Kurunegala', 'Ratnapura', 'Badulla', 'Nuwara Eliya', 
    'Hambantota', 'Ampara'
  ]

  const serviceTypes = [
    'Elderly Care',
    'Child Care',
    'Hospital Companion Care',
    'Disability Support'
  ]

  const idTypes = ['National Identity Card', 'Passport', 'Driving License']
  const nvqLevels = ['Level 1', 'Level 2', 'Level 3', 'Level 4', 'Level 5']
  const docTypes = [
    'Service Letter',
    'Professional Certificate',
    'Training Certificate',
    'License',
    'Qualification',
    'Other'
  ]

  useEffect(() => {
    fetchProfile()
    checkIfNewCaregiver()
  }, [])

  const checkIfNewCaregiver = () => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('new') === 'true') {
      setIsNewCaregiverSetup(true)
      setActiveTab('verification')
    }
  }

  const fetchProfile = async () => {
    try {
      const response = await api.get('/caregivers/me')
      const caregiver = response.data.data
      
      // Store caregiver ID for updates
      setCaregiverId(caregiver._id)

      setFormData({
        name: caregiver.user?.name || '',
        email: caregiver.user?.email || '',
        phone: caregiver.user?.phone || '',
        location: caregiver.location || '',
        bio: caregiver.bio || '',
        hourlyRate: caregiver.hourlyRate || '',
        experience: caregiver.experience || '',
        certifications: Array.isArray(caregiver.certifications) 
          ? caregiver.certifications.map(c => c.name || c).join(', ')
          : '',
        serviceTypes: caregiver.serviceTypes || [],
        profilePicture: null,
        profilePicturePreview: caregiver.profileImage || ''
      })
    } catch (error) {
      console.error('Error fetching profile:', error)
      console.error('Error response:', error.response?.data)
      const errorMsg = error.response?.data?.message || 'Error loading profile. Please try again.'
      setMessage(errorMsg)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setMessage('Please upload an image file (JPG, PNG, etc.)')
        return
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setMessage('Image size must be less than 5MB')
        return
      }
      setFormData(prev => ({ ...prev, profilePicture: file }))
      
      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, profilePicturePreview: reader.result }))
      }
      reader.readAsDataURL(file)
    }
  }

  const removeProfilePicture = () => {
    setFormData(prev => ({
      ...prev,
      profilePicture: null,
      profilePicturePreview: ''
    }))
  }

  const handleServiceTypeToggle = (service) => {
    setFormData(prev => ({
      ...prev,
      serviceTypes: prev.serviceTypes.includes(service)
        ? prev.serviceTypes.filter(s => s !== service)
        : [...prev.serviceTypes, service]
    }))
  }

  const handleProfileSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      if (!caregiverId) {
        setMessage('Caregiver profile not found. Please refresh the page.')
        setLoading(false)
        return
      }
      
      // Validate phone number - must be exactly 10 digits
      const phoneDigits = formData.phone.replace(/\D/g, '')
      if (phoneDigits.length !== 10) {
        setMessage('Phone number must be exactly 10 digits')
        setLoading(false)
        return
      }
      
      const user = JSON.parse(localStorage.getItem('user'))
      
      // Update user data (name and phone)
      await api.put(`/users/${user._id}`, {
        name: formData.name,
        phone: phoneDigits
      })

      // Prepare caregiver data (without gender field)
      const caregiverData = {
        location: formData.location,
        bio: formData.bio,
        hourlyRate: Number(formData.hourlyRate),
        experience: Number(formData.experience),
        // Convert certifications string to array of objects matching the database schema
        certifications: formData.certifications.split(',').map(c => c.trim()).filter(c => c).map(cert => ({
          name: cert,
          issuer: '',
          date: null
        })),
        serviceTypes: formData.serviceTypes
      }

      // If there's a new profile picture, upload it
      if (formData.profilePicture) {
        const formDataToSend = new FormData()
        formDataToSend.append('profilePicture', formData.profilePicture)
        
        Object.keys(caregiverData).forEach(key => {
          if (Array.isArray(caregiverData[key])) {
            formDataToSend.append(key, JSON.stringify(caregiverData[key]))
          } else {
            formDataToSend.append(key, caregiverData[key])
          }
        })

        await api.put(`/caregivers/${caregiverId}`, formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
      } else {
        // Update caregiver data without profile picture
        await api.put(`/caregivers/${caregiverId}`, caregiverData)
      }

      setMessage('Profile updated successfully!')
      setFormData(prev => ({ ...prev, profilePicture: null }))
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      console.error('Error updating profile:', error)
      console.error('Error response:', error.response?.data)
      
      // Provide user-friendly error messages
      let errorMsg = 'Unable to update profile. Please try again.'
      
      if (error.response?.data?.message) {
        const backendMsg = error.response.data.message
        // Convert technical errors to user-friendly messages
        if (backendMsg.includes('validation failed') || backendMsg.includes('Cast to')) {
          errorMsg = 'Please check all fields are filled correctly'
        } else if (backendMsg.includes('required')) {
          errorMsg = 'Please fill in all required fields'
        } else if (backendMsg.includes('duplicate')) {
          errorMsg = 'This information already exists'
        } else {
          errorMsg = backendMsg
        }
      }
      
      setMessage(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  // File validation - only PDF and DOCX
  const validateFileType = (file) => {
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    const allowedExtensions = ['.pdf', '.docx']
    const fileName = file.name.toLowerCase()
    
    const isAllowedType = allowedTypes.includes(file.type)
    const isAllowedExtension = allowedExtensions.some(ext => fileName.endsWith(ext))
    
    return isAllowedType || isAllowedExtension
  }

  const handleIdentityFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (!validateFileType(file)) {
        setMessage('Only PDF and DOCX files are allowed for verification documents')
        return
      }
      setIdentityData(prev => ({ ...prev, file }))
    }
  }

  const handleNvqFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (!validateFileType(file)) {
        setMessage('Only PDF and DOCX files are allowed for verification documents')
        return
      }
      setNvqData(prev => ({ ...prev, file }))
    }
  }

  const handleProfessionalFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (!validateFileType(file)) {
        setMessage('Only PDF and DOCX files are allowed for verification documents')
        return
      }
      setProfessionalData(prev => ({ ...prev, file }))
    }
  }

  const uploadDocument = async (docType, data, file) => {
    if (!file) {
      setMessage('Please select a file to upload')
      return
    }

    setLoading(true)
    try {
      const formDataToSend = new FormData()
      formDataToSend.append('document', file)
      formDataToSend.append('documentType', docType)
      
      // Add additional fields based on document type
      if (docType === 'identity') {
        formDataToSend.append('idType', data.idType)
        formDataToSend.append('idNumber', data.idNumber)
      } else if (docType === 'nvq') {
        formDataToSend.append('level', data.level)
        formDataToSend.append('subject', data.subject)
        formDataToSend.append('issueDate', data.issueDate)
        formDataToSend.append('expiryDate', data.expiryDate)
        formDataToSend.append('certificateNumber', data.certificateNumber)
      } else if (docType === 'professional') {
        formDataToSend.append('documentType', data.documentType)
        formDataToSend.append('issuer', data.issuer)
        formDataToSend.append('title', data.title)
        formDataToSend.append('issueDate', data.issueDate)
        formDataToSend.append('expiryDate', data.expiryDate)
        formDataToSend.append('description', data.description)
      }

      const user = JSON.parse(localStorage.getItem('user'))
      const endpoint = docType === 'identity' 
        ? `/caregivers/${user.id}/identity-verification`
        : docType === 'nvq'
        ? `/caregivers/${user.id}/nvq-certifications`
        : `/caregivers/${user.id}/professional-documents`

      const response = await api.post(endpoint, formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      setUploadedDocuments(prev => ({
        ...prev,
        [docType]: response.data.data
      }))

      setMessage(`${docType.charAt(0).toUpperCase() + docType.slice(1)} document uploaded successfully!`)
      
      // Reset file inputs
      if (docType === 'identity') {
        setIdentityData(prev => ({ ...prev, file: null }))
      } else if (docType === 'nvq') {
        setNvqData(prev => ({ ...prev, file: null }))
      } else if (docType === 'professional') {
        setProfessionalData(prev => ({ ...prev, file: null }))
      }

      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      setMessage(`Error uploading ${docType} document: ${error.response?.data?.message || error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const nextStep = () => {
    if (currentStep < 3) setCurrentStep(currentStep + 1)
  }

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1)
  }

  const completeSetup = () => {
    setIsNewCaregiverSetup(false)
    setActiveTab('profile')
    setCurrentStep(1)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex">
        <Sidebar role="caregiver" />
        <main className="flex-1 p-8">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                {isNewCaregiverSetup ? 'Complete Your Profile' : 'Update Profile'}
              </h1>
              <p className="text-gray-600">
                {isNewCaregiverSetup ? 'Add your profile information and verify your documents' : 'Manage your profile and verification documents'}
              </p>
            </div>

            {/* Message */}
            {message && (
              <div className={`mb-6 p-4 rounded-lg flex items-start gap-3 ${
                message.includes('Error') 
                  ? 'bg-red-100 text-red-800 border border-red-300' 
                  : 'bg-green-100 text-green-800 border border-green-300'
              }`}>
                {message.includes('Error') ? (
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                ) : (
                  <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                )}
                <p>{message}</p>
              </div>
            )}

            {/* Tabs */}
            {!isNewCaregiverSetup && (
              <div className="flex gap-4 mb-6 border-b">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`px-4 py-2 font-medium border-b-2 transition ${
                    activeTab === 'profile'
                      ? 'border-teal-600 text-teal-600'
                      : 'border-transparent text-gray-600 hover:text-gray-800'
                  }`}
                >
                  Profile Information
                </button>
                <button
                  onClick={() => setActiveTab('verification')}
                  className={`px-4 py-2 font-medium border-b-2 transition ${
                    activeTab === 'verification'
                      ? 'border-teal-600 text-teal-600'
                      : 'border-transparent text-gray-600 hover:text-gray-800'
                  }`}
                >
                  Verification Documents
                </button>
              </div>
            )}

            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <form onSubmit={handleProfileSubmit} className="bg-white rounded-lg shadow-md p-8">
                {/* Profile Picture Section */}
                <div className="mb-8 pb-8 border-b">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Profile Picture</h3>
                  <div className="flex flex-col sm:flex-row gap-6 items-start">
                    {/* Picture Preview */}
                    <div className="flex-shrink-0">
                      {formData.profilePicturePreview ? (
                        <div className="relative">
                          <img
                            src={formData.profilePicturePreview}
                            alt="Profile preview"
                            className="w-32 h-32 rounded-full object-cover border-4 border-teal-600"
                          />
                          <button
                            type="button"
                            onClick={removeProfilePicture}
                            className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      ) : (
                        <div className="w-32 h-32 rounded-full bg-gray-200 border-4 border-gray-300 flex items-center justify-center">
                          <Camera className="w-12 h-12 text-gray-400" />
                        </div>
                      )}
                    </div>

                    {/* Upload Input */}
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Upload className="w-4 h-4 inline mr-2" />
                        Upload Profile Picture
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleProfilePictureChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg cursor-pointer focus:ring-2 focus:ring-blue-500"
                      />
                      <p className="text-xs text-gray-600 mt-2">
                        Recommended: Square image, max 5MB. Supported formats: JPG, PNG, GIF
                      </p>
                      {formData.profilePicture && (
                        <p className="mt-2 text-sm text-green-600">✓ {formData.profilePicture.name}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Name (Read-only) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <User className="w-4 h-4 inline mr-2" />
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100"
                      disabled
                    />
                  </div>

                  {/* Email (Read-only) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Mail className="w-4 h-4 inline mr-2" />
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100"
                      disabled
                    />
                  </div>

                  {/* Phone Number */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Phone className="w-4 h-4 inline mr-2" />
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="0771234567"
                      pattern="[0-9]{10}"
                      maxLength="10"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">Enter 10 digit phone number (e.g., 0771234567)</p>
                  </div>

                  {/* Location */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <MapPin className="w-4 h-4 inline mr-2" />
                      Location
                    </label>
                    <select
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select Location</option>
                      {locations.map(loc => (
                        <option key={loc} value={loc}>{loc}</option>
                      ))}
                    </select>
                  </div>

                  {/* Hourly Rate */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <DollarSign className="w-4 h-4 inline mr-2" />
                      Hourly Rate (LKR)
                    </label>
                    <input
                      type="number"
                      name="hourlyRate"
                      value={formData.hourlyRate}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  {/* Experience */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Award className="w-4 h-4 inline mr-2" />
                      Years of Experience
                    </label>
                    <input
                      type="number"
                      name="experience"
                      value={formData.experience}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>
                

                {/* Bio */}
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bio / Description
                  </label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    rows="4"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Tell clients about yourself..."
                  />
                </div>

                {/* Certifications */}
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Certifications (comma-separated)
                  </label>
                  <input
                    type="text"
                    name="certifications"
                    value={formData.certifications}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., First Aid, CPR, Nursing Certificate"
                  />
                </div>

                {/* Service Types */}
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Service Types
                  </label>
                  <div className="grid md:grid-cols-2 gap-3">
                    {serviceTypes.map(service => (
                      <label
                        key={service}
                        className="flex items-center gap-3 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50"
                      >
                        <input
                          type="checkbox"
                          checked={formData.serviceTypes.includes(service)}
                          onChange={() => handleServiceTypeToggle(service)}
                          className="w-4 h-4 text-teal-600 rounded focus:ring-2 focus:ring-blue-500"
                        />
                        <span className="text-gray-700">{service}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-8 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition disabled:bg-gray-400 flex items-center justify-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </form>
            )}

            {/* Verification Tab / Step-by-Step Setup */}
            {(activeTab === 'verification' || isNewCaregiverSetup) && (
              <div className="bg-white rounded-lg shadow-md p-8">
                {/* Progress Steps */}
                <div className="mb-8">
                  <div className="flex items-center justify-between">
                    {[1, 2, 3].map(step => (
                      <React.Fragment key={step}>
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition ${
                            step <= currentStep
                              ? 'bg-teal-600 text-white'
                              : 'bg-gray-300 text-gray-700'
                          }`}
                        >
                          {step < currentStep ? <CheckCircle className="w-6 h-6" /> : step}
                        </div>
                        {step < 3 && (
                          <div
                            className={`flex-1 h-1 mx-2 transition ${
                              step < currentStep ? 'bg-teal-600' : 'bg-gray-300'
                            }`}
                          />
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                  <div className="flex justify-between mt-4 text-sm">
                    <span className={currentStep >= 1 ? 'text-teal-600 font-medium' : 'text-gray-600'}>Identity</span>
                    <span className={currentStep >= 2 ? 'text-teal-600 font-medium' : 'text-gray-600'}>NVQ Certification</span>
                    <span className={currentStep >= 3 ? 'text-teal-600 font-medium' : 'text-gray-600'}>Professional Docs</span>
                  </div>
                </div>

                {/* Step 1: Identity Verification */}
                {currentStep === 1 && (
                  <div className="space-y-6">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
                      <FileText className="w-5 h-5 text-blue-600 flex-shrink-0" />
                      <p className="text-sm text-blue-800">Upload your identification document (PDF or DOCX)</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          ID Type
                        </label>
                        <select
                          value={identityData.idType}
                          onChange={(e) => setIdentityData(prev => ({ ...prev, idType: e.target.value }))}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select ID Type</option>
                          {idTypes.map(type => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          ID Number
                        </label>
                        <input
                          type="text"
                          value={identityData.idNumber}
                          onChange={(e) => setIdentityData(prev => ({ ...prev, idNumber: e.target.value }))}
                          placeholder="Enter your ID number"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Upload className="w-4 h-4 inline mr-2" />
                        Upload Document (PDF/DOCX)
                      </label>
                      <input
                        type="file"
                        accept=".pdf,.docx"
                        onChange={handleIdentityFileChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      />
                      {identityData.file && (
                        <p className="mt-2 text-sm text-green-600">✓ {identityData.file.name}</p>
                      )}
                    </div>

                    <button
                      onClick={() => uploadDocument('identity', identityData, identityData.file)}
                      disabled={loading || !identityData.idType || !identityData.idNumber || !identityData.file}
                      className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition font-medium"
                    >
                      {loading ? 'Uploading...' : 'Upload & Continue'}
                    </button>
                  </div>
                )}

                {/* Step 2: NVQ Certification */}
                {currentStep === 2 && (
                  <div className="space-y-6">
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 flex gap-3">
                      <Award className="w-5 h-5 text-purple-600 flex-shrink-0" />
                      <p className="text-sm text-purple-800">Upload your NVQ certification (PDF or DOCX)</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          NVQ Level
                        </label>
                        <select
                          value={nvqData.level}
                          onChange={(e) => setNvqData(prev => ({ ...prev, level: e.target.value }))}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select Level</option>
                          {nvqLevels.map(level => (
                            <option key={level} value={level}>{level}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Subject
                        </label>
                        <input
                          type="text"
                          value={nvqData.subject}
                          onChange={(e) => setNvqData(prev => ({ ...prev, subject: e.target.value }))}
                          placeholder="e.g., Health and Social Care"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Issue Date
                        </label>
                        <input
                          type="date"
                          value={nvqData.issueDate}
                          onChange={(e) => setNvqData(prev => ({ ...prev, issueDate: e.target.value }))}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Expiry Date
                        </label>
                        <input
                          type="date"
                          value={nvqData.expiryDate}
                          onChange={(e) => setNvqData(prev => ({ ...prev, expiryDate: e.target.value }))}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Certificate Number
                        </label>
                        <input
                          type="text"
                          value={nvqData.certificateNumber}
                          onChange={(e) => setNvqData(prev => ({ ...prev, certificateNumber: e.target.value }))}
                          placeholder="Enter certificate number"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Upload className="w-4 h-4 inline mr-2" />
                        Upload Certificate (PDF/DOCX)
                      </label>
                      <input
                        type="file"
                        accept=".pdf,.docx"
                        onChange={handleNvqFileChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      />
                      {nvqData.file && (
                        <p className="mt-2 text-sm text-green-600">✓ {nvqData.file.name}</p>
                      )}
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={prevStep}
                        className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition font-medium"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => uploadDocument('nvq', nvqData, nvqData.file)}
                        disabled={loading || !nvqData.level || !nvqData.subject || !nvqData.issueDate || !nvqData.file}
                        className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 transition font-medium"
                      >
                        {loading ? 'Uploading...' : 'Upload & Continue'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 3: Professional Documents */}
                {currentStep === 3 && (
                  <div className="space-y-6">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex gap-3">
                      <FileText className="w-5 h-5 text-green-600 flex-shrink-0" />
                      <p className="text-sm text-green-800">Upload professional documents (PDF or DOCX)</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Document Type
                        </label>
                        <select
                          value={professionalData.documentType}
                          onChange={(e) => setProfessionalData(prev => ({ ...prev, documentType: e.target.value }))}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select Type</option>
                          {docTypes.map(type => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Title
                        </label>
                        <input
                          type="text"
                          value={professionalData.title}
                          onChange={(e) => setProfessionalData(prev => ({ ...prev, title: e.target.value }))}
                          placeholder="e.g., First Aid Training"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Issuing Organization
                        </label>
                        <input
                          type="text"
                          value={professionalData.issuer}
                          onChange={(e) => setProfessionalData(prev => ({ ...prev, issuer: e.target.value }))}
                          placeholder="e.g., Red Cross"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Issue Date
                        </label>
                        <input
                          type="date"
                          value={professionalData.issueDate}
                          onChange={(e) => setProfessionalData(prev => ({ ...prev, issueDate: e.target.value }))}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Expiry Date (Optional)
                        </label>
                        <input
                          type="date"
                          value={professionalData.expiryDate}
                          onChange={(e) => setProfessionalData(prev => ({ ...prev, expiryDate: e.target.value }))}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                      </label>
                      <textarea
                        value={professionalData.description}
                        onChange={(e) => setProfessionalData(prev => ({ ...prev, description: e.target.value }))}
                        rows="3"
                        placeholder="Add any additional information about this document"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Upload className="w-4 h-4 inline mr-2" />
                        Upload Document (PDF/DOCX)
                      </label>
                      <input
                        type="file"
                        accept=".pdf,.docx"
                        onChange={handleProfessionalFileChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      />
                      {professionalData.file && (
                        <p className="mt-2 text-sm text-green-600">✓ {professionalData.file.name}</p>
                      )}
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={prevStep}
                        className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition font-medium"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => uploadDocument('professional', professionalData, professionalData.file)}
                        disabled={loading || !professionalData.documentType || !professionalData.title || !professionalData.issuer || !professionalData.file}
                        className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition font-medium"
                      >
                        {loading ? 'Uploading...' : 'Upload & Finish'}
                      </button>
                    </div>

                    {isNewCaregiverSetup && (
                      <button
                        onClick={completeSetup}
                        className="w-full mt-4 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition font-medium"
                      >
                        Complete Setup
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

export default UpdateProfile


