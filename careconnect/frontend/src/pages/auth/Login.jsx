import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Heart, Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle } from 'lucide-react'
import { authService } from '../../services/api'

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    // Clear error when user types
    if (error) setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await authService.login(formData)
      
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
      setError(err.response?.data?.message || 'Invalid email or password. Please try again.')
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
            {/* Header */}
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
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center gap-3 py-2">
                <input
                  type="checkbox"
                  id="remember"
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
                className="w-full py-3 px-4 rounded-lg font-semibold text-white bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 transition-all duration-300 transform hover:shadow-lg shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-md disabled:hover:from-indigo-600 disabled:hover:to-blue-600 flex items-center justify-center gap-2"
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

              {/* Divider */}
              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-slate-500">Or continue with</span>
                </div>
              </div>

              {/* Social Login */}
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  className="flex items-center justify-center gap-2 py-2.5 px-4 border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 font-medium text-slate-700 shadow-sm"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  Google
                </button>
                
              </div>

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

