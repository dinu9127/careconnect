import React, { useState, useEffect } from 'react'
import { Calendar, Clock, DollarSign, CreditCard, X, CheckCircle, AlertCircle, Star, MapPin } from 'lucide-react'
import Navbar from '../../components/layout/Navbar'
import Sidebar from '../../components/layout/Sidebar'
import api from '../../services/api'

const Bookings = () => {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [showViewReviewsModal, setShowViewReviewsModal] = useState(false)
  const [caregiverReviews, setCaregiverReviews] = useState([])
  const [loadingReviews, setLoadingReviews] = useState(false)
  const [cancellingBookingId, setCancellingBookingId] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [reviewData, setReviewData] = useState({
    rating: 0,
    reviewText: ''
  })

  useEffect(() => {
    fetchBookings()
  }, [])

  const fetchBookings = async () => {
    try {
      setLoading(true)
      const response = await api.get('/bookings/my-bookings')
      setBookings(response.data.data)
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to fetch bookings'
      })
    } finally {
      setLoading(false)
    }
  }

  const handlePayment = async (booking) => {
    try {
      const response = await api.get(`/payhere/checkout/${booking._id}`)
      const form = document.createElement('form')
      form.method = 'POST'
      form.action = response.data.action
      Object.entries(response.data.fields).forEach(([key, value]) => {
        const input = document.createElement('input')
        input.type = 'hidden'
        input.name = key
        input.value = value
        form.appendChild(input)
      })
      document.body.appendChild(form)
      form.submit()
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to initiate payment'
      })
    }
  }

  const handleReview = (booking) => {
    setSelectedBooking(booking)
    setShowReviewModal(true)
    setReviewData({
      rating: 0,
      reviewText: ''
    })
  }

  const canCancelBooking = (booking) => {
    if (!booking || booking.status !== 'pending' || !booking.createdAt) return false
    const bookingAgeMs = Date.now() - new Date(booking.createdAt).getTime()
    return bookingAgeMs <= 5 * 60 * 1000
  }

  const getCancelTimeLeft = (booking) => {
    if (!booking?.createdAt) return ''
    const elapsedMs = Date.now() - new Date(booking.createdAt).getTime()
    const remainingMs = Math.max(0, (5 * 60 * 1000) - elapsedMs)
    const remainingMinutes = Math.ceil(remainingMs / 60000)
    return remainingMinutes > 0 ? `${remainingMinutes} min${remainingMinutes !== 1 ? 's' : ''}` : 'less than a minute'
  }

  const handleCancelBooking = async (booking) => {
    const confirmCancel = window.confirm('Cancel this booking? You can only cancel within 5 minutes of creating it.')
    if (!confirmCancel) return

    setCancellingBookingId(booking._id)
    try {
      await api.delete(`/bookings/${booking._id}`)
      setBookings(prev => prev.map(item => (
        item._id === booking._id
          ? { ...item, status: 'cancelled', cancelledAt: new Date().toISOString(), cancelledBy: 'client' }
          : item
      )))
      setMessage({ type: 'success', text: 'Booking cancelled successfully.' })
      setTimeout(() => setMessage({ type: '', text: '' }), 3000)
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to cancel booking. Please try again.'
      })
    } finally {
      setCancellingBookingId('')
    }
  }

  const handleSubmitReview = async (e) => {
    e.preventDefault()
    
    if (reviewData.rating === 0) {
      setMessage({ type: 'error', text: 'Please select a rating' })
      return
    }

    setSubmitting(true)
    
    try {
      await api.post('/reviews', {
        bookingId: selectedBooking._id,
        rating: reviewData.rating,
        reviewText: reviewData.reviewText
      })

      setMessage({ type: 'success', text: 'Review submitted successfully!' })
      setShowReviewModal(false)
      
      // Mark booking as reviewed
      setBookings(prev => prev.map(b => 
        b._id === selectedBooking._id ? { ...b, hasReview: true } : b
      ))

      setTimeout(() => setMessage({ type: '', text: '' }), 3000)
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to submit review. Please try again.'
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleRatingClick = (rating) => {
    setReviewData(prev => ({ ...prev, rating }))
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'confirmed':
        return 'bg-blue-100 text-blue-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return 'bg-blue-100 text-blue-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'unpaid':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  // Simple phone masker: show first 3 and last 3 digits with middle masked
  const maskPhone = (phone) => {
    if (!phone) return 'N/A'
    const digits = phone.replace(/\D/g, '')
    if (digits.length <= 6) return digits.replace(/.(?=.{3})/g, 'X')
    const start = digits.slice(0, 3)
    const end = digits.slice(-3)
    return `${start} XXX ${end}`
  }

  return (
    <div className="h-screen bg-gradient-to-br from-slate-50 via-slate-50 to-teal-50 overflow-hidden">
      <Navbar isFixed />
      <div className="flex pt-16 h-full">
        <Sidebar role="client" isFixed />
        <main className="flex-1 p-8 overflow-y-auto md:ml-64 h-[calc(100vh-4rem)]">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">My Bookings</h1>
              <p className="text-gray-600">View and manage your caregiver bookings</p>
            </div>

            {message.text && (
              <div className={`mb-6 p-4 rounded-xl border-l-4 ${
                message.type === 'error'
                  ? 'bg-red-50 text-red-800 border-red-300'
                  : 'bg-teal-50 text-teal-800 border-teal-300'
              }`}>
                <div className="flex justify-between items-start">
                  <p className="font-medium">{message.text}</p>
                  <button onClick={() => setMessage({ type: '', text: '' })} className="text-gray-500 hover:text-gray-700">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}

            {loading ? (
              <div className="text-center py-16">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-600"></div>
                <p className="mt-4 text-gray-600 font-medium">Loading bookings...</p>
              </div>
            ) : bookings.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-md p-12 text-center border border-teal-100">
                <Calendar className="w-16 h-16 text-teal-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Bookings Yet</h3>
                <p className="text-gray-600">You haven't made any bookings yet. Start by finding a caregiver!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {bookings.map((booking) => (
                  <div key={booking._id} className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 p-5 border border-teal-100 hover:border-teal-300">
                    <div className="grid gap-4 md:grid-cols-[1fr_220px]">
                      <div>
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <h3 className="text-xl font-bold text-gray-900">
                            {booking.caregiver?.user?.name || 'Caregiver'}
                          </h3>
                          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(booking.status)}`}>
                            {(booking.status || 'pending').toUpperCase()}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getPaymentStatusColor(booking.paymentStatus)}`}>
                            {(booking.paymentStatus || 'pending').toUpperCase()}
                          </span>
                        </div>

                        <div className="grid gap-2 text-gray-600 sm:grid-cols-2">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-teal-600" />
                            <span>
                              {new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-teal-600" />
                            <span>{booking.startTime} - {booking.endTime}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-teal-600" />
                            <span className="font-semibold text-teal-700">Rs. {booking.totalAmount}</span>
                            {booking.paymentMethod && booking.paymentMethod !== 'none' && (
                              <span className="text-sm text-gray-500">
                                ({booking.paymentMethod.replace(/_/g, ' ').toUpperCase()})
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="mt-2">
                          <p className="text-sm text-gray-700">
                            <span className="font-semibold">Service:</span> {booking.serviceType}
                          </p>
                          {booking.notes && (
                            <p className="text-sm text-gray-700 mt-1">
                              <span className="font-semibold">Notes:</span> {booking.notes}
                            </p>
                          )}
                          
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        {canCancelBooking(booking) && booking.status !== 'cancelled' && (
                          <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-sm">
                            <div className="flex items-center justify-between gap-3 flex-wrap">
                              <div className="flex items-center gap-2 text-rose-800 font-medium">
                                <AlertCircle className="w-4 h-4" />
                                <span>Cancel within {getCancelTimeLeft(booking)}</span>
                              </div>
                              <button
                                onClick={() => handleCancelBooking(booking)}
                                disabled={cancellingBookingId === booking._id}
                                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {cancellingBookingId === booking._id ? 'Cancelling...' : 'Cancel Booking'}
                              </button>
                            </div>
                          </div>
                        )}

                        {booking.status === 'completed' && booking.paymentStatus === 'unpaid' && (
                          <button
                            onClick={() => handlePayment(booking)}
                            className="flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-xl font-semibold transition-all duration-300 hover:shadow-lg"
                          >
                            <CreditCard className="w-4 h-4" />
                            Continue Payment
                          </button>
                        )}

                        {booking.status === 'completed' && booking.paymentStatus === 'paid' && !booking.hasReview && (
                          <button
                            onClick={() => handleReview(booking)}
                            className="flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-6 py-2 rounded-xl font-semibold transition-all duration-300 hover:shadow-lg"
                          >
                            <Star className="w-4 h-4" />
                            Rate & Review
                          </button>
                        )}

                        {booking.hasReview && (
                          <button
                            onClick={async () => {
                              const caregiverId = booking.caregiver?._id || booking.caregiver?.user?._id
                              if (!caregiverId) {
                                setMessage({ type: 'error', text: 'Caregiver information not available.' })
                                return
                              }
                              setLoadingReviews(true)
                              try {
                                const res = await api.get(`/reviews/caregiver/${caregiverId}`)
                                setCaregiverReviews(res.data.data || [])
                                setShowViewReviewsModal(true)
                              } catch (err) {
                                setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to load reviews.' })
                              } finally {
                                setLoadingReviews(false)
                              }
                            }}
                            className="flex items-center justify-center gap-2 bg-teal-50 border border-teal-300 rounded-xl p-3 text-sm text-teal-800 font-medium hover:shadow-md transition"
                          >
                            <Star className="w-4 h-4" />
                            <span>{loadingReviews ? 'Loading...' : 'View Reviews'}</span>
                          </button>
                        )}

                        {booking.paymentStatus === 'pending' && (
                          <div className="bg-yellow-50 border border-yellow-300 rounded-xl p-3 text-sm">
                            <div className="flex items-center gap-2 text-yellow-800 font-medium">
                              <AlertCircle className="w-4 h-4" />
                              <span>Payment Pending Verification</span>
                            </div>
                          </div>
                        )}

                        {booking.paymentStatus === 'paid' && (
                          <div className="bg-teal-50 border border-teal-300 rounded-xl p-3 text-sm">
                            <div className="flex items-center gap-2 text-teal-800 font-medium">
                              <CheckCircle className="w-4 h-4" />
                              <span>Payment Completed</span>
                            </div>
                            {booking.paymentDate && (
                              <p className="text-xs text-teal-700 mt-1">
                                Paid on {new Date(booking.paymentDate).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        )}

                        {/* Contact Info - visible after confirmation or once completed */}
                        <div className="bg-white border border-gray-100 rounded-xl p-3 text-sm">
                          {booking.status === 'confirmed' || booking.status === 'completed' ? (
                            <div className="space-y-1">
                              <div className="text-sm text-gray-700 font-semibold">Contact Information</div>
                              <div className="flex items-center gap-2 text-teal-700">
                                <a href={`tel:${booking.caregiver?.user?.phone || ''}`} className="font-medium">{booking.caregiver?.user?.phone || 'N/A'}</a>
                              </div>
                              {booking.caregiver?.location && (
                                <div className="flex items-center gap-2 text-gray-600">
                                  <MapPin className="w-4 h-4 text-teal-600" />
                                  <span>{booking.caregiver.location}</span>
                                </div>
                              )}
                            </div>
                          ) : booking.status === 'pending' ? (
                            <div className="text-sm text-gray-500 italic">Contact details will be available once the booking is accepted.</div>
                          ) : (
                            <div className="text-sm text-gray-500 italic">Contact details are hidden for this booking.</div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Review Modal */}
      {showReviewModal && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-amber-100 overflow-hidden">
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white p-6 flex justify-between items-center">
              <h2 className="text-2xl font-bold">Rate & Review</h2>
              <button
                onClick={() => setShowReviewModal(false)}
                className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              <div className="bg-amber-50 rounded-xl p-4 mb-6 border border-amber-200">
                <p className="text-sm text-gray-600 font-medium mb-1">Caregiver</p>
                <p className="text-lg font-bold text-gray-900">{selectedBooking.caregiver?.user?.name}</p>
                <p className="text-sm text-gray-600 mt-1">{selectedBooking.serviceType}</p>
              </div>

              <form onSubmit={handleSubmitReview}>
                <div className="space-y-6">
                  {/* Star Rating */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      How was your experience? *
                    </label>
                    <div className="flex gap-2 justify-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => handleRatingClick(star)}
                          className="transition-transform hover:scale-110 active:scale-95"
                        >
                          <Star
                            className={`w-10 h-10 ${
                              star <= reviewData.rating
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-gray-300'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                    {reviewData.rating > 0 && (
                      <p className="text-center text-sm text-gray-600 mt-2 font-medium">
                        {reviewData.rating === 1 && 'Poor'}
                        {reviewData.rating === 2 && 'Fair'}
                        {reviewData.rating === 3 && 'Good'}
                        {reviewData.rating === 4 && 'Very Good'}
                        {reviewData.rating === 5 && 'Excellent'}
                      </p>
                    )}
                  </div>

                  {/* Review Text */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Share your experience (Optional)
                    </label>
                    <textarea
                      value={reviewData.reviewText}
                      onChange={(e) => setReviewData(prev => ({ ...prev, reviewText: e.target.value }))}
                      rows="4"
                      placeholder="Tell us about your experience with this caregiver..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition resize-none"
                    />
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowReviewModal(false)}
                    className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || reviewData.rating === 0}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-semibold hover:from-amber-600 hover:to-orange-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? 'Submitting...' : 'Submit Review'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* View Reviews Modal */}
      {showViewReviewsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-teal-100 overflow-hidden">
            <div className="bg-gradient-to-r from-teal-600 to-teal-700 text-white p-6 flex justify-between items-center">
              <h2 className="text-2xl font-bold">Caregiver Reviews</h2>
              <button
                onClick={() => setShowViewReviewsModal(false)}
                className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              {caregiverReviews.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-600">No reviews found for this caregiver.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {caregiverReviews.map((review) => (
                    <div key={review._id} className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-semibold text-gray-900">{review.client?.name || 'Client'}</p>
                          <div className="flex items-center gap-1 mt-1">
                            {[1,2,3,4,5].map((s) => (
                              <Star key={s} className={`w-4 h-4 ${s <= review.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} />
                            ))}
                            <span className="text-xs text-gray-500 ml-2">{new Date(review.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="text-sm text-gray-600">{review.rating}/5</div>
                      </div>
                      {review.reviewText && <p className="text-sm text-gray-700 mt-2">{review.reviewText}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Bookings

