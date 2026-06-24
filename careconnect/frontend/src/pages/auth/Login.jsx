import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Heart, Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle, X } from 'lucide-react'
import { authService } from '../../services/api'

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const rememberedEmail = localStorage.getItem('rememberedEmail')
    if (rememberedEmail) {
      setFormData((prev) => ({ ...prev, email: rememberedEmail }))
      setRememberMe(true)
    }
  }, [])

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })

  }

  //  Auto dismiss
  const showError = (message) => {
    setError(message)
    setTimeout(() => {
      setError('')
    }, 5000)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await authService.login(formData)

      if (response.data.success) {
        const { token, role, ...userData } = response.data.data

        if (rememberMe) {
          localStorage.setItem('rememberedEmail', formData.email)
        } else {
          localStorage.removeItem('rememberedEmail')
        }

        localStorage.setItem('token', token)
        localStorage.setItem('user', JSON.stringify({ ...userData, role }))

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
      console.error('Login error:', err)
      showError(err.response?.data?.message || 'Invalid email or password. Please try again.')
    } finally {
      setLoading(false)
    }
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
                  Welcome back
                </h2>
                <p className="text-lg opacity-95 leading-relaxed">
                  Access your CareConnect account to find and manage care with ease.
                </p>
              </div>
            </div>
          </div>

          {/* Right Side - Form */}
          <div className="p-8 sm:p-12 bg-white">
            <div className="mb-10">
              <Link to="/" className="inline-flex items-center gap-3 mb-8 lg:hidden">
                <img src="/images/logo/careconnectlogo.png" alt="CareConnect logo" className="h-9 w-auto" />
                <span className="text-xl font-bold text-slate-900">CareConnect</span>
              </Link>
              <h3 className="text-3xl font-bold text-slate-900 mb-3 tracking-tight">
                Sign in to your account
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Access your CareConnect dashboard and manage your care
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">

              {/* Error Alert — X button */}
              {error && (
                <div className="flex items-start gap-3 p-4 rounded-xl border-l-4 border-l-red-600 bg-red-50 border border-red-200 text-red-800 shadow-sm relative">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-600" />
                  <div className="flex-1">
                    <p className="font-semibold text-sm mb-1">Error</p>
                    <p className="text-sm">{error}</p>
                  </div>
                  {/* Manual close button */}
                  <button
                    type="button"
                    onClick={() => setError('')}
                    className="text-red-400 hover:text-red-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

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
                    placeholder="you@example.com"
                    className="w-full px-4 py-3 pl-11 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:shadow-md transition-all placeholder-slate-400 bg-slate-50 hover:bg-white"
                    required
                  />
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <label className="block text-sm font-semibold text-slate-900">
                    Password
                  </label>
                  <Link to="/forgot-password" className="text-sm text-indigo-600 hover:text-indigo-700 font-semibold transition-colors">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    className="w-full px-4 py-3 pl-11 pr-11 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:shadow-md transition-all placeholder-slate-400 bg-slate-50 hover:bg-white"
                    required
                  />
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center gap-3 py-2">
                <input
                  type="checkbox"
                  id="remember"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-5 h-5 rounded-lg border border-slate-300 text-indigo-600 focus:ring-2 focus:ring-indigo-500 cursor-pointer accent-indigo-600"
                />
                <label htmlFor="remember" className="text-sm text-slate-600 cursor-pointer hover:text-slate-900 transition-colors">
                  Remember me
                </label>
              </div>

              {/* Sign In Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-lg font-semibold text-white bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 transition-all duration-300 transform hover:shadow-lg shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>

              {/* Sign Up Link */}
              <p className="text-center text-slate-600 text-sm mt-8">
                Don't have an account?{' '}
                <Link to="/register" className="text-indigo-600 hover:text-indigo-700 font-semibold transition-colors">
                  Sign up
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login