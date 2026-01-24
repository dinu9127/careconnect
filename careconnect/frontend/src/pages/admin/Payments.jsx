import React, { useState, useEffect } from 'react'
import { DollarSign, CheckCircle, Clock, X, Eye, CreditCard, FileText } from 'lucide-react'
import Navbar from '../../components/layout/Navbar'
import Sidebar from '../../components/layout/Sidebar'
import api from '../../services/api'

const Payments = () => {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  useEffect(() => {
    fetchBookings()
  }, [])

  const fetchBookings = async () => {
    try {
      setLoading(true)
      const response = await api.get('/bookings')
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

  const handleVerifyPayment = async (bookingId, status) => {
    try {
      const response = await api.put(`/bookings/${bookingId}/payment`, {
        paymentStatus: status,
        paymentMethod: selectedBooking.paymentMethod
      })

      setBookings(prev => prev.map(b => 
        b._id === bookingId ? response.data.data : b
      ))

      setMessage({
        type: 'success',
        text: `Payment ${status === 'paid' ? 'approved' : 'rejected'} successfully`
      })

      setShowModal(false)
      setTimeout(() => setMessage({ type: '', text: '' }), 3000)
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to update payment'
      })
    }
  }

  const filteredBookings = bookings.filter(booking => {
    if (filter === 'all') return true
    if (filter === 'paid') return booking.paymentStatus === 'paid'
    if (filter === 'unpaid') return booking.paymentStatus === 'unpaid'
    if (filter === 'pending') return booking.paymentStatus === 'pending'
    return true
  })

  const stats = {
    total: bookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0),
    paid: bookings.filter(b => b.paymentStatus === 'paid').reduce((sum, b) => sum + (b.totalAmount || 0), 0),
    pending: bookings.filter(b => b.paymentStatus === 'pending').reduce((sum, b) => sum + (b.totalAmount || 0), 0),
    unpaid: bookings.filter(b => b.paymentStatus === 'unpaid').reduce((sum, b) => sum + (b.totalAmount || 0), 0)
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

  const getPaymentMethodIcon = (method) => {
    switch (method) {
      case 'card':
        return <CreditCard className="w-4 h-4" />
      case 'bank_slip':
        return <FileText className="w-4 h-4" />
      case 'cash':
        return <DollarSign className="w-4 h-4" />
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex">
        <Sidebar role="admin" />
        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Payment Management</h1>
              <p className="text-gray-600">View and manage all payments</p>
            </div>

            {/* Statistics */}
            <div className="grid md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <p className="text-gray-600 text-sm mb-2">Total Revenue</p>
                <p className="text-3xl font-bold text-teal-600">${stats.total.toFixed(2)}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <p className="text-gray-600 text-sm mb-2">Paid</p>
                <p className="text-3xl font-bold text-green-600">${stats.paid.toFixed(2)}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <p className="text-gray-600 text-sm mb-2">Pending</p>
                <p className="text-3xl font-bold text-yellow-600">${stats.pending.toFixed(2)}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <p className="text-gray-600 text-sm mb-2">Unpaid</p>
                <p className="text-3xl font-bold text-red-600">${stats.unpaid.toFixed(2)}</p>
              </div>
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

            {/* Filters */}
            <div className="flex gap-4 mb-6">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  filter === 'all'
                    ? 'bg-teal-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:border-gray-400'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('paid')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  filter === 'paid'
                    ? 'bg-green-600 text-white'
                    : 'bg-white text-green-600 border border-green-300 hover:border-green-400'
                }`}
              >
                Paid
              </button>
              <button
                onClick={() => setFilter('pending')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  filter === 'pending'
                    ? 'bg-yellow-600 text-white'
                    : 'bg-white text-yellow-600 border border-yellow-300 hover:border-yellow-400'
                }`}
              >
                Pending Verification
              </button>
              <button
                onClick={() => setFilter('unpaid')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  filter === 'unpaid'
                    ? 'bg-red-600 text-white'
                    : 'bg-white text-red-600 border border-red-300 hover:border-red-400'
                }`}
              >
                Unpaid
              </button>
            </div>

            {/* Payments List */}
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-600"></div>
                <p className="mt-4 text-gray-600">Loading payments...</p>
              </div>
            ) : filteredBookings.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <DollarSign className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No payments found</p>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Client
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Caregiver
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Service
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Method
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredBookings.map((booking) => (
                      <tr key={booking._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {booking.client?.name || 'N/A'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {booking.client?.email}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {booking.caregiver?.user?.name || 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{booking.serviceType}</div>
                          <div className="text-xs text-gray-500">
                            {new Date(booking.startDate).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-teal-600">
                            ${booking.totalAmount}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2 text-sm text-gray-900">
                            {getPaymentMethodIcon(booking.paymentMethod)}
                            <span className="capitalize">
                              {booking.paymentMethod === 'none' ? 'Not paid' : booking.paymentMethod.replace('_', ' ')}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getPaymentStatusColor(booking.paymentStatus)}`}>
                            {booking.paymentStatus.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {booking.paymentDate 
                            ? new Date(booking.paymentDate).toLocaleDateString()
                            : '-'
                          }
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {booking.paymentStatus === 'pending' && (
                            <button
                              onClick={() => {
                                setSelectedBooking(booking)
                                setShowModal(true)
                              }}
                              className="flex items-center gap-1 text-teal-600 hover:text-teal-800 font-medium"
                            >
                              <Eye className="w-4 h-4" />
                              Verify
                            </button>
                          )}
                          {booking.paymentStatus === 'paid' && booking.transactionId && (
                            <div className="text-xs text-gray-500">
                              ID: {booking.transactionId.substring(0, 12)}...
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Verification Modal */}
      {showModal && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-96 overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">Verify Payment</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-sm text-gray-600 font-medium mb-1">Client</p>
                  <p className="font-semibold text-gray-800">{selectedBooking.client?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-medium mb-1">Caregiver</p>
                  <p className="font-semibold text-gray-800">{selectedBooking.caregiver?.user?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-medium mb-1">Amount</p>
                  <p className="font-semibold text-teal-600 text-xl">${selectedBooking.totalAmount}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-medium mb-1">Payment Method</p>
                  <p className="font-semibold text-gray-800 capitalize">
                    {selectedBooking.paymentMethod.replace('_', ' ')}
                  </p>
                </div>
              </div>

              {selectedBooking.bankSlipUrl && (
                <div className="mb-6">
                  <p className="text-sm text-gray-600 font-medium mb-3">Bank Slip</p>
                  <div className="border rounded-lg p-2">
                    <img 
                      src={selectedBooking.bankSlipUrl} 
                      alt="Bank slip" 
                      className="max-w-full h-auto rounded"
                    />
                  </div>
                </div>
              )}

              <div className="flex gap-4">
                <button
                  onClick={() => handleVerifyPayment(selectedBooking._id, 'paid')}
                  className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition"
                >
                  <CheckCircle className="w-5 h-5" />
                  Approve Payment
                </button>
                <button
                  onClick={() => handleVerifyPayment(selectedBooking._id, 'unpaid')}
                  className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition"
                >
                  <X className="w-5 h-5" />
                  Reject Payment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Payments
