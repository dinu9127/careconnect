import React, { useState, useEffect } from 'react'
import { Calendar, Clock, DollarSign, CreditCard, X, CheckCircle, AlertCircle, Star } from 'lucide-react'
import Navbar from '../../components/layout/Navbar'
import Sidebar from '../../components/layout/Sidebar'
import api from '../../services/api'

const Bookings = () => {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: ''
  })
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

  const handlePayment = (booking) => {
    setSelectedBooking(booking)
    setShowPaymentModal(true)
    setCardDetails({
      cardNumber: '',
      cardName: '',
      expiryDate: '',
      cvv: ''
    })
  }

  const handleCardInputChange = (e) => {
    const { name, value } = e.target
    
    let formattedValue = value

    if (name === 'cardNumber') {
      formattedValue = value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim()
      if (formattedValue.replace(/\s/g, '').length > 16) return
    }

    if (name === 'expiryDate') {
      formattedValue = value.replace(/\D/g, '')
      if (formattedValue.length >= 2) {
        formattedValue = formattedValue.slice(0, 2) + '/' + formattedValue.slice(2, 4)
      }
      if (formattedValue.length > 5) return
    }

    if (name === 'cvv') {
      formattedValue = value.replace(/\D/g, '').slice(0, 3)
    }

    setCardDetails(prev => ({
      ...prev,
      [name]: formattedValue
    }))
  }

  const processCardPayment = async () => {
    // Validate card details
    if (!cardDetails.cardNumber || !cardDetails.cardName || !cardDetails.expiryDate || !cardDetails.cvv) {
      setMessage({ type: 'error', text: 'Please fill all card details' })
      return
    }

    // Simulate card payment processing
    setSubmitting(true)
    
    try {
      // In production, integrate with payment gateway (Stripe)
      // Simulating API call delay
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const transactionId = 'TXN-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9).toUpperCase()
      
      const response = await api.put(`/bookings/${selectedBooking._id}/payment`, {
        paymentMethod: 'card',
        paymentStatus: 'paid',
        transactionId: transactionId
      })

      setBookings(prev => prev.map(b => 
        b._id === selectedBooking._id ? response.data.data : b
      ))

      setMessage({ type: 'success', text: 'Payment successful!' })
      setShowPaymentModal(false)
      
      setTimeout(() => setMessage({ type: '', text: '' }), 3000)
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Payment failed. Please try again.'
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleSubmitPayment = async (e) => {
    e.preventDefault()
    await processCardPayment()
  }

  const handleReview = (booking) => {
    setSelectedBooking(booking)
    setShowReviewModal(true)
    setReviewData({
      rating: 0,
      reviewText: ''
    })
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
      case 'in-progress':
        return 'bg-purple-100 text-purple-800'
      case 'completed':
        return 'bg-blue-100 text-blue-800'
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex">
        <Sidebar role="client" />
        <main className="flex-1 p-8">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">My Bookings</h1>
              <p className="text-gray-600">View and manage your caregiver bookings</p>
            </div>

            {message.text && (
              <div className={`mb-6 p-4 rounded-lg ${
                message.type === 'error'
                  ? 'bg-red-100 text-red-800 border border-red-300'
                  : 'bg-blue-100 text-blue-800 border border-blue-300'
              }`}>
                <div className="flex justify-between items-start">
                  <p>{message.text}</p>
                  <button onClick={() => setMessage({ type: '', text: '' })}>
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}

            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-600"></div>
                <p className="mt-4 text-gray-600">Loading bookings...</p>
              </div>
            ) : bookings.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">No Bookings Yet</h3>
                <p className="text-gray-600">You haven't made any bookings yet. Start by finding a caregiver!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {bookings.map((booking) => (
                  <div key={booking._id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <h3 className="text-xl font-semibold text-gray-800">
                            {booking.caregiver?.user?.name || 'Caregiver'}
                          </h3>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
                            {booking.status.toUpperCase()}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPaymentStatusColor(booking.paymentStatus)}`}>
                            {booking.paymentStatus.toUpperCase()}
                          </span>
                        </div>

                        <div className="space-y-2 text-gray-600">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span>
                              {new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            <span>{booking.startTime} - {booking.endTime}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4" />
                            <span className="font-semibold text-teal-600">Rs. {booking.totalAmount}</span>
                            {booking.paymentMethod !== 'none' && (
                              <span className="text-sm">
                                ({booking.paymentMethod.replace('_', ' ').toUpperCase()})
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="mt-3">
                          <p className="text-sm text-gray-600">
                            <span className="font-semibold">Service:</span> {booking.serviceType}
                          </p>
                          {booking.notes && (
                            <p className="text-sm text-gray-600 mt-1">
                              <span className="font-semibold">Notes:</span> {booking.notes}
                            </p>
                          )}
                          {booking.transactionId && (
                            <p className="text-sm text-gray-600 mt-1">
                              <span className="font-semibold">Transaction ID:</span> {booking.transactionId}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        {booking.status === 'completed' && booking.paymentStatus === 'unpaid' && (
                          <button
                            onClick={() => handlePayment(booking)}
                            className="flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-lg font-semibold transition"
                          >
                            <CreditCard className="w-4 h-4" />
                            Continue Payment
                          </button>
                        )}

                        {booking.status === 'completed' && booking.paymentStatus === 'paid' && !booking.hasReview && (
                          <button
                            onClick={() => handleReview(booking)}
                            className="flex items-center justify-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-2 rounded-lg font-semibold transition"
                          >
                            <Star className="w-4 h-4" />
                            Rate & Review
                          </button>
                        )}

                        {booking.hasReview && (
                          <div className="bg-green-50 border border-green-300 rounded-lg p-3 text-sm">
                            <div className="flex items-center gap-2 text-green-800">
                              <Star className="w-4 h-4 fill-green-800" />
                              <span className="font-semibold">Review Submitted</span>
                            </div>
                          </div>
                        )}

                        {booking.paymentStatus === 'pending' && (
                          <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-3 text-sm">
                            <div className="flex items-center gap-2 text-yellow-800">
                              <AlertCircle className="w-4 h-4" />
                              <span className="font-semibold">Payment Pending Verification</span>
                            </div>
                          </div>
                        )}

                        {booking.paymentStatus === 'paid' && (
                          <div className="bg-green-50 border border-green-300 rounded-lg p-3 text-sm">
                            <div className="flex items-center gap-2 text-green-800">
                              <CheckCircle className="w-4 h-4" />
                              <span className="font-semibold">Payment Completed</span>
                            </div>
                            {booking.paymentDate && (
                              <p className="text-xs text-green-700 mt-1">
                                Paid on {new Date(booking.paymentDate).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-96 overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">Payment</h2>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-600 mb-1">Amount to Pay</p>
                <p className="text-3xl font-bold text-teal-600">Rs. {selectedBooking.totalAmount}</p>
              </div>

              <form onSubmit={handleSubmitPayment}>
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Card Number</label>
                    <input
                      type="text"
                      name="cardNumber"
                      value={cardDetails.cardNumber}
                      onChange={handleCardInputChange}
                      placeholder="1234 5678 9012 3456"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Cardholder Name</label>
                    <input
                      type="text"
                      name="cardName"
                      value={cardDetails.cardName}
                      onChange={handleCardInputChange}
                      placeholder="JOHN DOE"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Date</label>
                      <input
                        type="text"
                        name="expiryDate"
                        value={cardDetails.expiryDate}
                        onChange={handleCardInputChange}
                        placeholder="MM/YY"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">CVV</label>
                      <input
                        type="text"
                        name="cvv"
                        value={cardDetails.cvv}
                        onChange={handleCardInputChange}
                        placeholder="123"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-teal-600 hover:bg-teal-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-semibold transition"
                >
                  {submitting ? 'Processing...' : `Pay Rs. ${selectedBooking.totalAmount}`}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white p-6 flex justify-between items-center rounded-t-lg">
              <h2 className="text-2xl font-bold">Rate & Review</h2>
              <button
                onClick={() => setShowReviewModal(false)}
                className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-600 mb-1">Caregiver</p>
                <p className="text-lg font-bold text-gray-800">{selectedBooking.caregiver?.user?.name}</p>
                <p className="text-sm text-gray-600 mt-1">{selectedBooking.serviceType}</p>
              </div>

              <form onSubmit={handleSubmitReview}>
                <div className="space-y-6">
                  {/* Star Rating */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      How was your experience? *
                    </label>
                    <div className="flex gap-2 justify-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => handleRatingClick(star)}
                          className="transition-transform hover:scale-110"
                        >
                          <Star
                            className={`w-10 h-10 ${
                              star <= reviewData.rating
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                    {reviewData.rating > 0 && (
                      <p className="text-center text-sm text-gray-600 mt-2">
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Share your experience (Optional)
                    </label>
                    <textarea
                      value={reviewData.reviewText}
                      onChange={(e) => setReviewData(prev => ({ ...prev, reviewText: e.target.value }))}
                      rows="4"
                      placeholder="Tell us about your experience with this caregiver..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 resize-none"
                    />
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowReviewModal(false)}
                    className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || reviewData.rating === 0}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg font-semibold hover:from-yellow-600 hover:to-orange-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? 'Submitting...' : 'Submit Review'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Bookings

