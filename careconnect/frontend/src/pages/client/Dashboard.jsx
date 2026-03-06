import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Users, Calendar, AlertCircle, ArrowRight, Clock, MapPin, Star, Loader, DollarSign, AlertTriangle } from 'lucide-react'
import Navbar from '../../components/layout/Navbar'
import Sidebar from '../../components/layout/Sidebar'
import api from '../../services/api'

const ClientDashboard = () => {
  const [allBookings, setAllBookings] = useState([])
  const [recentActivities, setRecentActivities] = useState([])
  const [recentComplaints, setRecentComplaints] = useState([])
  const [recentReviews, setRecentReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [userName, setUserName] = useState('')

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      const parsedUser = JSON.parse(userData)
      setUserName(parsedUser?.name || '')
    }

    fetchRecentActivities()
  }, [])

  const fetchRecentActivities = async () => {
    try {
      setLoading(true)
      setError('')
      
      // Fetch bookings
      const bookingsResponse = await api.get('/bookings/my-bookings')
      if (bookingsResponse.data.success) {
        const bookings = bookingsResponse.data.data || []
        setAllBookings(bookings)

        const sortedBookings = [...bookings].sort((a, b) => {
          const dateA = new Date(a.createdAt || a.startDate || 0).getTime()
          const dateB = new Date(b.createdAt || b.startDate || 0).getTime()
          return dateB - dateA
        })

        setRecentActivities(sortedBookings.slice(0, 2))
      }
      
      // Fetch complaints
      try {
        const complaintsResponse = await api.get('/complaints/my-complaints')
        if (complaintsResponse.data.success) {
          const complaints = (complaintsResponse.data.data || []).slice(0, 2)
          setRecentComplaints(complaints)
        }
      } catch (err) {
        console.log('Complaints not available')
      }
      
      // Fetch reviews
      try {
        const reviewsResponse = await api.get('/reviews/me')
        if (reviewsResponse.data.success) {
          const reviews = (reviewsResponse.data.data || []).slice(0, 2)
          setRecentReviews(reviews)
        }
      } catch (err) {
        console.log('Reviews not available')
      }
    } catch (err) {
      console.error('Error fetching activities:', err)
      setError('Unable to load recent activities')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'completed':
        return 'bg-green-50 border-green-200'
      case 'pending':
        return 'bg-yellow-50 border-yellow-200'
      case 'confirmed':
        return 'bg-blue-50 border-blue-200'
      case 'cancelled':
        return 'bg-red-50 border-red-200'
      default:
        return 'bg-slate-50 border-slate-200'
    }
  }

  const getStatusTextColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'completed':
        return 'text-green-700'
      case 'pending':
        return 'text-yellow-700'
      case 'confirmed':
        return 'text-blue-700'
      case 'cancelled':
        return 'text-red-700'
      default:
        return 'text-slate-700'
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const formatDateRange = (startDate, endDate) => {
    if (!startDate) return ''
    if (!endDate || startDate === endDate) return formatDate(startDate)
    return `${formatDate(startDate)} - ${formatDate(endDate)}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-50 to-teal-50">
      <Navbar />
      <div className="flex">
        <Sidebar role="client" />
        <main className="flex-1 p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              {userName ? `Welcome, ${userName}!` : 'Welcome!'}
            </h1>
            <p className="text-gray-600">Manage your bookings and find professional caregivers</p>
          </div>

          {/* Quick Stats */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {/* Total Bookings */}
            <div className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 p-6 border-t-4 border-teal-600 hover:scale-105">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-semibold mb-1">Total Confirmed Bookings</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {allBookings.filter((booking) => {
                      const status = booking.status?.toLowerCase()
                      return status !== 'rejected' && status !== 'cancelled'
                    }).length}
                  </p>
                </div>
                <Calendar className="w-12 h-12 text-teal-100" />
              </div>
            </div>
                        {/* Completed */}
            <div className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 p-6 border-t-4 border-teal-500 hover:scale-105">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-semibold mb-1">Completed</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {allBookings.filter(b => b.status === 'completed').length}
                  </p>
                </div>
                <Users className="w-12 h-12 text-teal-100" />
              </div>
            </div>

            {/* Have to Pay */}
            <div className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 p-6 border-t-4 border-red-500 hover:scale-105">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-semibold mb-1">Have to Pay</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {allBookings.filter(b => b.paymentStatus === 'unpaid' || b.paymentStatus === 'pending').length}
                  </p>
                </div>
                <DollarSign className="w-12 h-12 text-red-100" />
              </div>
            </div>


          </div>

          {/* Find Caregivers CTA */}
          <div className="bg-gradient-to-r from-teal-600 to-teal-700 rounded-2xl p-8 mb-8 text-white shadow-lg hover:shadow-xl transition-all duration-300">
            <h2 className="text-2xl font-bold mb-3">Find Your Perfect Caregiver</h2>
            <p className="mb-6 opacity-95">Browse through our verified professional caregivers and book the right care for your needs.</p>
            <Link 
              to="/caregivers"
              className="inline-flex items-center gap-2 bg-white text-teal-700 font-semibold px-6 py-3 rounded-xl hover:bg-teal-50 transition-all duration-300 hover:shadow-md"
            >
              Browse Caregivers
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          {/* Recent Activity Section */}
          <div className="bg-white rounded-2xl shadow-md border border-teal-100">
            <div className="p-6 border-b border-teal-100 bg-gradient-to-r from-teal-50 to-teal-50">
              <h2 className="text-2xl font-bold text-gray-900">Recent Activities</h2>
              <p className="text-gray-600 text-sm mt-1">Your latest bookings and activities</p>
            </div>

            <div className="p-6">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader className="w-10 h-10 text-teal-600 animate-spin mb-3" />
                  <p className="text-gray-600">Loading recent activities...</p>
                </div>
              ) : error ? (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <p className="text-sm">{error}</p>
                </div>
              ) : recentActivities.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Calendar className="w-8 h-8 text-teal-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Bookings Yet</h3>
                  <p className="text-gray-600 mb-6">You haven't made any bookings yet. Start by browsing available caregivers.</p>
                  <Link 
                    to="/caregivers"
                    className="inline-flex items-center gap-2 bg-teal-600 text-white font-semibold px-6 py-3 rounded-xl hover:bg-teal-700 hover:shadow-lg transition-all duration-300"
                  >
                    Find Caregivers
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentActivities.map((activity) => (
                    <div 
                      key={activity._id} 
                      className={`p-4 rounded-xl border-l-4 transition-all duration-300 hover:shadow-md ${getStatusColor(activity.status)}`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-gray-900">
                              {activity.caregiver?.user?.name || 'Caregiver'}
                            </h3>
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getStatusTextColor(activity.status)}`}>
                              {activity.status?.charAt(0).toUpperCase() + activity.status?.slice(1) || 'Pending'}
                            </span>
                          </div>
                          
                          <div className="flex flex-col gap-2 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-teal-600" />
                              <span>Booking Date: {formatDateRange(activity.startDate, activity.endDate)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-teal-600" />
                              <span>{activity.startTime && activity.endTime ? `${activity.startTime} - ${activity.endTime}` : `${activity.bookingDuration || activity.hours || 0} hours`}</span>
                            </div>
                            {activity.caregiver?.location && (
                              <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-teal-600" />
                                <span>{activity.caregiver.location}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <p className="text-lg font-bold text-gray-900">Rs. {activity.totalAmount || activity.totalCost || 0}</p>
                          <Link 
                            to="/client/bookings"
                            className="text-teal-600 hover:text-teal-700 text-sm font-medium mt-2 inline-block hover:underline"
                          >
                            View Details →
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {recentActivities.length > 0 && (
                <div className="mt-6 text-center">
                  <Link 
                    to="/client/bookings"
                    className="text-teal-600 hover:text-teal-700 font-semibold hover:underline"
                  >
                    View All Bookings →
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Complaints Section */}
          {recentComplaints.length > 0 && (
            <div className="bg-white rounded-2xl shadow-md border border-red-100 mb-8 overflow-hidden">
              <div className="p-6 border-b border-red-100 bg-gradient-to-r from-red-50 to-pink-50">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                  <h2 className="text-2xl font-bold text-gray-900">Recently Submitted Complaints</h2>
                </div>
                <p className="text-gray-600 text-sm mt-1">Your latest complaints and issues</p>
              </div>

              <div className="p-6">
                <div className="space-y-3">
                  {recentComplaints.map((complaint) => (
                    <div 
                      key={complaint._id} 
                      className="p-4 rounded-xl border border-red-200 bg-red-50 hover:shadow-md transition-all duration-300"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-gray-900">{complaint.subject || 'Complaint'}</h3>
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                              complaint.status === 'resolved' ? 'bg-green-100 text-green-800' :
                              complaint.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-blue-100 text-blue-800'
                            }`}>
                              {complaint.status?.toUpperCase() || 'PENDING'}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700 mb-2">{complaint.description}</p>
                          <p className="text-xs text-gray-600">Submitted on {formatDate(complaint.createdAt)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {recentComplaints.length > 0 && (
                  <div className="mt-6 text-center">
                    <Link 
                      to="/client/complaints"
                      className="text-red-600 hover:text-red-700 font-semibold hover:underline"
                    >
                      View All Complaints →
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Reviews Section */}
          {recentReviews.length > 0 && (
            <div className="bg-white rounded-2xl shadow-md border border-amber-100 overflow-hidden">
              <div className="p-6 border-b border-amber-100 bg-gradient-to-r from-amber-50 to-yellow-50">
                <div className="flex items-center gap-2">
                  <Star className="w-6 h-6 text-amber-500" />
                  <h2 className="text-2xl font-bold text-gray-900">Recently Submitted Reviews</h2>
                </div>
                <p className="text-gray-600 text-sm mt-1">Your latest caregiver reviews and ratings</p>
              </div>

              <div className="p-6">
                <div className="space-y-3">
                  {recentReviews.map((review) => (
                    <div 
                      key={review._id} 
                      className="p-4 rounded-xl border border-amber-200 bg-amber-50 hover:shadow-md transition-all duration-300"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="flex items-center gap-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star 
                                  key={star}
                                  className={`w-4 h-4 ${
                                    star <= review.rating ? 'fill-amber-500 text-amber-500' : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-sm font-semibold text-gray-900">{review.rating}.0</span>
                          </div>
                          {review.reviewText && (
                            <p className="text-sm text-gray-700 mb-2">"{review.reviewText}"</p>
                          )}
                          <p className="text-xs text-gray-600">Reviewed on {formatDate(review.createdAt)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

export default ClientDashboard

