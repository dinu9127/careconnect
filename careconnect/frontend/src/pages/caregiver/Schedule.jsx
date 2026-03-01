import React, { useState, useEffect } from 'react'
import Navbar from '../../components/layout/Navbar'
import Sidebar from '../../components/layout/Sidebar'
import { Calendar, Clock, MapPin, User, DollarSign, AlertCircle, CheckCircle } from 'lucide-react'
import api from '../../services/api'

const Schedule = () => {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [filterStatus, setFilterStatus] = useState('all') // all, upcoming, completed, cancelled
  const [updatingId, setUpdatingId] = useState(null)

  useEffect(() => {
    fetchBookings()
  }, [])

  const fetchBookings = async () => {
    try {
      setLoading(true)
      const response = await api.get('/bookings/caregiver-bookings')
      setBookings(response.data.data || [])
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to fetch bookings'
      })
    } finally {
      setLoading(false)
    }
  }

  const updateBookingStatus = async (booking, newStatus) => {
    if (newStatus === 'cancelled') {
      const confirmCancel = window.confirm('Are you sure you want to cancel this booking?')
      if (!confirmCancel) {
        return
      }
    }

    try {
      setUpdatingId(booking._id)
      const updatePayload = { status: newStatus }

      if (newStatus === 'cancelled' && booking.status === 'confirmed') {
        const reason = window.prompt('Please enter a cancellation reason (required):', '')
        if (!reason || !reason.trim()) {
          setUpdatingId(null)
          return
        }
        updatePayload.cancellationReason = reason.trim()
      }

      const response = await api.put(`/bookings/${booking._id}`, updatePayload)
      setBookings(bookings.map(b => b._id === booking._id ? response.data.data : b))
      setMessage({
        type: 'success',
        text: `Booking ${newStatus} successfully`
      })
      setTimeout(() => setMessage({ type: '', text: '' }), 3000)
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to update booking status'
      })
    } finally {
      setUpdatingId(null)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-300' }
      case 'confirmed':
        return { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-300' }
      case 'completed':
        return { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-300' }
      case 'cancelled':
        return { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-300' }
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-300' }
    }
  }

  const filteredBookings = filterStatus === 'all' 
    ? bookings 
    : bookings.filter(b => b.status === filterStatus)

  const upcomingBookings = bookings.filter(b => 
    new Date(b.startDate) > new Date() && (b.status === 'confirmed' || b.status === 'pending')
  ).length

  const completedBookings = bookings.filter(b => b.status === 'completed').length
  const totalHours = bookings.reduce((sum, b) => {
    const start = new Date(`2000-01-01 ${b.startTime}`)
    const end = new Date(`2000-01-01 ${b.endTime}`)
    const hours = (end - start) / (1000 * 60 * 60)
    return sum + hours
  }, 0)

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex">
        <Sidebar role="caregiver" />
        <main className="flex-1 p-8">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">My Schedule</h1>
              <p className="text-gray-600">View and manage your upcoming bookings</p>
            </div>

            {/* Stats Cards */}
            <div className="grid md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white rounded-xl shadow-md p-6 border-t-4 border-t-blue-600 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total Bookings</p>
                    <p className="text-3xl font-bold text-blue-600">{bookings.length}</p>
                  </div>
                  <Calendar className="w-8 h-8 text-blue-400" />
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-md p-6 border-t-4 border-t-sky-500 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Upcoming</p>
                    <p className="text-3xl font-bold text-sky-600">{upcomingBookings}</p>
                  </div>
                  <Clock className="w-8 h-8 text-sky-400" />
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-md p-6 border-t-4 border-t-green-600 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Completed</p>
                    <p className="text-3xl font-bold text-green-600">{completedBookings}</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-400" />
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-md p-6 border-t-4 border-t-orange-600 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total Hours</p>
                    <p className="text-3xl font-bold text-orange-600">{totalHours.toFixed(1)}</p>
                  </div>
                  <Clock className="w-8 h-8 text-orange-400" />
                </div>
              </div>
            </div>

            {/* Message */}
            {message.text && (
              <div className={`mb-6 p-4 rounded-xl flex items-start gap-3 border-t-4 transition-all duration-300 ${
                message.type === 'error'
                  ? 'bg-red-100 text-red-800 border border-red-300 border-t-red-600'
                  : 'bg-green-100 text-green-800 border border-green-300 border-t-green-600'
              }`}>
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <p>{message.text}</p>
              </div>
            )}

            {/* Filter Tabs */}
            <div className="flex gap-2 mb-6 border-b-2 border-gray-200">
              {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map(status => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-4 py-2 font-medium border-b-2 transition-all duration-300 ${
                    filterStatus === status
                      ? 'border-blue-600 text-blue-600 bg-blue-50'
                      : 'border-transparent text-gray-600 hover:text-gray-800'
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>

            {/* Loading State */}
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
                <p className="mt-4 text-gray-600">Loading schedule...</p>
              </div>
            ) : filteredBookings.length === 0 ? (
              <div className="bg-white rounded-xl shadow-md p-12 text-center border-t-4 border-t-blue-600">
                <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">No Bookings</h3>
                <p className="text-gray-600">
                  {filterStatus === 'all' 
                    ? "You don't have any bookings yet" 
                    : `No ${filterStatus} bookings`}
                </p>
              </div>
            ) : (
              /* Bookings List */
              <div className="space-y-4">
                {filteredBookings.map((booking) => {
                  const statusColor = getStatusColor(booking.status)
                  const startDate = new Date(booking.startDate)
                  const isUpcoming = startDate > new Date() && (booking.status === 'confirmed' || booking.status === 'pending')

                  return (
                    <div key={booking._id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition overflow-hidden border-l-4" 
                         style={{ borderLeftColor: isUpcoming ? '#2dd4bf' : '#9ca3af' }}>
                      <div className="p-6">
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                          {/* Left - Booking Details */}
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-4">
                              <div>
                                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                                  {booking.client?.name || 'Client'}
                                </h3>
                                <p className="text-sm text-gray-600">
                                  <span className="font-semibold">Service Type:</span> {booking.serviceType}
                                </p>
                              </div>
                              <span className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ${statusColor.bg} ${statusColor.text}`}>
                                {booking.status.toUpperCase()}
                              </span>
                            </div>

                            {/* Booking Details Grid */}
                            <div className="grid sm:grid-cols-2 gap-3 text-sm text-gray-600">
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-teal-600" />
                                <span>{startDate.toLocaleDateString()} to {new Date(booking.endDate).toLocaleDateString()}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-teal-600" />
                                <span>{booking.startTime} - {booking.endTime}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <DollarSign className="w-4 h-4 text-teal-600" />
                                <span className="font-semibold text-teal-600">Rs. {booking.totalAmount}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <User className="w-4 h-4 text-teal-600" />
                                <span>{booking.client?.phone || 'N/A'}</span>
                              </div>
                            </div>

                            {/* Notes */}
                            {booking.notes && (
                              <div className="mt-3 p-3 bg-gray-50 rounded border border-gray-200">
                                <p className="text-sm text-gray-700">
                                  <span className="font-semibold">Notes:</span> {booking.notes}
                                </p>
                              </div>
                            )}
                          </div>

                          {/* Right - Status Indicators */}
                          <div className="flex flex-col gap-2 min-w-max">
                            <div className={`px-3 py-2 rounded text-sm font-medium text-center whitespace-nowrap ${
                              booking.paymentStatus === 'paid' 
                                ? 'bg-green-100 text-green-800'
                                : booking.paymentStatus === 'pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {booking.paymentStatus ? booking.paymentStatus.toUpperCase() : 'UNPAID'}
                            </div>
                            
                            {isUpcoming && (
                              <div className="px-3 py-2 rounded text-sm font-medium text-center bg-blue-100 text-blue-800 whitespace-nowrap">
                                <Clock className="w-4 h-4 inline mr-1" />
                                Coming Soon
                              </div>
                            )}

                            {booking.transactionId && (
                              <div className="text-xs text-gray-600 text-center p-2 bg-gray-50 rounded">
                                <span className="font-semibold">TXN:</span> {booking.transactionId.substring(0, 15)}...
                              </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex flex-col gap-2 mt-2 pt-2 border-t border-gray-200">
                              {booking.status === 'pending' && (
                                <button
                                  onClick={() => updateBookingStatus(booking, 'confirmed')}
                                  disabled={updatingId === booking._id}
                                  className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded transition disabled:opacity-50"
                                >
                                  {updatingId === booking._id ? 'Confirming...' : 'Confirm'}
                                </button>
                              )}

                              {booking.status === 'confirmed' && (
                                <button
                                  onClick={() => updateBookingStatus(booking, 'completed')}
                                  disabled={updatingId === booking._id}
                                  className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded transition disabled:opacity-50"
                                >
                                  {updatingId === booking._id ? 'Completing...' : 'Complete'}
                                </button>
                              )}

                              {booking.status !== 'completed' && booking.status !== 'cancelled' && (
                                <button
                                  onClick={() => updateBookingStatus(booking, 'cancelled')}
                                  disabled={updatingId === booking._id}
                                  className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded transition disabled:opacity-50"
                                >
                                  {updatingId === booking._id ? 'Cancelling...' : 'Cancel'}
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

export default Schedule
