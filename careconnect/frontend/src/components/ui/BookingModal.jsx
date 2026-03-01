import React, { useState, useEffect } from 'react'
import { X, Calendar, Clock, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react'
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
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectingEndDate, setSelectingEndDate] = useState(false)
  const [bookedDates, setBookedDates] = useState([])

  const userData = caregiver?.user || {}
  const serviceTypes = caregiver?.serviceTypes || []

  useEffect(() => {
    if (isOpen && caregiver) {
      fetchBookedDates()
    }
  }, [isOpen, caregiver])

  useEffect(() => {
    if (serviceTypes.length === 1) {
      setFormData(prev => ({
        ...prev,
        serviceType: serviceTypes[0]
      }))
    } else if (serviceTypes.length > 1) {
      setFormData(prev => ({
        ...prev,
        serviceType: prev.serviceType && serviceTypes.includes(prev.serviceType) ? prev.serviceType : ''
      }))
    }
  }, [serviceTypes])

  const fetchBookedDates = async () => {
    try {
      if (!caregiver?._id) {
        console.error('Caregiver ID is missing')
        return
      }
      const response = await axios.get(`/api/caregivers/${caregiver._id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      setBookedDates(response.data.data?.bookedDates || [])
    } catch (err) {
      console.error('Failed to fetch booked dates:', err)
      setBookedDates([])
    }
  }

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
    
    const startDate = new Date(formData.startDate)
    const endDate = new Date(formData.endDate)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    if (startDate < today) {
      setError('Start date cannot be in the past')
      return false
    }
    if (endDate < startDate) {
      setError('End date must be after or equal to start date')
      return false
    }
    
    // Validate times
    const [startHour, startMin] = formData.startTime.split(':').map(Number)
    const [endHour, endMin] = formData.endTime.split(':').map(Number)
    const startMinutes = startHour * 60 + startMin
    const endMinutes = endHour * 60 + endMin
    
    if (endMinutes <= startMinutes) {
      setError('End time must be after start time')
      return false
    }
    
    // Check minimum booking duration (at least 1 hour)
    if (endMinutes - startMinutes < 60) {
      setError('Minimum booking duration is 1 hour')
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
      const hours = Math.max(1, (endHour - startHour) + (endMin - startMin) / 60)
      
      const totalAmount = (days + 1) * hours * caregiver.hourlyRate

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

  // Calendar helper functions
  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const isDateBooked = (date) => {
    return bookedDates.some(booked => {
      const bookedStart = new Date(booked.startDate)
      const bookedEnd = new Date(booked.endDate)
      bookedStart.setHours(0, 0, 0, 0)
      bookedEnd.setHours(23, 59, 59, 999)
      date.setHours(0, 0, 0, 0)
      return date >= bookedStart && date <= bookedEnd
    })
  }

  const isDateAvailable = (date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    if (date < today) return false
    if (isDateBooked(date)) return false
    return true
  }

  const handleDateClick = (date) => {
    if (!isDateAvailable(date)) return
    
    const dateStr = date.toISOString().split('T')[0]
    
    if (!selectingEndDate) {
      setFormData(prev => ({
        ...prev,
        startDate: dateStr,
        endDate: ''
      }))
      setSelectingEndDate(true)
    } else {
      const startDate = new Date(formData.startDate)
      if (date < startDate) {
        setFormData(prev => ({
          ...prev,
          startDate: dateStr,
          endDate: ''
        }))
      } else {
        setFormData(prev => ({
          ...prev,
          endDate: dateStr
        }))
        setSelectingEndDate(false)
      }
    }
  }

  const getDaysArray = () => {
    const daysInMonth = getDaysInMonth(currentMonth)
    const firstDay = getFirstDayOfMonth(currentMonth)
    const days = []

    for (let i = 0; i < firstDay; i++) {
      days.push(null)
    }

    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i))
    }

    return days
  }

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
  }

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
  }

  const isDateInRange = (date) => {
    if (!formData.startDate || !formData.endDate) return false
    const start = new Date(formData.startDate)
    const end = new Date(formData.endDate)
    start.setHours(0, 0, 0, 0)
    end.setHours(23, 59, 59, 999)
    date.setHours(12, 0, 0, 0)
    return date >= start && date <= end
  }

  const calculateDays = () => {
    if (!formData.startDate || !formData.endDate) return 0
    const startDate = new Date(formData.startDate)
    const endDate = new Date(formData.endDate)
    return Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) || 1
  }

  const calculateHoursPerDay = () => {
    if (!formData.startTime || !formData.endTime) return 0
    const [startHour, startMin] = formData.startTime.split(':').map(Number)
    const [endHour, endMin] = formData.endTime.split(':').map(Number)
    return Math.max(0, (endHour - startHour) + (endMin - startMin) / 60)
  }

  const calculateCostPerDay = () => {
    return calculateHoursPerDay() * caregiver.hourlyRate
  }

  const calculateTotal = () => {
    return calculateDays() * calculateHoursPerDay() * caregiver.hourlyRate
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
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            >
              {serviceTypes.length > 1 && (
                <option value="">Select a service type</option>
              )}
              {serviceTypes.map((service) => (
                <option key={service} value={service}>
                  {service}
                </option>
              ))}
            </select>
          </div>

          {/* Calendar */}
          <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <button
                type="button"
                onClick={prevMonth}
                className="p-1 hover:bg-slate-200 rounded"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h3 className="font-semibold text-slate-900">
                {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </h3>
              <button
                type="button"
                onClick={nextMonth}
                className="p-1 hover:bg-slate-200 rounded"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                <div key={day} className="text-center text-xs font-semibold text-slate-600 py-1">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {getDaysArray().map((date, idx) => {
                if (!date) {
                  return <div key={`empty-${idx}`} className="aspect-square" />
                }

                const isAvailable = isDateAvailable(date)
                const isBooked = isDateBooked(date)
                const isSelected = formData.startDate === date.toISOString().split('T')[0] || 
                                  formData.endDate === date.toISOString().split('T')[0]
                const isInRange = isDateInRange(date)
                const isToday = date.toDateString() === new Date().toDateString()

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleDateClick(date)}
                    disabled={!isAvailable}
                    className={`aspect-square rounded text-sm font-medium transition ${
                      isSelected
                        ? 'bg-teal-600 text-white'
                        : isInRange
                        ? 'bg-teal-100 text-teal-900'
                        : isToday
                        ? 'border-2 border-teal-600 text-teal-600'
                        : isBooked
                        ? 'bg-red-100 text-red-400 cursor-not-allowed'
                        : isAvailable
                        ? 'bg-white text-slate-900 hover:bg-teal-50'
                        : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    {date.getDate()}
                  </button>
                )
              })}
            </div>

            <div className="mt-3 flex flex-wrap gap-3 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-teal-600 rounded"></div>
                <span className="text-slate-600">Selected</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-white border border-slate-300 rounded"></div>
                <span className="text-slate-600">Available</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-red-100 rounded"></div>
                <span className="text-slate-600">Booked</span>
              </div>
            </div>

            {formData.startDate && (
              <div className="mt-3 text-sm text-slate-700">
                <strong>Selected:</strong> {new Date(formData.startDate).toLocaleDateString()}
                {formData.endDate && ` - ${new Date(formData.endDate).toLocaleDateString()}`}
                {!formData.endDate && selectingEndDate && ' (Select end date)'}
              </div>
            )}
          </div>

          {/* Start Date */}
          <div className="hidden">
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
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>

          {/* End Date */}
          <div className="hidden">
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
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
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
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
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
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
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
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>

          {/* Cost Breakdown */}
          <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
            <div className="flex justify-between mb-2">
              <span className="text-slate-600">Hourly Rate:</span>
              <span className="font-semibold">Rs. {caregiver.hourlyRate}</span>
            </div>
            <div className="border-t border-slate-200 pt-2 flex justify-between">
              <span className="font-semibold text-slate-900">Cost per day:</span>
              <span className="text-lg font-bold text-teal-600">
                Rs. {Math.round(calculateCostPerDay()).toLocaleString()}
              </span>
            </div>
            <div className="border-t border-slate-200 pt-2 mt-2 flex justify-between">
              <span className="font-semibold text-slate-900">Total Cost:</span>
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

