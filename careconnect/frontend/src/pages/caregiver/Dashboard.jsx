import React, { useState, useEffect } from 'react'
import { Users, Calendar, Clock, AlertCircle, Star } from 'lucide-react'
import Navbar from '../../components/layout/Navbar'
import Sidebar from '../../components/layout/Sidebar'
import api from '../../services/api'

const CaregiverDashboard = () => {
  const [bookings, setBookings] = useState([])
  const [caregiverData, setCaregiverData] = useState(null)
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      // Fetch caregiver profile
      const profileResponse = await api.get('/caregivers/me')
      setCaregiverData(profileResponse.data.data)

      // Fetch bookings
      const bookingsResponse = await api.get('/bookings/caregiver-bookings')
      setBookings(bookingsResponse.data.data || [])

      // Fetch reviews
      const reviewsResponse = await api.get('/reviews/me')
      setReviews(reviewsResponse.data.data || [])
    } catch (err) {
      console.error('Error fetching dashboard data:', err)
      setError('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  // Calculate stats
  const getStats = () => {
    const confirmedBookings = bookings.filter(b => b.status === 'confirmed')
    
    // Unique connected clients
    const uniqueClients = [...new Set(confirmedBookings.map(b => b.client?._id))]
    const connectedClients = uniqueClients.length

    // Upcoming shifts (future dates)
    const today = new Date()
    const upcomingShifts = confirmedBookings.filter(b => new Date(b.startDate) > today).length

    // Today's schedule
    const todaySchedule = confirmedBookings.filter(b => {
      const startDate = new Date(b.startDate)
      const endDate = new Date(b.endDate)
      return startDate.toDateString() === today.toDateString() || 
             (startDate < today && endDate >= today)
    })

    // Total earnings (completed bookings)
    const completedBookings = bookings.filter(b => b.status === 'completed' && b.paymentStatus === 'paid')
    const totalEarnings = completedBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0)

    // Recent bookings (all except cancelled)
    const recentBookings = bookings.filter(b => b.status !== 'cancelled')

    return {
      connectedClients,
      upcomingShifts,
      todaySchedule,
      totalEarnings,
      confirmedBookings,
      recentBookings
    }
  }

  const stats = getStats()

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex">
          <Sidebar role="caregiver" />
          <main className="flex-1 p-8">
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600">Loading dashboard...</p>
            </div>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex">
        <Sidebar role="caregiver" />
        <main className="flex-1 p-8">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Caregiver Dashboard</h1>
              <p className="text-gray-600">Welcome back, {caregiverData?.user?.name || 'Caregiver'}!</p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-100 border-t-4 border-t-red-600 border border-red-300 text-red-700 rounded-xl flex items-center gap-2 shadow-md">
                <AlertCircle className="w-5 h-5" />
                {error}
              </div>
            )}

            {/* Stats Cards */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              {/* Connected Clients */}
              <div className="bg-white p-6 rounded-xl shadow-md border-t-4 border-t-blue-600 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Connected Clients</p>
                    <p className="text-3xl font-bold text-blue-600">{stats.connectedClients}</p>
                  </div>
                  <Users className="w-8 h-8 text-blue-400" />
                </div>
              </div>

              {/* Upcoming Shifts */}
              <div className="bg-white p-6 rounded-xl shadow-md border-t-4 border-t-green-600 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Upcoming Shifts</p>
                    <p className="text-3xl font-bold text-green-600">{stats.upcomingShifts}</p>
                  </div>
                  <Calendar className="w-8 h-8 text-green-400" />
                </div>
              </div>

              {/* Rating */}
              <div className="bg-white p-6 rounded-xl shadow-md border-t-4 border-t-yellow-500 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Rating</p>
                    {reviews.length > 0 ? (
                      <>
                        <div className="flex items-center gap-1">
                          <p className="text-3xl font-bold text-yellow-600">{caregiverData?.rating?.toFixed(1) || '0.0'}</p>
                          <span className="text-yellow-400 text-2xl">★</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{reviews.length} review{reviews.length !== 1 ? 's' : ''}</p>
                      </>
                    ) : (
                      <>
                        <p className="text-2xl font-bold text-gray-400">No ratings yet</p>
                        <p className="text-xs text-gray-500 mt-1">Complete services to get reviews</p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Today's Schedule */}
            <div className="bg-white rounded-xl shadow-md p-6 mb-8 border-t-4 border-t-blue-600 hover:shadow-lg transition-all duration-300">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Today's Schedule
              </h2>
              {stats.todaySchedule.length === 0 ? (
                <p className="text-gray-600 py-8 text-center">No shifts scheduled for today</p>
              ) : (
                <div className="space-y-4">
                  {stats.todaySchedule.map(booking => (
                    <div key={booking._id} className="flex items-center justify-between p-4 bg-blue-50 rounded-xl border border-blue-200 hover:shadow-md transition-all duration-300">
                      <div>
                        <p className="font-semibold text-gray-900">{booking.client?.name || 'Client'}</p>
                        <p className="text-sm text-gray-600">
                          <Clock className="w-4 h-4 inline mr-1" />
                          {booking.startTime} - {booking.endTime}
                        </p>
                        <p className="text-sm text-gray-600">{booking.serviceType}</p>
                      </div>
                      <span className="px-3 py-1 rounded-full text-sm font-semibold bg-blue-200 text-blue-900 border border-blue-300">
                        {booking.status.toUpperCase()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Bookings */}
            <div className="bg-white rounded-xl shadow-md p-6 border-t-4 border-t-blue-600 hover:shadow-lg transition-all duration-300">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Recent Bookings
              </h2>
              {stats.recentBookings.length === 0 ? (
                <p className="text-gray-600 py-8 text-center">No bookings yet</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-blue-50 border-b-2 border-blue-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Client</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Dates</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Service Type</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Amount</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.recentBookings.slice(0, 5).map(booking => (
                        <tr key={booking._id} className="border-t border-gray-200 hover:bg-blue-50 transition-colors duration-200">
                          <td className="px-4 py-3 text-sm text-gray-900">{booking.client?.name || 'Client'}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">{booking.serviceType}</td>
                          <td className="px-4 py-3 text-sm font-semibold text-gray-900">Rs. {booking.totalAmount || 0}</td>
                          <td className="px-4 py-3 text-sm">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              booking.status === 'confirmed' ? 'bg-blue-200 text-blue-900 border border-blue-300' :
                              booking.status === 'completed' ? 'bg-green-200 text-green-900 border border-green-300' :
                              'bg-gray-200 text-gray-900 border border-gray-300'
                            }`}>
                              {booking.status.toUpperCase()}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Recent Reviews */}
            <div className="bg-white rounded-xl shadow-md p-6 mt-8 border-t-4 border-t-yellow-500 hover:shadow-lg transition-all duration-300">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500" />
                Recent Reviews
              </h2>
              {reviews.length === 0 ? (
                <p className="text-gray-600 py-8 text-center">No reviews yet</p>
              ) : (
                <div className="space-y-4">
                  {reviews.slice(0, 5).map(review => (
                    <div key={review._id} className="p-4 bg-yellow-50 rounded-xl border border-yellow-200 hover:shadow-md transition-all duration-300">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-gray-900">{review.client?.name || 'Client'}</p>
                          <div className="flex items-center">
                            {[1, 2, 3, 4, 5].map(star => (
                              <Star
                                key={star}
                                className={`w-4 h-4 ${
                                  star <= review.rating
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <span className="text-xs text-gray-500">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      {review.reviewText && (
                        <p className="text-sm text-gray-600 mt-2">{review.reviewText}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default CaregiverDashboard

