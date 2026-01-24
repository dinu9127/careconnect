import React, { useState } from 'react'
import { X, Calendar, Clock, AlertCircle } from 'lucide-react'
import axios from 'axios'

const BookingModal = ({ caregiver, isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    startTime: '09:00',
    endTime: '17:00',
    serviceType: '',
    notes: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const userData = caregiver?.user || {}

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const validateForm = () => {
    if (!formData.startDate) {
      setError('Please select a start date')
      return false
    }
    if (!formData.endDate) {
      setError('Please select an end date')
      return false
    }
    if (!formData.serviceType) {
      setError('Please select a service type')
      return false
    }
    if (new Date(formData.startDate) > new Date(formData.endDate)) {
      setError('End date must be after start date')
      return false
    }
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      // Calculate total amount
      const startDate = new Date(formData.startDate)
      const endDate = new Date(formData.endDate)
      const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) || 1
      
      // Calculate hours per day
      const [startHour, startMin] = formData.startTime.split(':').map(Number)
      const [endHour, endMin] = formData.endTime.split(':').map(Number)
      const hours = (endHour - startHour) + (endMin - startMin) / 60
      
      const totalAmount = days * hours * caregiver.hourlyRate

      const bookingData = {
        ...formData,
        caregiver: caregiver._id,
        totalAmount: Math.round(totalAmount)
      }

      const response = await axios.post('/api/bookings', bookingData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (response.data.success) {
        setFormData({
          startDate: '',
          endDate: '',
          startTime: '09:00',
          endTime: '17:00',
          serviceType: '',
          notes: ''
        })
        onSuccess?.(response.data.data)
        onClose()
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create booking')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen || !caregiver) return null

  // Calculate estimated total
  const calculateTotal = () => {
    if (!formData.startDate || !formData.endDate) return 0
    const startDate = new Date(formData.startDate)
    const endDate = new Date(formData.endDate)
    const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) || 1
    
    const [startHour, startMin] = formData.startTime.split(':').map(Number)
    const [endHour, endMin] = formData.endTime.split(':').map(Number)
    const hours = (endHour - startHour) + (endMin - startMin) / 60
    
    return days * hours * caregiver.hourlyRate
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-teal-600 to-cyan-600 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">Book Caregiver</h2>
            <p className="text-teal-100 text-sm">{userData.name}</p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Service Type */}
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">
              Service Type *
            </label>
            <select
              name="serviceType"
              value={formData.serviceType}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
            >
              <option value="">Select a service type</option>
              {caregiver.serviceTypes?.map((service) => (
                <option key={service} value={service}>
                  {service}
                </option>
              ))}
            </select>
          </div>

          {/* Start Date */}
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Start Date *
              </div>
            </label>
            <input
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
            />
          </div>

          {/* End Date */}
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                End Date *
              </div>
            </label>
            <input
              type="date"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              min={formData.startDate || new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
            />
          </div>

          {/* Start Time */}
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Start Time
              </div>
            </label>
            <input
              type="time"
              name="startTime"
              value={formData.startTime}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
            />
          </div>

          {/* End Time */}
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                End Time
              </div>
            </label>
            <input
              type="time"
              name="endTime"
              value={formData.endTime}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">
              Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Add any special requests or notes"
              rows="3"
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
            />
          </div>

          {/* Cost Breakdown */}
          <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
            <div className="flex justify-between mb-2">
              <span className="text-slate-600">Hourly Rate:</span>
              <span className="font-semibold">Rs. {caregiver.hourlyRate}</span>
            </div>
            <div className="border-t border-slate-200 pt-2 flex justify-between">
              <span className="font-semibold text-slate-900">Estimated Total:</span>
              <span className="text-lg font-bold text-teal-600">
                Rs. {Math.round(calculateTotal()).toLocaleString()}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border-2 border-slate-200 text-slate-900 font-semibold rounded-lg hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-teal-600 to-cyan-600 text-white font-semibold rounded-lg hover:from-teal-700 hover:to-cyan-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Booking...' : 'Confirm Booking'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default BookingModal
