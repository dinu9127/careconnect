import React, { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Lock, Eye, EyeOff, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react'
import { authService } from '../../services/api'

const ResetPassword = () => {
  const { token } = useParams()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    if (error) setError('')
  }

  const validatePassword = () => {
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long')
      return false
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return false
    }
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!validatePassword()) return

    setLoading(true)

    try {
      const response = await authService.resetPassword(token, {
        password: formData.password,
        confirmPassword: formData.confirmPassword
      })

      if (response.data.success) {
        setSuccess(true)
        // Store token if provided
        if (response.data.data?.token) {
          localStorage.setItem('token', response.data.data.token)
        }
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login')
        }, 3000)
      }
    } catch (err) {
      console.error('Reset password error:', err)
      setError(err.response?.data?.message || 'Failed to reset password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="p-8 sm:p-12 text-center">
            <div className="flex justify-center mb-6">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-green-100 shadow-lg">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-4 tracking-tight">
              Password Reset Successfully!
            </h3>
            <p className="text-slate-600 mb-6 leading-relaxed">
              Your password has been reset successfully. You can now log in with your new password.
            </p>
            <div className="text-sm text-slate-500 mb-6 p-3 bg-blue-50 rounded-lg border border-blue-200">
              Redirecting to login in 3 seconds...
            </div>
            <Link 
              to="/login" 
              className="inline-flex items-center justify-center px-6 py-3 rounded-lg font-semibold text-white bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 transition-all duration-300 shadow-md hover:shadow-lg"
            >
              Go to Login
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-5xl">
        <div className="grid lg:grid-cols-2 gap-0 bg-white rounded-2xl shadow-2xl overflow-hidden hover:shadow-3xl transition-shadow duration-300">
          {/* Left Side - Image & Gradient */}
          <div className="hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-indigo-600 via-blue-500 to-cyan-500 relative overflow-hidden">
            <div className="absolute inset-0 opacity-30">
              <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-900 rounded-full blur-3xl" />
            </div>

            <div className="relative z-10">
              <div className="text-white mb-8">
                <div className="flex items-center gap-3 mb-6">
                  <img src="/images/logo/careconnectlogo.png" alt="CareConnect logo" className="h-10 w-auto drop-shadow-lg" />
                  <span className="text-2xl font-bold tracking-tight">CareConnect</span>
                </div>
                <h2 className="text-4xl font-bold mb-4 leading-tight">
                  Create New Password
                </h2>
                <p className="text-lg opacity-95 leading-relaxed">
                  Set a strong, secure password for your CareConnect account.
                </p>
              </div>
            </div>
          </div>

          {/* Right Side - Form */}
          <div className="p-8 sm:p-12 bg-white">
            {/* Header */}
            <div className="mb-10">
              <Link to="/" className="inline-flex items-center gap-3 mb-8 lg:hidden">
                <img src="/images/logo/careconnectlogo.png" alt="CareConnect logo" className="h-9 w-auto" />
                <span className="text-xl font-bold text-slate-900">CareConnect</span>
              </Link>
              <h3 className="text-3xl font-bold text-slate-900 mb-3 tracking-tight">
                Reset Your Password
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Enter your new password below. Make sure it's strong and secure.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Error Alert */}
              {error && (
                <div className="flex items-start gap-3 p-4 rounded-xl border-l-4 border-l-red-600 bg-red-50 border border-red-200 text-red-800 shadow-sm">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-600" />
                  <div>
                    <p className="font-semibold text-sm mb-1">Error</p>
                    <p className="text-sm">{error}</p>
                  </div>
                </div>
              )}

              {/* New Password */}
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2.5">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter new password"
                    className="w-full px-4 py-3 pl-11 pr-11 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:shadow-md transition-all placeholder-slate-400 bg-slate-50 hover:bg-white"
                    required
                  />
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  Password must be at least 6 characters long
                </p>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm your password"
                    className="w-full px-4 py-3 pl-11 pr-11 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:shadow-md transition-all placeholder-slate-400 bg-slate-50 hover:bg-white"
                    required
                  />
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Password Strength Indicator */}
              {formData.password && (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 shadow-sm">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs font-semibold text-slate-700 uppercase tracking-wide">Password Requirements</span>
                    <span className={`text-xs font-bold ${formData.password.length >= 6 ? 'text-green-600' : 'text-amber-600'}`}>
                      {formData.password.length >= 6 ? '✓ Strong' : `${6 - formData.password.length} more chars`}
                    </span>
                  </div>
                  <div className="space-y-2 text-xs text-slate-600">
                    <div className={`flex items-center gap-2 font-medium ${formData.password.length >= 6 ? 'text-green-600' : ''}`}>
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      At least 6 characters
                    </div>
                    <div className={`flex items-center gap-2 font-medium ${formData.password === formData.confirmPassword && formData.password ? 'text-green-600' : ''}`}>
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Passwords match
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !formData.password || !formData.confirmPassword}
                className="w-full mt-6 py-3 px-4 rounded-lg font-semibold text-white bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-md"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Resetting Password...
                  </>
                ) : (
                  <>
                    Reset Password
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>

              {/* Back to Login Link */}
              <p className="text-center text-slate-600 text-sm mt-8">
                <Link to="/login" className="text-indigo-600 hover:text-indigo-700 font-semibold transition-colors">
                  Back to Login
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ResetPassword
