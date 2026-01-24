import React, { useState, useEffect } from 'react'
import { Calendar, Clock, DollarSign, CreditCard, Upload, X, CheckCircle, AlertCircle } from 'lucide-react'
import Navbar from '../../components/layout/Navbar'
import Sidebar from '../../components/layout/Sidebar'
import api from '../../services/api'

const Bookings = () => {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('card')
  const [bankSlipFile, setBankSlipFile] = useState(null)
  const [bankSlipPreview, setBankSlipPreview] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: ''
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
    setPaymentMethod('card')
    setBankSlipFile(null)
    setBankSlipPreview('')
    setCardDetails({
      cardNumber: '',
      cardName: '',
      expiryDate: '',
      cvv: ''
    })
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setBankSlipFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setBankSlipPreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
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
      // In production, integrate with payment gateway (Stripe, PayPal, etc.)
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

  const processBankSlipPayment = async () => {
    if (!bankSlipFile) {
      setMessage({ type: 'error', text: 'Please upload bank slip' })
      return
    }

    setSubmitting(true)

    try {
      // In production, upload to cloud storage (AWS S3, Cloudinary, etc.)
      // For now, using base64 preview
      const response = await api.put(`/bookings/${selectedBooking._id}/payment`, {
        paymentMethod: 'bank_slip',
        paymentStatus: 'pending',
        bankSlipUrl: bankSlipPreview
      })

      setBookings(prev => prev.map(b => 
        b._id === selectedBooking._id ? response.data.data : b
      ))

      setMessage({ type: 'success', text: 'Bank slip uploaded! Payment pending verification.' })
      setShowPaymentModal(false)
      
      setTimeout(() => setMessage({ type: '', text: '' }), 3000)
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to upload bank slip'
      })
    } finally {
      setSubmitting(false)
    }
  }

  const processCashPayment = async () => {
    setSubmitting(true)

    try {
      const response = await api.put(`/bookings/${selectedBooking._id}/payment`, {
        paymentMethod: 'cash',
        paymentStatus: 'paid'
      })

      setBookings(prev => prev.map(b => 
        b._id === selectedBooking._id ? response.data.data : b
      ))

      setMessage({ type: 'success', text: 'Cash payment recorded!' })
      setShowPaymentModal(false)
      
      setTimeout(() => setMessage({ type: '', text: '' }), 3000)
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to record payment'
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleSubmitPayment = async (e) => {
    e.preventDefault()

    if (paymentMethod === 'card') {
      await processCardPayment()
    } else if (paymentMethod === 'bank_slip') {
      await processBankSlipPayment()
    } else if (paymentMethod === 'cash') {
      await processCashPayment()
    }
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
        return 'bg-green-100 text-green-800'
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
                  : 'bg-green-100 text-green-800 border border-green-300'
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
                            <span className="font-semibold text-teal-600">${booking.totalAmount}</span>
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
                            Pay Now
                          </button>
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
                <p className="text-3xl font-bold text-teal-600">${selectedBooking.totalAmount}</p>
              </div>

              <form onSubmit={handleSubmitPayment}>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Select Payment Method
                  </label>
                  <div className="space-y-2">
                    <label className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition ${
                      paymentMethod === 'card' ? 'border-teal-600 bg-teal-50' : 'border-gray-200 hover:border-gray-300'
                    }`}>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="card"
                        checked={paymentMethod === 'card'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="text-teal-600"
                      />
                      <CreditCard className="w-5 h-5" />
                      <span className="font-medium">Credit/Debit Card</span>
                    </label>

                    <label className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition ${
                      paymentMethod === 'bank_slip' ? 'border-teal-600 bg-teal-50' : 'border-gray-200 hover:border-gray-300'
                    }`}>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="bank_slip"
                        checked={paymentMethod === 'bank_slip'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="text-teal-600"
                      />
                      <Upload className="w-5 h-5" />
                      <span className="font-medium">Bank Slip Upload</span>
                    </label>

                    <label className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition ${
                      paymentMethod === 'cash' ? 'border-teal-600 bg-teal-50' : 'border-gray-200 hover:border-gray-300'
                    }`}>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="cash"
                        checked={paymentMethod === 'cash'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="text-teal-600"
                      />
                      <DollarSign className="w-5 h-5" />
                      <span className="font-medium">Cash Payment</span>
                    </label>
                  </div>
                </div>

                {paymentMethod === 'card' && (
                  <div className="space-y-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Card Number</label>
                      <input
                        type="text"
                        name="cardNumber"
                        value={cardDetails.cardNumber}
                        onChange={handleCardInputChange}
                        placeholder="1234 5678 9012 3456"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
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
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
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
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
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
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {paymentMethod === 'bank_slip' && (
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Upload Bank Slip</label>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={handleFileChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                    {bankSlipPreview && (
                      <div className="mt-3">
                        <img src={bankSlipPreview} alt="Bank slip preview" className="max-w-full h-auto rounded-lg border" />
                      </div>
                    )}
                  </div>
                )}

                {paymentMethod === 'cash' && (
                  <div className="mb-6 bg-blue-50 border border-blue-300 rounded-lg p-4">
                    <p className="text-sm text-blue-800">
                      By selecting cash payment, you confirm that you have paid or will pay the caregiver in cash. 
                      Please ensure the caregiver acknowledges receipt of payment.
                    </p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-teal-600 hover:bg-teal-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-semibold transition"
                >
                  {submitting ? 'Processing...' : `Pay $${selectedBooking.totalAmount}`}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Bookings
