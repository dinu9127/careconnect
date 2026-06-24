import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { X, Clock, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react'
import api, { authService } from '../../services/api'

const BookingModal = ({ caregiver, isOpen, onClose, onSuccess }) => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    selectedDates: [],
    startTime: '09:00',
    endTime: '17:00',
    serviceType: '',
    notes: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [bookedDates, setBookedDates] = useState([])
  const [leaveSlots, setLeaveSlots] = useState([])
  const [profileCheck, setProfileCheck] = useState({ complete: true, missingFields: [] })

  const getLocalDateString = (date) => {
    if (!date) return ''
    const d = new Date(date)
    if (Number.isNaN(d.getTime())) return ''
    if (typeof date === 'string' && date.includes('T')) {
      return date.split('T')[0]
    }
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const formatLocalDate = (date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const userData = caregiver?.user || {}
  const serviceTypes = caregiver?.serviceTypes || []

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen && caregiver) {
      setFormData({
        selectedDates: [],
        startTime: '09:00',
        endTime: '17:00',
        serviceType: serviceTypes.length === 1 ? serviceTypes[0] : '',
        notes: ''
      })
      setError('')
      setCurrentMonth(new Date())
      fetchBookedDates()
      checkClientProfileCompleteness()
    }
  }, [isOpen, caregiver])

  const fetchBookedDates = async () => {
    try {
      if (!caregiver?._id) return
      const response = await api.get(`/caregivers/${caregiver._id}`)
      setBookedDates(response.data.data?.bookedDates || [])
      setLeaveSlots(response.data.data?.leaveSlots || [])
    } catch (err) {
      console.error('Failed to fetch booked dates:', err)
      setBookedDates([])
      setLeaveSlots([])
    }
  }

  const checkClientProfileCompleteness = async () => {
    try {
      const response = await authService.getProfile()
      const user = response.data.data || {}
      const missingFields = []

      if (!user.name?.trim()) missingFields.push('full name')
      if (!user.phone?.trim()) missingFields.push('phone number')
      if (!user.address?.trim()) missingFields.push('address')
      if (!user.careReceiverName?.trim()) missingFields.push("care receiver's name")
      if (!user.careReceiverRelationship?.trim()) missingFields.push('relationship to care receiver')
      if (!Array.isArray(user.geoLocation?.coordinates) || user.geoLocation.coordinates.length !== 2) {
        missingFields.push('map location')
      }

      setProfileCheck({ complete: missingFields.length === 0, missingFields })

      if (missingFields.length > 0) {
        setError('Please complete your profile before booking.')
      }
    } catch (error) {
      setProfileCheck({ complete: false, missingFields: ['profile details'] })
      setError('Please complete your profile before booking.')
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleUpdateProfile = () => {
    onClose()
    navigate('/client/profile')
  }

  // ── Date helpers ──────────────────────────────────────────────────────────

  const isDateBooked = (dateStr) => {
    return bookedDates.some(booked => {
      const bookedStart = getLocalDateString(booked.startDate)
      const bookedEnd = getLocalDateString(booked.endDate)
      return dateStr >= bookedStart && dateStr <= bookedEnd
    })
  }

  const isDateLeave = (dateStr) => {
    return leaveSlots.some(leave => {
      return getLocalDateString(leave.date) === dateStr
    })
  }

  const getLeaveForDate = (dateStr) => {
    return leaveSlots.find(leave => {
      return getLocalDateString(leave.date) === dateStr
    })
  }

  const isDateAvailable = (dateStr) => {
    const today = formatLocalDate(new Date())
    if (dateStr < today) return false
    if (isDateBooked(dateStr)) return false
    if (isDateLeave(dateStr)) return false
    return true
  }

  // Toggle a date on or off
  const handleDateClick = (date) => {
    const dateStr = formatLocalDate(date)
    if (!isDateAvailable(dateStr)) return

    setFormData(prev => {
      const already = prev.selectedDates.includes(dateStr)
      return {
        ...prev,
        selectedDates: already
          ? prev.selectedDates.filter(d => d !== dateStr)
          : [...prev.selectedDates, dateStr].sort()
      }
    })
  }

  const removeDate = (dateStr) => {
    setFormData(prev => ({
      ...prev,
      selectedDates: prev.selectedDates.filter(d => d !== dateStr)
    }))
  }

  // ── Calendar grid ─────────────────────────────────────────────────────────

  const getDaysArray = () => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const days = []

    for (let i = 0; i < firstDay; i++) days.push(null)
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i))
    }
    return days
  }

  const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))

  const calculatePricingBreakdown = () => {
    const [sh, sm] = formData.startTime.split(':').map(Number)
    const [eh, em] = formData.endTime.split(':').map(Number)
    const start = sh + (sm || 0) / 60
    const end = eh + (em || 0) / 60
    const totalHoursPerDay = Math.max(0, end - start)

    const stdStart = 9.0 // 9:00 AM
    const stdEnd = 17.0  // 5:00 PM

    const normalHours = Math.max(0, Math.min(end, stdEnd) - Math.max(start, stdStart))
    const otHours = Math.max(0, totalHoursPerDay - normalHours)

    const normalRate = caregiver.hourlyRate
    const otRate = caregiver.hourlyRate * 1.5

    const normalCostPerDay = normalHours * normalRate
    const otCostPerDay = otHours * otRate
    const costPerDay = normalCostPerDay + otCostPerDay

    const daysCount = formData.selectedDates.length
    const totalNormalCost = normalCostPerDay * daysCount
    const totalOtCost = otCostPerDay * daysCount
    const totalAmount = Math.round(costPerDay * daysCount)

    return {
      normalHours,
      otHours,
      totalHoursPerDay,
      normalRate,
      otRate,
      normalCostPerDay,
      otCostPerDay,
      costPerDay,
      totalNormalCost,
      totalOtCost,
      totalAmount
    }
  }

  const calculateHoursPerDay = () => calculatePricingBreakdown().totalHoursPerDay

  const validateForm = () => {
    if (formData.selectedDates.length === 0) {
      setError('Please select at least one date')
      return false
    }
    if (!formData.serviceType) {
      setError('Please select a service type')
      return false
    }

    const [sh, sm] = formData.startTime.split(':').map(Number)
    const [eh, em] = formData.endTime.split(':').map(Number)
    const startMinutes = sh * 60 + sm
    const endMinutes = eh * 60 + em

    if (endMinutes <= startMinutes) {
      setError('End time must be after start time')
      return false
    }
    if (endMinutes - startMinutes < 60) {
      setError('Minimum booking duration is 1 hour')
      return false
    }
    return true
  }

  // ── Submit ────────────────────────────────────────────────────────────────

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!profileCheck.complete) {
      setError('Please complete your profile before booking.')
      return
    }
    if (!validateForm()) return

    setLoading(true)

    try {
      const { totalAmount } = calculatePricingBreakdown()

      // Sort dates so startDate = first, endDate = last
      const sortedDates = [...formData.selectedDates].sort()

      const bookingData = {
        selectedDates: formData.selectedDates,
        startDate: sortedDates[0],
        endDate: sortedDates[sortedDates.length - 1],
        startTime: formData.startTime,
        endTime: formData.endTime,
        serviceType: formData.serviceType,
        notes: formData.notes,
        caregiver: caregiver._id,
        totalAmount
      }

      const token = localStorage.getItem('token') || sessionStorage.getItem('token')
      if (!token) {
        window.location.href = '/login'
        return
      }

      const response = await api.post('/bookings', bookingData)

      if (response.data.success) {
        setFormData({
          selectedDates: [],
          startTime: '09:00',
          endTime: '17:00',
          serviceType: serviceTypes.length === 1 ? serviceTypes[0] : '',
          notes: ''
        })
        if (onSuccess) onSuccess(response.data.data)
        onClose()
      }
    } catch (err) {
      if (err.response?.status === 401) {
        window.location.href = '/login'
        return
      }
      setError(err.response?.data?.message || 'Failed to create booking')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen || !caregiver) return null

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[1000] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-teal-600 to-cyan-600 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">Book Caregiver</h2>
            <p className="text-teal-100 text-sm">{userData.name}</p>
          </div>
          <button onClick={onClose} className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4" noValidate>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Service Type */}
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">Service Type *</label>
            <select
              name="serviceType"
              value={formData.serviceType}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
            >
              {serviceTypes.length > 1 && <option value="">Select a service type</option>}
              {serviceTypes.map(service => (
                <option key={service} value={service}>{service}</option>
              ))}
            </select>
          </div>

          {/* Calendar */}
          <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
            {/* Month navigation */}
            <div className="flex items-center justify-between mb-4">
              <button type="button" onClick={prevMonth} className="p-1 hover:bg-slate-200 rounded">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h3 className="font-semibold text-slate-900">
                {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </h3>
              <button type="button" onClick={nextMonth} className="p-1 hover:bg-slate-200 rounded">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Day labels */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                <div key={day} className="text-center text-xs font-semibold text-slate-600 py-1">{day}</div>
              ))}
            </div>

            {/* Day buttons */}
            <div className="grid grid-cols-7 gap-1">
              {getDaysArray().map((date, idx) => {
                if (!date) return <div key={`empty-${idx}`} className="aspect-square" />

                const dateStr = formatLocalDate(date)
                const available = isDateAvailable(dateStr)
                const booked = isDateBooked(dateStr)
                const leave = isDateLeave(dateStr)
                const selected = formData.selectedDates.includes(dateStr)
                const isToday = date.toDateString() === new Date().toDateString()

                const leaveInfo = leave ? getLeaveForDate(dateStr) : null

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleDateClick(date)}
                    disabled={!available}
                    className={`aspect-square rounded text-sm font-medium transition ${selected
                      ? 'bg-teal-600 text-white'
                      : isToday
                        ? 'border-2 border-teal-600 text-teal-600'
                        : booked
                          ? 'bg-red-100 text-red-400 cursor-not-allowed'
                          : leave
                            ? 'bg-orange-100 text-orange-700 border border-orange-200 cursor-not-allowed'
                            : available
                              ? 'bg-white text-slate-900 hover:bg-teal-50'
                              : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      }`}
                    title={leaveInfo ? `Leave: ${leaveInfo.reason || 'Unavailable'} (${leaveInfo.startTime} - ${leaveInfo.endTime})` : undefined}
                  >
                    {date.getDate()}
                  </button>
                )
              })}
            </div>

            {/* Legend */}
            <div className="mt-3 flex flex-wrap gap-3 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-teal-600 rounded" />
                <span className="text-slate-600">Selected</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-white border border-slate-300 rounded" />
                <span className="text-slate-600">Available</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-red-100 rounded" />
                <span className="text-slate-600">Booked</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-orange-100 border border-orange-200 rounded" />
                <span className="text-slate-600">Leave</span>
              </div>
            </div>

            {/* Hint */}
            <p className="mt-2 text-xs text-slate-500">Tap a date to select it. Tap again to deselect.</p>
          </div>

          {/* Selected date chips */}
          {formData.selectedDates.length > 0 && (
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">
                Selected Dates ({formData.selectedDates.length})
              </label>
              <div className="flex flex-wrap gap-2">
                {formData.selectedDates.map(dateStr => (
                  <span
                    key={dateStr}
                    className="inline-flex items-center gap-1 bg-teal-50 text-teal-800 text-xs font-medium px-2.5 py-1 rounded-full border border-teal-200"
                  >
                    {new Date(dateStr + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    <button
                      type="button"
                      onClick={() => removeDate(dateStr)}
                      className="ml-1 text-teal-600 hover:text-teal-900 font-bold leading-none"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Times */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">
                <div className="flex items-center gap-2"><Clock className="w-4 h-4" /> Start Time</div>
              </label>
              <input
                type="time"
                name="startTime"
                value={formData.startTime}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">
                <div className="flex items-center gap-2"><Clock className="w-4 h-4" /> End Time</div>
              </label>
              <input
                type="time"
                name="endTime"
                value={formData.endTime}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Add any special requests or notes"
              rows="3"
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
            />
          </div>

          {/* Cost breakdown */}
          {(() => {
            const pricing = calculatePricingBreakdown()
            const daysCount = formData.selectedDates.length
            return (
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3 shadow-inner">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Pricing Breakdown</h4>

                <div className="flex justify-between text-sm text-slate-600">
                  <span>Standard rate (9am - 5pm)</span>
                  <span>Rs. {caregiver.hourlyRate}/hr</span>
                </div>

                <div className="flex justify-between text-sm text-slate-600">
                  <span>Days selected</span>
                  <span>{daysCount} {daysCount === 1 ? 'day' : 'days'}</span>
                </div>

                <div className="border-t border-slate-200/60 pt-2 space-y-2">
                  <div className="flex justify-between text-sm text-slate-700">
                    <span className="flex items-center gap-1.5">

                      Normal Hours ({pricing.normalHours.toFixed(1)} hrs/day)
                    </span>
                    <span className="font-medium text-slate-900">Rs. {Math.round(pricing.normalCostPerDay * daysCount).toLocaleString()}</span>
                  </div>

                  {pricing.otHours > 0 && (
                    <div className="flex justify-between text-sm text-slate-700">
                      <span className="flex items-center gap-1.5">

                        Overtime ({pricing.otHours.toFixed(1)} hrs/day)

                      </span>
                      <span className="font-medium text-slate-900">Rs. {Math.round(pricing.otCostPerDay * daysCount).toLocaleString()}</span>
                    </div>
                  )}
                </div>

                <div className="border-t border-slate-200 pt-2 flex justify-between items-baseline">
                  <span className="font-semibold text-slate-900">Total cost</span>
                  <span className="text-xl font-bold text-teal-600">Rs. {pricing.totalAmount.toLocaleString()}</span>
                </div>
              </div>
            )
          })()}

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border-2 border-slate-200 text-slate-900 font-semibold rounded-lg hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            {!profileCheck.complete && (
              <button
                type="button"
                onClick={handleUpdateProfile}
                className="flex-1 px-4 py-2 border-2 border-teal-600 text-teal-700 font-semibold rounded-lg hover:bg-teal-50 transition"
              >
                Update profile
              </button>
            )}
            <button
              type="submit"
              disabled={loading || !profileCheck.complete}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-teal-600 to-cyan-600 text-white font-semibold rounded-lg hover:from-teal-700 hover:to-cyan-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Booking...' : profileCheck.complete ? 'Confirm Booking' : 'Complete Profile First'}
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}

export default BookingModal