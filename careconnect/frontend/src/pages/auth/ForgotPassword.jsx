import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react'
import { authService } from '../../services/api'

const ForgotPassword = () => {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const navigate = useNavigate()

  const handleChange = (e) => {
    setEmail(e.target.value)
    if (error) setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await authService.forgotPassword({ email })
      
      if (response.data.success) {
        setSuccess(true)
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login')
        }, 3000)
      }
    } catch (err) {
      console.error('Forgot password error:', err)
      setError(err.response?.data?.message || 'Failed to send reset email. Please try again.')
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
              Email Sent Successfully
            </h3>
            <p className="text-slate-600 mb-6 leading-relaxed">
              We've sent a password reset link to <strong className="text-slate-900">{email}</strong>. Please check your email and follow the instructions to reset your password.
            </p>
            <p className="text-sm text-slate-500 mb-6">
              If you don't see the email, please check your spam folder.
            </p>
            <div className="text-sm text-slate-600 mb-6 p-3 bg-blue-50 rounded-lg border border-blue-200">
              Redirecting to login in 3 seconds...
            </div>
            <Link 
              to="/login" 
              className="inline-flex items-center justify-center px-6 py-3 rounded-lg font-semibold text-white bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 transition-all duration-300 shadow-md hover:shadow-lg"
            >
              Back to Login
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
                  Reset Your Password
                </h2>
                <p className="text-lg opacity-95 leading-relaxed">
                  Forgot your password? No worries! We'll help you reset it quickly and securely.
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
              <div className="flex items-center gap-2 mb-6">
                <Link 
                  to="/login" 
                  className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-700 font-semibold text-sm transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Login
                </Link>
              </div>
              <h3 className="text-3xl font-bold text-slate-900 mb-3 tracking-tight">
                Forgot Password?
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Enter your email address and we'll send you a link to reset your password.
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
                    value={email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    className="w-full px-4 py-3 pl-11 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:shadow-md transition-all placeholder-slate-400 bg-slate-50 hover:bg-white"
                    required
                  />
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                </div>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  Enter the email address associated with your CareConnect account.
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-6 py-3 px-4 rounded-lg font-semibold text-white bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-md"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Sending Reset Link...
                  </>
                ) : (
                  'Send Reset Link'
                )}
              </button>

              {/* Info Box */}
              <div className="mt-8 p-4 rounded-xl bg-blue-50 border border-blue-300 shadow-sm">
                <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  What happens next?
                </h4>
                <ol className="text-sm text-blue-800 space-y-2 list-decimal list-inside leading-relaxed">
                  <li>We'll send a password reset link to your email</li>
                  <li>Click the link in the email (valid for 30 minutes)</li>
                  <li>Create a new password and save it</li>
                  <li>Log in with your new password</li>
                </ol>
              </div>

              {/* Back to Login Link */}
              <p className="text-center text-slate-600 text-sm mt-8">
                Remember your password?{' '}
                <Link to="/login" className="text-indigo-600 hover:text-indigo-700 font-semibold transition-colors">
                  Sign in here
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword
