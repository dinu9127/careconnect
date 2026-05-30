import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, Mail, Save, X, Lock, Loader2, Eye, EyeOff } from 'lucide-react'
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
    email: ''
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
        email: user.email || ''
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
        name: formData.name
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
      email: userData.email || ''
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

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
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
      <div className="h-screen bg-slate-50 overflow-hidden">
        <Navbar isFixed />
        <div className="flex pt-16 h-full">
          <Sidebar role="admin" isFixed />
          <main className="flex-1 p-8 overflow-y-auto md:ml-64 h-[calc(100vh-4rem)]">
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
    <div className="h-screen bg-slate-50 overflow-hidden">
      <Navbar isFixed />
      <div className="flex pt-16 h-full">
        <Sidebar role="admin" isFixed />
        <main className="flex-1 p-6 overflow-y-auto md:ml-64 h-[calc(100vh-4rem)]">
          {/* Header */}
          <div className="mb-6 border-b-2 border-purple-300 pb-3">
            <h1 className="text-4xl font-bold text-slate-900">Admin Profile</h1>
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
            {/* Profile Info - View Mode (Read-only cards) */}
            <div className="p-5">
              <div className="mb-5">
                <h3 className="text-base font-bold text-slate-900">Personal Information</h3>
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

                </div>
              )}
            </div>
          </div>

          {/* Change Password Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-6">Account Settings</h3>

              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <h4 className="text-sm font-semibold text-slate-700">Change Password</h4>

                {passwordMessage.text && (
                  <div className={`rounded-lg px-4 py-3 text-sm ${
                    passwordMessage.type === 'success'
                      ? 'bg-green-50 text-green-700 border border-green-200'
                      : 'bg-red-50 text-red-700 border border-red-200'
                  }`}>
                    {passwordMessage.text}
                  </div>
                )}

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Current Password</label>
                    <div className="relative">
                      <input
                        type={showPasswords.currentPassword ? 'text' : 'password'}
                        name="currentPassword"
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                        className="w-full px-4 py-2 pr-11 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('currentPassword')}
                        className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-500 hover:text-slate-700"
                        aria-label={showPasswords.currentPassword ? 'Hide current password' : 'Show current password'}
                      >
                        {showPasswords.currentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">New Password</label>
                    <div className="relative">
                      <input
                        type={showPasswords.newPassword ? 'text' : 'password'}
                        name="newPassword"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        className="w-full px-4 py-2 pr-11 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('newPassword')}
                        className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-500 hover:text-slate-700"
                        aria-label={showPasswords.newPassword ? 'Hide new password' : 'Show new password'}
                      >
                        {showPasswords.newPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    <p className="mt-2 text-xs text-slate-500 bg-slate-50 p-3 rounded-lg">
                      Must be at least 6 characters with uppercase, lowercase, and a number.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Confirm Password</label>
                    <div className="relative">
                      <input
                        type={showPasswords.confirmPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        className="w-full px-4 py-2 pr-11 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('confirmPassword')}
                        className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-500 hover:text-slate-700"
                        aria-label={showPasswords.confirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                      >
                        {showPasswords.confirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-60"
                >
                  {passwordLoading ? 'Updating...' : 'Update Password'}
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
