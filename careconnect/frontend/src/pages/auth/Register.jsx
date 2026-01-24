import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Heart, Stethoscope, ArrowRight, Mail, Lock, User, Eye, EyeOff, AlertCircle } from 'lucide-react'
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

    // Validate password strength
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long')
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
        localStorage.setItem('user', JSON.stringify(userData))
        
        // Navigate based on role
        switch (role) {
          case 'admin':
            navigate('/admin/dashboard')
            break
          case 'caregiver':
            navigate('/caregiver/dashboard')
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
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-sky-100 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-2xl">
          {/* Header */}
          <div className="text-center mb-12">
            <Link to="/" className="inline-flex items-center gap-3 mb-6">
              <img src="/images/logo/careconnectlogo.png" alt="CareConnect logo" className="h-10 w-auto" />
              <span className="text-2xl font-bold text-slate-900">CareConnect</span>
            </Link>
            <h1 className="text-4xl font-bold text-slate-900 mb-3">
              Join CareConnect
            </h1>
            <p className="text-lg text-slate-600">
              Choose your role to get started
            </p>
          </div>

          {/* Role Selection Cards */}
          <div className="grid sm:grid-cols-2 gap-6 mb-8">
            {/* I Need Care - Client */}
            <button
              onClick={() => handleRoleSelect('client')}
              className="group relative bg-white rounded-2xl shadow-sm border-2 border-slate-100 p-8 text-left hover:shadow-xl hover:border-indigo-300 transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-transparent opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity" />
              <div className="relative z-10">
                <div className="w-14 h-14 bg-indigo-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-indigo-200 transition">
                  <Heart className="w-8 h-8 text-indigo-600" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">
                  I Need Care
                </h3>
                <p className="text-slate-600 text-sm mb-4 leading-relaxed">
                  Find trusted caregivers for yourself or a family member. Get matched with qualified professionals.
                </p>
                <div className="inline-flex items-center gap-2 text-indigo-600 font-semibold">
                  Get started <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </button>

            {/* I'm a Caregiver */}
            <button
              onClick={() => handleRoleSelect('caregiver')}
              className="group relative bg-white rounded-2xl shadow-sm border-2 border-slate-100 p-8 text-left hover:shadow-xl hover:border-orange-300 transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-orange-50 to-transparent opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity" />
              <div className="relative z-10">
                <div className="w-14 h-14 bg-orange-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-orange-200 transition">
                  <Stethoscope className="w-8 h-8 text-orange-600" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">
                  I'm a Caregiver
                </h3>
                <p className="text-slate-600 text-sm mb-4 leading-relaxed">
                  Offer your services and connect with families in need. Build your client base and grow your career.
                </p>
                <div className="inline-flex items-center gap-2 text-orange-600 font-semibold">
                  Get started <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </button>
          </div>

          {/* Sign In Link */}
          <p className="text-center text-slate-600">
            Already have an account?{' '}
            <Link to="/login" className="text-teal-600 hover:text-teal-700 font-semibold">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    )
  }

  // Step 2: Registration Form with Split Layout
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-5xl">
        <div className="grid lg:grid-cols-2 gap-0 bg-white rounded-3xl shadow-2xl overflow-hidden">
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
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </div>
          ) : (
            // For caregiver role - show gradient with info
            <div className="hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-orange-500 via-orange-400 to-rose-500 relative overflow-hidden">
              <div className="absolute inset-0 opacity-20">
                <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-black rounded-full blur-3xl" />
              </div>

              {/* Brand */}
              <div className="relative z-10 mb-6">
                <div className="flex items-center gap-3">
                  <img src="/images/logo/careconnectlogo.png" alt="CareConnect logo" className="h-10 w-auto drop-shadow" />
                  <span className="text-xl font-semibold text-white">CareConnect</span>
                </div>
              </div>

              <div className="relative z-10">
                <div className="text-white mb-8">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 bg-white/20">
                    <Stethoscope className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold mb-4">
                    Share Your Expertise
                  </h2>
                  <p className="text-lg opacity-90 leading-relaxed">
                    Connect with families seeking your expertise. Build a thriving caregiving practice.
                  </p>
                </div>
              </div>

              {/* Stats */}
              <div className="relative z-10 grid grid-cols-2 gap-4">
                <div className="bg-white/10 rounded-xl p-4 backdrop-blur">
                  <div className="text-2xl font-bold text-white">500+</div>
                  <div className="text-sm text-white/80">Caregivers</div>
                </div>
                <div className="bg-white/10 rounded-xl p-4 backdrop-blur">
                  <div className="text-2xl font-bold text-white">2000+</div>
                  <div className="text-sm text-white/80">Users</div>
                </div>
              </div>
            </div>
          )}

          {/* Right Side - Form */}
          <div className="p-8 sm:p-12">
            {/* Header */}
            <div className="mb-8">
              {/* Mobile brand */}
              <Link to="/" className="inline-flex items-center gap-3 mb-6 lg:hidden">
                <img src="/images/logo/careconnectlogo.png" alt="CareConnect logo" className="h-9 w-auto" />
                <span className="text-xl font-bold text-slate-900">CareConnect</span>
              </Link>
              <button
                onClick={() => setStep('role')}
                className="text-indigo-600 hover:text-indigo-700 font-semibold text-sm flex items-center gap-2 mb-6"
              >
                ← Change role
              </button>
              <h3 className="text-3xl font-bold text-slate-900 mb-2">
                Create your account
              </h3>
              <p className="text-slate-600">
                {selectedRole === 'client'
                  ? 'Find the perfect caregiver for your needs'
                  : 'Start offering your caregiving services'}
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Error Alert */}
              {error && (
                <div className="flex items-start gap-3 p-4 rounded-lg border bg-red-50 border-red-200 text-red-800">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <p className="text-sm font-medium">{error}</p>
                </div>
              )}

              {/* Full Name */}
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="John Doe"
                    className="w-full px-4 py-3 pl-11 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition placeholder-slate-400"
                    required
                  />
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    className="w-full px-4 py-3 pl-11 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition placeholder-slate-400"
                    required
                  />
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Create a strong password"
                    className="w-full px-4 py-3 pl-11 pr-11 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition placeholder-slate-400"
                    required
                  />
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm your password"
                    className="w-full px-4 py-3 pl-11 pr-11 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition placeholder-slate-400"
                    required
                  />
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
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
                  className="w-5 h-5 rounded-lg border border-slate-300 text-indigo-600 focus:ring-2 focus:ring-indigo-500 cursor-pointer mt-1"
                  required
                />
                <label htmlFor="terms" className="text-sm text-slate-600 cursor-pointer">
                  I agree to the{' '}
                  <button className="text-indigo-600 hover:text-indigo-700 font-semibold">
                    Terms of Service
                  </button>
                  {' '}and{' '}
                  <button className="text-indigo-600 hover:text-indigo-700 font-semibold">
                    Privacy Policy
                  </button>
                </label>
              </div>

              {/* Sign Up Button */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 px-4 rounded-xl font-semibold text-white transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${
                  selectedRole === 'client'
                    ? 'bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700'
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
              <p className="text-center text-slate-600">
                Already have an account?{' '}
                <Link to="/login" className="text-indigo-600 hover:text-indigo-700 font-semibold">
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
