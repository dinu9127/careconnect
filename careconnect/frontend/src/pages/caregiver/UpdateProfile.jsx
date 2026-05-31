import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../../components/layout/Navbar'
import Sidebar from '../../components/layout/Sidebar'
import DocumentUploadCard from '../../components/ui/DocumentUploadCard'
import { User, Phone, Mail, DollarSign, Award, Save, FileText, CheckCircle, AlertCircle, Upload, X, Camera, Eye, EyeOff } from 'lucide-react'
import api, { userService } from '../../services/api'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow
})

const caregiverPin = new L.Icon({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})

const LocationPicker = ({ onSelect }) => {
  useMapEvents({
    click: (event) => {
      onSelect(event.latlng)
    }
  })

  return null
}

const UpdateProfile = () => {
  const navigate = useNavigate()
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
    gender: '',
    latitude: '',
    longitude: '',
    bio: '',
    hourlyRate: '',
    experience: '',
    district: '',
    certifications: '',
    serviceTypes: [],
    profilePicture: null,
    profilePicturePreview: ''
  })
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [showPasswords, setShowPasswords] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false
  })
  const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' })
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [pendingBookings, setPendingBookings] = useState(0)
  const [unpaidPayments, setUnpaidPayments] = useState(0)
  const [loadingAccountInfo, setLoadingAccountInfo] = useState(false)

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
  const [locationSearchQuery, setLocationSearchQuery] = useState('')
  const [locationSearchResults, setLocationSearchResults] = useState([])
  const [locationSearchError, setLocationSearchError] = useState('')
  const [locationSearching, setLocationSearching] = useState(false)

  const serviceTypes = [
    'Elderly Care',
    'Childcare',
    'Hospital Companion Care',
    'Disability Support'
  ]

  const districts = [
    'Colombo', 'Gampaha', 'Kalutara',
    'Kandy', 'Matale', 'Nuwara Eliya',
    'Galle', 'Matara', 'Hambantota',
    'Jaffna', 'Kilinochchi', 'Mannar', 'Mullaitivu', 'Vavuniya',
    'Puttalam', 'Kurunegala',
    'Anuradhapura', 'Polonnaruwa',
    'Trincomalee', 'Batticaloa', 'Ampara',
    'Badulla', 'Monaragala',
    'Ratnapura', 'Kegalle'
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

  useEffect(() => {
    if (activeTab === 'settings') {
      fetchAccountInfo()
    }
  }, [activeTab])

  const fetchAccountInfo = async () => {
    try {
      setLoadingAccountInfo(true)
      const bookingsResponse = await api.get('/bookings/my-bookings')
      if (bookingsResponse.data.success) {
        const bookings = bookingsResponse.data.data || []
        const pending = bookings.filter(b => 
          b.status && !['completed', 'cancelled'].includes(b.status.toLowerCase())
        ).length
        setPendingBookings(pending)
      }

      const paymentsResponse = await api.get('/payments/my-payments')
      if (paymentsResponse.data.success) {
        const payments = paymentsResponse.data.data || []
        const unpaid = payments.filter(p => 
          p.status && ['pending', 'unpaid'].includes(p.status.toLowerCase())
        ).length
        setUnpaidPayments(unpaid)
      }
    } catch (err) {
      console.error('Error fetching account info:', err)
    } finally {
      setLoadingAccountInfo(false)
    }
  }

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
      const coords = caregiver.geoLocation?.coordinates
      const longitude = Array.isArray(coords) ? coords[0] : ''
      const latitude = Array.isArray(coords) ? coords[1] : ''
      
      // Store caregiver ID for updates
      setCaregiverId(caregiver._id)

      setFormData({
        name: caregiver.user?.name || '',
        email: caregiver.user?.email || '',
        phone: caregiver.user?.phone || '',
        gender: caregiver.gender || caregiver.user?.gender || '',
        latitude: latitude !== '' ? String(latitude) : '',
        longitude: longitude !== '' ? String(longitude) : '',
        bio: caregiver.bio || '',
        hourlyRate: caregiver.hourlyRate || '',
        experience: caregiver.experience || '',
        district: caregiver.residentDistrict || caregiver.boardingDistrict || caregiver.location || '',
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

  const handleUseCurrentLocation = () => {
    setMessage('')
    if (!navigator.geolocation) {
      setMessage('Geolocation is not supported by your browser')
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        setFormData(prev => ({
          ...prev,
          latitude: latitude.toFixed(6),
          longitude: longitude.toFixed(6)
        }))
      },
      () => {
        setMessage('Unable to fetch your location. Please allow location access.')
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  const handleLocationSearch = async () => {
    const query = locationSearchQuery.trim()
    if (!query) {
      setLocationSearchResults([])
      setLocationSearchError('')
      return
    }

    setLocationSearching(true)
    setLocationSearchError('')

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&countrycodes=lk`
      )
      const data = await response.json()
      const results = Array.isArray(data) ? data : []

      if (results.length === 0) {
        setLocationSearchError('No places found. Try a different search.')
      }

      setLocationSearchResults(results)
    } catch (error) {
      setLocationSearchError('Search failed. Please try again.')
    } finally {
      setLocationSearching(false)
    }
  }

  const handleMapSelect = ({ lat, lng }) => {
    setFormData(prev => ({
      ...prev,
      latitude: lat.toFixed(6),
      longitude: lng.toFixed(6)
    }))
  }

  const handleMarkerDragEnd = (event) => {
    const { lat, lng } = event.target.getLatLng()
    handleMapSelect({ lat, lng })
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
      
      const normalizeSriLankaPhone = (phone) => {
        const digits = phone.replace(/\D/g, '')
        if (digits.startsWith('94') && digits.length === 11) {
          return `0${digits.slice(2)}`
        }
        return digits
      }

      // Validate Sri Lanka phone numbers (0XXXXXXXXX or +94XXXXXXXXX)
      const phoneDigits = normalizeSriLankaPhone(formData.phone)
      if (!/^0\d{9}$/.test(phoneDigits)) {
        setMessage('Phone number must be a valid Sri Lanka number (0XXXXXXXXX or +94XXXXXXXXX)')
        setLoading(false)
        return
      }
      
      const user = JSON.parse(localStorage.getItem('user'))
      
      // Update user data (name and phone)
      await api.put(`/users/${user._id}`, {
        name: formData.name,
        phone: phoneDigits
      })

      // Prepare caregiver data
      const caregiverData = {
        gender: formData.gender,
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

      // Use one district input while keeping backward compatibility with existing schema.
      if (formData.district) {
        caregiverData.location = formData.district
        caregiverData.residentDistrict = formData.district
        caregiverData.boardingDistrict = formData.district
      } else {
        caregiverData.residentDistrict = ''
        caregiverData.boardingDistrict = ''
      }

      const latitude = Number.parseFloat(formData.latitude)
      const longitude = Number.parseFloat(formData.longitude)
      if (Number.isFinite(latitude) && Number.isFinite(longitude)) {
        caregiverData.latitude = latitude
        caregiverData.longitude = longitude
      }

      // If there's a new profile picture, upload it first
      if (formData.profilePicture) {
        const imageData = new FormData()
        imageData.append('file', formData.profilePicture)

        const uploadResponse = await api.post('/caregivers/me/profile-image', imageData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })

        const uploadedUrl = uploadResponse?.data?.data?.url
        if (uploadedUrl) {
          setFormData(prev => ({ ...prev, profilePicturePreview: uploadedUrl }))
        }
      }

      // Update caregiver data without profile picture
      await api.put('/caregivers/me', caregiverData)

      setMessage('Profile updated successfully!')
      setFormData(prev => ({ ...prev, profilePicture: null }))
      
      // Auto-switch to verification documents tab after successful profile update
      setTimeout(() => {
        setActiveTab('verification')
        setMessage('')
      }, 1500)
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

  const handlePasswordChange = (e) => {
    const { name, value } = e.target
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }))
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    setPasswordMessage({ type: '', text: '' })

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'New password and confirmation do not match' })
      return
    }

    const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/
    if (!passwordPattern.test(passwordData.newPassword)) {
      setPasswordMessage({
        type: 'error',
        text: 'Password must be at least 6 characters and include uppercase, lowercase, and a number'
      })
      return
    }

    try {
      setPasswordLoading(true)
      await userService.changePassword(passwordData)
      setPasswordMessage({ type: 'success', text: 'Password updated successfully' })
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (error) {
      setPasswordMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to update password'
      })
    } finally {
      setPasswordLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    try {
      await userService.deleteMe()
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      navigate('/login')
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to delete account'
      alert(errorMessage)
      setShowDeleteModal(false)
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

  // ID Number validation based on ID type
  const validateIdNumber = (idType, idNumber) => {
    const cleanNumber = idNumber.replace(/\D/g, '')
    const numberLength = cleanNumber.length
    const stringLength = idNumber.length

    switch (idType) {
      case 'National Identity Card':
        // Sri Lankan NIC: 9 digits + 1 letter (old format) or 12 digits (new format)
        if (numberLength === 9 || numberLength === 12) {
          return { valid: true, message: '' }
        }
        return { valid: false, message: 'National ID must be 9 digits (old format) or 12 digits (new format)' }
      
      case 'Passport':
        // Passport:  8-10 characters (numbers and letters)
        if (stringLength >= 6 && stringLength <= 12) {
          return { valid: true, message: '' }
        }
        return { valid: false, message: 'Passport number must be 6-12 characters' }
      
      case 'Driving License':
        // Driving License:  8-10 digits
        if (numberLength >= 8 && numberLength <= 10) {
          return { valid: true, message: '' }
        }
        return { valid: false, message: 'Driving License must be 8-10 digits' }
      
      default:
        return { valid: false, message: 'Please select a valid ID type' }
    }
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

    // Validate ID number if it's an identity document
    if (docType === 'identity') {
      if (!data.idType) {
        setMessage('Please select an ID type')
        return
      }
      if (!data.idNumber) {
        setMessage('Please enter an ID number')
        return
      }
      const validation = validateIdNumber(data.idType, data.idNumber)
      if (!validation.valid) {
        setMessage(validation.message)
        return
      }
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

  const parsedLatitude = Number.parseFloat(formData.latitude)
  const parsedLongitude = Number.parseFloat(formData.longitude)
  const hasCoords = Number.isFinite(parsedLatitude) && Number.isFinite(parsedLongitude)
  const mapCenter = hasCoords ? [parsedLatitude, parsedLongitude] : [7.8731, 80.7718]
  const mapZoom = hasCoords ? 13 : 7
  const certificationList = formData.certifications
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)

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
              <div className={`mb-6 p-4 rounded-xl flex items-start gap-3 transition-all duration-300 ${
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
              <div className="flex gap-4 mb-6 border-b-2 border-gray-200">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`px-4 py-2 font-medium border-b-2 transition-all duration-300 ${
                    activeTab === 'profile'
                      ? 'border-blue-600 text-blue-600 bg-blue-50'
                      : 'border-transparent text-gray-600 hover:text-gray-800'
                  }`}
                >
                  Profile Information
                </button>
                <button
                  onClick={() => setActiveTab('verification')}
                  className={`px-4 py-2 font-medium border-b-2 transition-all duration-300 ${
                    activeTab === 'verification'
                      ? 'border-blue-600 text-blue-600 bg-blue-50'
                      : 'border-transparent text-gray-600 hover:text-gray-800'
                  }`}
                >
                  Verification Documents
                </button>
                <button
                  onClick={() => setActiveTab('settings')}
                  className={`px-4 py-2 font-medium border-b-2 transition-all duration-300 ${
                    activeTab === 'settings'
                      ? 'border-blue-600 text-blue-600 bg-blue-50'
                      : 'border-transparent text-gray-600 hover:text-gray-800'
                  }`}
                >
                  Account Settings
                </button>
              </div>
            )}

            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <form onSubmit={handleProfileSubmit} className="bg-white rounded-xl shadow-md p-8">
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
                            className="w-32 h-32 rounded-full object-cover border-4 border-blue-600 shadow-md"
                          />
                          <button
                            type="button"
                            onClick={removeProfilePicture}
                            className="absolute top-0 right-0 bg-red-600 text-white rounded-full p-1 hover:bg-red-700 transition-all duration-300 shadow-md hover:shadow-lg"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      ) : (
                        <div className="w-32 h-32 rounded-full bg-gray-200 border-4 border-blue-300 flex items-center justify-center shadow-md">
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
                      pattern="^(?:0\d{9}|\+?94\d{9})$"
                      maxLength="10"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">Use 0XXXXXXXXX or +94XXXXXXXXX (e.g., 0771234567)</p>
                  </div>

                  {/* Gender */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <User className="w-4 h-4 inline mr-2" />
                      Gender
                    </label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                      required
                    >
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                                  
                {/* District */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">District</label>
                  <select
                    name="district"
                    value={formData.district}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  >
                    <option value="">Select district (optional)</option>
                    {districts.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>


                  <div className="md:col-span-2">
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Choose Your Location on Map
                      </label>
                      <button
                        type="button"
                        onClick={handleUseCurrentLocation}
                        className="text-sm text-blue-700 hover:text-blue-900 font-medium"
                      >
                        Use Current Location
                      </button>
                    </div>
                    <div className="flex flex-col md:flex-row gap-3 mb-3">
                      <input
                        type="text"
                        value={locationSearchQuery}
                        onChange={(e) => setLocationSearchQuery(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            handleLocationSearch()
                          }
                        }}
                        placeholder="Search a place or landmark"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                      />
                      <button
                        type="button"
                        onClick={handleLocationSearch}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                      >
                        {locationSearching ? 'Searching...' : 'Search on Map'}
                      </button>
                    </div>
                    {locationSearchError && (
                      <p className="text-sm text-red-600 mb-2">{locationSearchError}</p>
                    )}
                    {locationSearchResults.length > 0 && (
                      <div className="mb-3 grid gap-2">
                        {locationSearchResults.map((result) => (
                          <button
                            key={`${result.place_id}`}
                            type="button"
                            onClick={() => {
                              const lat = Number.parseFloat(result.lat)
                              const lng = Number.parseFloat(result.lon)
                              if (Number.isFinite(lat) && Number.isFinite(lng)) {
                                handleMapSelect({ lat, lng })
                              }
                              setLocationSearchResults([])
                            }}
                            className="text-left px-3 py-2 border border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition"
                          >
                            <span className="text-sm text-gray-800">{result.display_name}</span>
                          </button>
                        ))}
                      </div>
                    )}
                    <div className="h-[320px] w-full rounded-xl overflow-hidden border border-gray-200">
                      <MapContainer
                        key={`${parsedLatitude || 'na'}-${parsedLongitude || 'na'}`}
                        center={mapCenter}
                        zoom={mapZoom}
                        scrollWheelZoom
                        className="h-full w-full"
                      >
                        <TileLayer
                          attribution="&copy; OpenStreetMap contributors"
                          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <LocationPicker onSelect={handleMapSelect} />
                        {hasCoords && (
                          <Marker
                            position={[parsedLatitude, parsedLongitude]}
                            icon={caregiverPin}
                            draggable
                            eventHandlers={{ dragend: handleMarkerDragEnd }}
                          />
                        )}
                      </MapContainer>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Search, click the map, or drag the pin to set your location for nearby searches.</p>
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
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
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
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
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
                        className="flex items-center gap-3 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-blue-50 transition-colors duration-200"
                      >
                        <input
                          type="checkbox"
                          checked={formData.serviceTypes.includes(service)}
                          onChange={() => handleServiceTypeToggle(service)}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-600"
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
                  className="w-full mt-8 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-all duration-300 shadow-md hover:shadow-lg disabled:bg-gray-400 disabled:shadow-none flex items-center justify-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </form>
            )}

            {/* Verification Tab / Step-by-Step Setup */}
            {(activeTab === 'verification' || isNewCaregiverSetup) && (
              <div>
                <div className="mb-4">
                  <h2 className="text-2xl font-semibold text-gray-900">Verification Documents</h2>
                  <p className="text-sm text-gray-600">Upload verification documents (max 5MB).</p>
                </div>
                <div className="bg-white rounded-xl shadow-md p-8">
                <div className="mb-8">
                  <DocumentUploadCard certifications={certificationList} />
                </div>

                {/* Step 2: NVQ Certification */}
                {currentStep === 2 && (
                  <div className="space-y-6">
                    <div className="bg-sky-50 border border-sky-200 rounded-lg p-4 flex gap-3">
                      <Award className="w-5 h-5 text-sky-600 flex-shrink-0" />
                      <p className="text-sm text-sky-800">Upload your NVQ certification (PDF or DOCX)</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          NVQ Level
                        </label>
                        <select
                          value={nvqData.level}
                          onChange={(e) => setNvqData(prev => ({ ...prev, level: e.target.value }))}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
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
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
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
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
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
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
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
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
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
                        className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-all duration-300 shadow-md hover:shadow-lg font-medium"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => uploadDocument('nvq', nvqData, nvqData.file)}
                        disabled={loading || !nvqData.level || !nvqData.subject || !nvqData.issueDate || !nvqData.file}
                        className="flex-1 px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 disabled:bg-gray-400 transition-all duration-300 shadow-md hover:shadow-lg font-medium"
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
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
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
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
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
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
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
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
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
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
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
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
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
                        className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-all duration-300 shadow-md hover:shadow-lg font-medium"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => uploadDocument('professional', professionalData, professionalData.file)}
                        disabled={loading || !professionalData.documentType || !professionalData.title || !professionalData.issuer || !professionalData.file}
                        className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-all duration-300 shadow-md hover:shadow-lg font-medium"
                      >
                        {loading ? 'Uploading...' : 'Upload & Finish'}
                      </button>
                    </div>

                    {isNewCaregiverSetup && (
                      <button
                        onClick={completeSetup}
                        className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300 shadow-md hover:shadow-lg font-medium"
                      >
                        Complete Setup
                      </button>
                    )}
                  </div>
                )}
                </div>
              </div>
            )}

            {/* Account Settings Tab */}
            {activeTab === 'settings' && (
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-6">Account Settings</h3>
                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                  <h4 className="text-sm font-semibold text-gray-700">Change Password</h4>

                  {passwordMessage.text && (
                    <div className={`rounded-lg px-4 py-3 text-sm transition-all duration-300 ${
                      passwordMessage.type === 'error'
                        ? 'bg-red-100 text-red-700 border border-red-300'
                        : 'bg-green-100 text-green-700 border border-green-300'
                    }`}>
                      {passwordMessage.text}
                    </div>
                  )}

                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                      <div className="relative">
                        <input
                          type={showPasswords.currentPassword ? 'text' : 'password'}
                          name="currentPassword"
                          value={passwordData.currentPassword}
                          onChange={handlePasswordChange}
                          className="w-full px-4 py-2 pr-11 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility('currentPassword')}
                          className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-gray-700"
                          aria-label={showPasswords.currentPassword ? 'Hide current password' : 'Show current password'}
                        >
                          {showPasswords.currentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                      <div className="relative">
                        <input
                          type={showPasswords.newPassword ? 'text' : 'password'}
                          name="newPassword"
                          value={passwordData.newPassword}
                          onChange={handlePasswordChange}
                          className="w-full px-4 py-2 pr-11 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility('newPassword')}
                          className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-gray-700"
                          aria-label={showPasswords.newPassword ? 'Hide new password' : 'Show new password'}
                        >
                          {showPasswords.newPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                      <div className="relative">
                        <input
                          type={showPasswords.confirmPassword ? 'text' : 'password'}
                          name="confirmPassword"
                          value={passwordData.confirmPassword}
                          onChange={handlePasswordChange}
                          className="w-full px-4 py-2 pr-11 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility('confirmPassword')}
                          className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-gray-700"
                          aria-label={showPasswords.confirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                        >
                          {showPasswords.confirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-gray-500">
                    Password must be at least 6 characters and include uppercase, lowercase, and a number.
                  </p>

                  <button
                    type="submit"
                    disabled={passwordLoading}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-60 disabled:shadow-none font-medium"
                  >
                    {passwordLoading ? 'Updating...' : 'Update Password'}
                  </button>
                </form>
              </div>

            )}
          </div>
        </main>
      </div>

    </div>
  )
}

export default UpdateProfile


