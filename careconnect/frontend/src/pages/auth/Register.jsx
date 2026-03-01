import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, Mail, Lock, User, Eye, EyeOff, AlertCircle } from 'lucide-react'
import { authService } from '../../services/api'

const Register = () => {
  const [step, setStep] = useState('role') // 'role' or 'form'
  const [selectedRole, setSelectedRole] = useState(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'client'
  })
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    // Clear error when user types
    if (error) setError('')
  }

  const handleRoleSelect = (role) => {
    setSelectedRole(role)
    setFormData({ ...formData, role })
    setTimeout(() => setStep('form'), 300)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    // Validate password strength - must match backend requirements
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long')
      return
    }

    // Check for uppercase letter
    if (!/[A-Z]/.test(formData.password)) {
      setError('Password must contain at least one uppercase letter')
      return
    }

    // Check for lowercase letter
    if (!/[a-z]/.test(formData.password)) {
      setError('Password must contain at least one lowercase letter')
      return
    }

    // Check for number
    if (!/\d/.test(formData.password)) {
      setError('Password must contain at least one number')
      return
    }

    setLoading(true)

    try {
      const { confirmPassword, ...registrationData } = formData
      const response = await authService.register(registrationData)
      
      if (response.data.success) {
        const { token, role, ...userData } = response.data.data
        
        // Store token and user data
        localStorage.setItem('token', token)
        localStorage.setItem('user', JSON.stringify({ ...userData, role }))
        
        // Navigate based on role
        switch (role) {
          case 'admin':
            navigate('/admin/dashboard')
            break
          case 'caregiver':
            navigate('/caregiver/profile')
            break
          case 'client':
          default:
            navigate('/client/dashboard')
            break
        }
      }
    } catch (err) {
      console.error('Registration error:', err)
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.errors?.map(e => e.message).join(', ') ||
                          'Registration failed. Please try again.'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  // Step 1: Role Selection
  if (step === 'role') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-indigo-50 flex items-center justify-center px-4 py-10 relative overflow-hidden font-display">
        <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-indigo-300/40 blur-3xl" />
        <div className="absolute -bottom-24 -right-20 w-96 h-96 rounded-full bg-cyan-200/40 blur-3xl" />
        <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_1px_1px,rgba(15,23,42,0.06)_1px,transparent_0)] [background-size:24px_24px]" />

        <div className="w-full max-w-5xl relative z-10">
          {/* Header */}
          <div className="text-center mb-12">
            <Link to="/" className="inline-flex items-center gap-3 mb-6">
              <img src="/images/logo/careconnectlogo.png" alt="CareConnect logo" className="h-10 w-auto" />
              <span className="text-2xl font-bold text-slate-900">CareConnect</span>
            </Link>
            <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4 tracking-tight">
              Choose your path
            </h1>
            <p className="text-lg text-slate-600 leading-relaxed">
              Select your role to get started and connect with the right care community.
            </p>
          </div>

          {/* Role Selection Cards */}
          <div className="grid lg:grid-cols-2 gap-8 mb-10">
            {/* I Need Care - Client */}
            <button
              onClick={() => handleRoleSelect('client')}
              className="group relative bg-white rounded-2xl border border-slate-200 shadow-lg p-10 text-left hover:shadow-2xl hover:border-indigo-300 transition-all duration-300 transform hover:-translate-y-2"
            >
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-indigo-50 via-white to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10 flex flex-col gap-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-indigo-600 mb-1">I need care</p>
                    <h2 className="text-2xl font-bold text-slate-900">Find a caregiver</h2>
                  </div>
                  <span className="hidden sm:inline-flex items-center gap-2 text-indigo-600 font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                    Continue <ArrowRight className="w-4 h-4" />
                  </span>
                </div>

                <div className="h-50 rounded-xl bg-gradient-to-r from-indigo-100 to-indigo-50 flex items-center justify-center overflow-hidden">
                  <img src="/images/logo/needcare.png" alt="Need care" className="w-72 h-28 object-contain" />
                </div>

                <p className="text-slate-600 leading-relaxed text-sm">
                  Match with verified caregivers for daily support, recovery, or ongoing care for loved ones.
                </p>

                <div className="inline-flex items-center gap-2 text-indigo-700 font-semibold">
                  Continue as client <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </button>

            {/* I'm a Caregiver */}
            <button
              onClick={() => handleRoleSelect('caregiver')}
              className="group relative bg-white rounded-2xl border border-slate-200 shadow-lg p-10 text-left hover:shadow-2xl hover:border-orange-300 transition-all duration-300 transform hover:-translate-y-2"
            >
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-orange-50 via-white to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10 flex flex-col gap-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-orange-600 mb-1">I am a caregiver</p>
                    <h2 className="text-2xl font-bold text-slate-900">Grow your practice</h2>
                  </div>
                  <span className="hidden sm:inline-flex items-center gap-2 text-orange-600 font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                    Continue <ArrowRight className="w-4 h-4" />
                  </span>
                </div>

                <div className="h-50 rounded-xl bg-gradient-to-r from-orange-100 to-rose-50 flex items-center justify-center overflow-hidden">
                  <img src="/images/logo/iamcaregiver.png" alt="I am a caregiver" className="w-72 h-28 object-contain" />
                </div>

                <p className="text-slate-600 leading-relaxed text-sm">
                  Showcase your skills, connect with families, and build a steady stream of care opportunities.
                </p>

                <div className="inline-flex items-center gap-2 text-orange-700 font-semibold">
                  Continue as caregiver <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </button>
          </div>

          
        </div>
      </div>
    )
  }

  // Step 2: Registration Form with Split Layout
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-5xl">
        <div className="grid lg:grid-cols-2 gap-0 bg-white rounded-2xl shadow-2xl overflow-hidden hover:shadow-3xl transition-shadow duration-300">
          {/* Left Side - Image or Gradient */}
          {selectedRole === 'client' ? (
            // For client role - show register.jpg image
            <div className="hidden lg:block relative overflow-hidden">
              <img 
                src="/images/logo/register.jpg" 
                alt="Healthcare professional" 
                className="absolute inset-0 w-full h-full object-cover"
              />
              {/* Optional overlay for better aesthetics */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
            </div>
          ) : (
            // For caregiver role - show gradient with info
            <div className="hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-orange-500 via-orange-400 to-rose-500 relative overflow-hidden">
              <div className="absolute inset-0 opacity-25">
                <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-orange-900 rounded-full blur-3xl" />
              </div>

              {/* Brand */}
              <div className="relative z-10 mb-6">
                <div className="flex items-center gap-3">
                  <img src="/images/logo/careconnectlogo.png" alt="CareConnect logo" className="h-10 w-auto drop-shadow-lg" />
                  <span className="text-xl font-semibold text-white">CareConnect</span>
                </div>
              </div>

              <div className="relative z-10">
                <div className="text-white mb-8">
                  <h2 className="text-4xl font-bold mb-4 leading-tight">
                    Share Your Expertise
                  </h2>
                  <p className="text-lg opacity-95 leading-relaxed">
                    Connect with families seeking your expertise. Build a thriving caregiving practice.
                  </p>
                </div>
              </div>

              {/* Stats */}
              <div className="relative z-10 grid grid-cols-2 gap-4">
                <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm border border-white/20">
                  <div className="text-2xl font-bold text-white">500+</div>
                  <div className="text-sm text-white/80">Caregivers</div>
                </div>
                <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm border border-white/20">
                  <div className="text-2xl font-bold text-white">2000+</div>
                  <div className="text-sm text-white/80">Users</div>
                </div>
              </div>
            </div>
          )}

          {/* Right Side - Form */}
          <div className="p-8 sm:p-12 bg-white">
            {/* Header */}
            <div className="mb-8">
              {/* Mobile brand */}
              <Link to="/" className="inline-flex items-center gap-3 mb-6 lg:hidden">
                <img src="/images/logo/careconnectlogo.png" alt="CareConnect logo" className="h-9 w-auto" />
                <span className="text-xl font-bold text-slate-900">CareConnect</span>
              </Link>
              <button
                onClick={() => setStep('role')}
                className="text-indigo-600 hover:text-indigo-700 font-semibold text-sm flex items-center gap-2 mb-6 transition-colors"
              >
                ← Change role
              </button>
              <h3 className="text-3xl font-bold text-slate-900 mb-3 tracking-tight">
                Create your account
              </h3>
              <p className="text-slate-600 leading-relaxed">
                {selectedRole === 'client'
                  ? 'Find the perfect caregiver for your needs'
                  : 'Start offering your caregiving services'}
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

              {/* Full Name */}
              {/* Full Name */}
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2.5">
                  Full Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="John Doe"
                    className="w-full px-4 py-3 pl-11 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:shadow-md transition-all placeholder-slate-400 bg-slate-50 hover:bg-white"
                    required
                  />
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2.5">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="name@gmail.com"
                    className="w-full px-4 py-3 pl-11 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:shadow-md transition-all placeholder-slate-400 bg-slate-50 hover:bg-white"
                    required
                  />
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Create a strong password"
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
                <p className="mt-2 text-xs text-slate-500 leading-relaxed">
                  Must be at least 6 characters with uppercase, lowercase, and a number
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

              {/* Terms */}
              <div className="flex items-start gap-3 pt-2">
                <input
                  type="checkbox"
                  id="terms"
                  className="w-5 h-5 rounded-lg border border-slate-300 text-indigo-600 focus:ring-2 focus:ring-indigo-500 cursor-pointer mt-1 accent-indigo-600"
                  required
                />
                <label htmlFor="terms" className="text-sm text-slate-600 cursor-pointer leading-relaxed">
                  I agree to the{' '}
                  <button className="text-indigo-600 hover:text-indigo-700 font-semibold transition-colors">
                    Terms of Service
                  </button>
                  {' '}and{' '}
                  <button className="text-indigo-600 hover:text-indigo-700 font-semibold transition-colors">
                    Privacy Policy
                  </button>
                </label>
              </div>

              {/* Sign Up Button */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-md ${
                  selectedRole === 'client'
                    ? 'bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700'
                    : 'bg-gradient-to-r from-orange-600 to-rose-600 hover:from-orange-700 hover:to-rose-700'
                }`}
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Creating account...
                  </div>
                ) : (
                  'Create Account'
                )}
              </button>

              {/* Sign In Link */}
              <p className="text-center text-slate-600 text-sm mt-8">
                Already have an account?{' '}
                <Link to="/login" className="text-indigo-600 hover:text-indigo-700 font-semibold transition-colors">
                  Sign in
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Register

