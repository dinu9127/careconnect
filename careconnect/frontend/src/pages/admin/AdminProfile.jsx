import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, Mail, Phone, MapPin, Edit2, Save, X, Lock, Loader2 } from 'lucide-react'
import Navbar from '../../components/layout/Navbar'
import Sidebar from '../../components/layout/Sidebar'
import { userService } from '../../services/api'

const AdminProfile = () => {
  const navigate = useNavigate()
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saveLoading, setSaveLoading] = useState(false)
  const [userData, setUserData] = useState(null)
  const [message, setMessage] = useState({ type: '', text: '' })
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  })

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' })
  const [passwordLoading, setPasswordLoading] = useState(false)

  useEffect(() => {
    // Fetch admin user data from localStorage on mount
    const userStr = localStorage.getItem('user')
    const token = localStorage.getItem('token')

    if (!token) {
      navigate('/login')
      return
    }

    if (userStr) {
      const user = JSON.parse(userStr)
      setUserData(user)
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || ''
      })
    }
    
    setLoading(false)
  }, [navigate])

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSave = async () => {
    try {
      setSaveLoading(true)
      setMessage({ type: '', text: '' })

      // Call API to update profile
      const response = await userService.updateUser(userData._id, {
        name: formData.name,
        phone: formData.phone,
        address: formData.address
      })

      // Update localStorage
      const updatedUser = { ...userData, ...response.data.user }
      localStorage.setItem('user', JSON.stringify(updatedUser))
      setUserData(updatedUser)
      setIsEditing(false)
      setMessage({ type: 'success', text: 'Profile updated successfully!' })

      // Clear message after 3 seconds
      setTimeout(() => setMessage({ type: '', text: '' }), 3000)
    } catch (error) {
      console.error('Error updating profile:', error)
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to update profile'
      })
    } finally {
      setSaveLoading(false)
    }
  }

  const handleCancel = () => {
    setFormData({
      name: userData.name || '',
      email: userData.email || '',
      phone: userData.phone || '',
      address: userData.address || ''
    })
    setIsEditing(false)
    setMessage({ type: '', text: '' })
  }

  const handlePasswordChange = (e) => {
    const { name, value } = e.target
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    setPasswordMessage({ type: '', text: '' })

    // Validation: passwords must match
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'New password and confirmation do not match' })
      return
    }

    // Validation: password requirements
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
      setPasswordMessage({ type: 'success', text: 'Password updated successfully!' })
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })

      // Clear success message after 3 seconds
      setTimeout(() => setPasswordMessage({ type: '', text: '' }), 3000)
    } catch (error) {
      setPasswordMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to update password'
      })
    } finally {
      setPasswordLoading(false)
    }
  }

  // Show loading spinner while fetching data
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="flex">
          <Sidebar role="admin" />
          <main className="flex-1 p-8">
            <div className="flex justify-center items-center h-96">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                <p className="text-slate-600 font-medium">Loading profile...</p>
              </div>
            </div>
          </main>
        </div>
      </div>
    )
  }

  if (!userData) {
    return null
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="flex">
        <Sidebar role="admin" />
        <main className="flex-1 p-6">
          {/* Header */}
          <div className="mb-6 border-b-2 border-purple-300 pb-3">
            <h1 className="text-2xl font-bold text-slate-900">Admin Profile</h1>
            <p className="text-slate-600 text-sm mt-1">Manage your administrator account settings</p>
          </div>

          {/* Success/Error Messages */}
          {message.text && (
            <div className={`mb-6 p-4 rounded-lg border-l-4 text-sm font-semibold ${
              message.type === 'success' 
                ? 'bg-green-50 text-green-800 border-green-500' 
                : 'bg-red-50 text-red-800 border-red-500'
            }`}>
              <p>{message.text}</p>
            </div>
          )}

          <div className="max-w-4xl mx-auto">
            {/* Profile Card */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-6">
            {/* Header Section */}
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-5 py-5">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-sm">
                  <User className="w-7 h-7 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">{userData.name}</h2>
                  <p className="text-purple-100 uppercase text-xs font-bold tracking-wide mt-0.5">Administrator</p>
                </div>
              </div>
            </div>

            {/* Profile Info - View Mode (Read-only cards) */}
            <div className="p-5">
              <div className="flex justify-between items-center mb-5">
                <h3 className="text-base font-bold text-slate-900">Personal Information</h3>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-all duration-200 shadow-sm hover:shadow-md font-semibold text-sm"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit Profile
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={handleSave}
                      disabled={saveLoading}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md font-semibold text-sm"
                    >
                      {saveLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                      Save
                    </button>
                    <button
                      onClick={handleCancel}
                      disabled={saveLoading}
                      className="flex items-center gap-2 px-4 py-2 bg-slate-500 hover:bg-slate-600 text-white rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md font-semibold text-sm"
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </button>
                  </div>
                )}
              </div>

              {!isEditing ? (
                /* View Mode - Display as read-only cards */
                <div className="space-y-3">
                  <div className="bg-white border border-purple-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <User className="w-5 h-5 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-purple-600 font-bold uppercase tracking-wide mb-1">Full Name</p>
                        <p className="text-base text-slate-900 font-semibold">{userData.name || 'Not provided'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border border-purple-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Mail className="w-5 h-5 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-purple-600 font-bold uppercase tracking-wide mb-1">Email Address</p>
                        <p className="text-base text-slate-900 font-semibold">{userData.email}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border border-purple-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Phone className="w-5 h-5 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-purple-600 font-bold uppercase tracking-wide mb-1">Phone Number</p>
                        <p className="text-base text-slate-900 font-semibold">{userData.phone || 'Not provided'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border border-purple-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <MapPin className="w-5 h-5 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-purple-600 font-bold uppercase tracking-wide mb-1">Address</p>
                        <p className="text-base text-slate-900 font-semibold">{userData.address || 'Not provided'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Edit Mode - Editable form */}
                  <div>
                    <label className="block text-xs font-bold text-slate-900 mb-1.5 uppercase tracking-wide">
                      Full Name
                    </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all bg-white text-slate-900 font-medium text-sm"
                      placeholder="Enter your full name"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-900 mb-1.5 uppercase tracking-wide">
                    Email Address
                    <span className="text-xs text-slate-500 ml-2 normal-case font-normal">(Read-only)</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      readOnly
                      className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-600 cursor-not-allowed font-medium text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-900 mb-1.5 uppercase tracking-wide">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all bg-white text-slate-900 font-medium text-sm"
                      placeholder="Enter your phone number"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-900 mb-1.5 uppercase tracking-wide">
                    Address
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      rows="3"
                      className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all resize-none bg-white text-slate-900 font-medium text-sm"
                      placeholder="Enter your address"
                    />
                  </div>
                </div>
                </div>
              )}
            </div>
          </div>

          {/* Change Password Section */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-700 to-purple-800 px-5 py-4">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                  <Lock className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-base font-bold text-white">Change Password</h3>
              </div>
            </div>

            <div className="p-5">
              {/* Password Messages */}
              {passwordMessage.text && (
                <div className={`mb-4 p-3 rounded-lg border-l-4 text-xs font-semibold ${
                  passwordMessage.type === 'success' 
                    ? 'bg-green-50 text-green-800 border-green-500' 
                    : 'bg-red-50 text-red-800 border-red-500'
                }`}>
                  <p>{passwordMessage.text}</p>
                </div>
              )}

              <form onSubmit={handlePasswordSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-900 mb-1.5 uppercase tracking-wide">
                    Current Password
                  </label>
                  <input
                    type="password"
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all bg-white text-slate-900 font-medium text-sm"
                    placeholder="Enter your current password"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-900 mb-1.5 uppercase tracking-wide">
                    New Password
                  </label>
                  <input
                    type="password"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all bg-white text-slate-900 font-medium text-sm"
                    placeholder="Enter new password"
                    required
                  />
                  <p className="mt-2 text-xs text-slate-600 bg-slate-50 p-2 rounded">
                    Must be at least 6 characters with uppercase, lowercase, and a number
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-900 mb-1.5 uppercase tracking-wide">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all bg-white text-slate-900 font-medium text-sm"
                    placeholder="Confirm new password"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="w-full flex items-center justify-center gap-2 px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-bold shadow-sm hover:shadow-md mt-3 text-sm"
                >
                  {passwordLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Updating Password...
                    </>
                  ) : (
                    <>
                      <Lock className="w-5 h-5" />
                      Update Password
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default AdminProfile
