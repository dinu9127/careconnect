import React, { useState, useEffect } from 'react'
import Navbar from '../../components/layout/Navbar'
import Sidebar from '../../components/layout/Sidebar'
import { Calendar, Clock, Plus, X, ChevronLeft, ChevronRight } from 'lucide-react'
import api from '../../services/api'

const UpdateAvailability = () => {
  const [leaveSlots, setLeaveSlots] = useState([])
  const [bookings, setBookings] = useState([])
  const [selectedDate, setSelectedDate] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [currentMonth, setCurrentMonth] = useState(new Date())

  useEffect(() => {
    fetchLeaveSlots()
    fetchBookings()
  }, [])

  const fetchLeaveSlots = async () => {
    try {
      const response = await api.get('/caregivers/me')
      setLeaveSlots(response.data.data?.leaveSlots || [])
    } catch (error) {
      console.error('Error fetching leave slots:', error)
      setMessage('Error loading leave slots')
    }
  }

  const fetchBookings = async () => {
    try {
      const response = await api.get('/bookings/caregiver-bookings')
      // Only confirmed bookings
      setBookings(response.data.data?.filter(b => b.status === 'confirmed') || [])
    } catch (error) {
      console.error('Error fetching bookings:', error)
    }
  }

  const addLeaveSlot = async () => {
    if (!selectedDate || !startTime || !endTime) {
      setMessage('Please fill date, start time, and end time')
      return
    }

    setLoading(true)
    try {
      const newSlot = {
        date: selectedDate,
        startTime,
        endTime,
        reason: reason || ''
      }

      const response = await api.put('/caregivers/me', {
        leaveSlots: [...leaveSlots, newSlot]
      })

      setLeaveSlots(response.data.data?.leaveSlots || [])
      setSelectedDate('')
      setStartTime('')
      setEndTime('')
      setReason('')
      setMessage('Leave slot added successfully!')
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      setMessage('Error adding leave slot: ' + (error.response?.data?.message || error.message))
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const removeLeaveSlot = async (index) => {
    setLoading(true)
    try {
      const updatedLeaveSlots = leaveSlots.filter((_, i) => i !== index)

      const response = await api.put('/caregivers/me', {
        leaveSlots: updatedLeaveSlots
      })

      setLeaveSlots(response.data.data?.leaveSlots || [])
      setMessage('Leave slot removed successfully!')
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      setMessage('Error removing leave slot: ' + (error.response?.data?.message || error.message))
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) {
      return 'Date unavailable'
    }

    const parsed = new Date(dateString)
    if (Number.isNaN(parsed.getTime())) {
      return 'Date unavailable'
    }

    return parsed.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  // Calendar helper functions
  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const isDateBooked = (date) => {
    return bookings.some(booking => {
      const startDate = new Date(booking.startDate)
      const endDate = new Date(booking.endDate)
      const checkDate = new Date(date)
      return checkDate >= startDate && checkDate <= endDate
    })
  }

  const getBookingForDate = (date) => {
    const checkDate = new Date(date).toDateString()
    return bookings.find(booking => {
      const startDate = new Date(booking.startDate).toDateString()
      const endDate = new Date(booking.endDate).toDateString()
      return checkDate >= startDate && checkDate <= endDate
    })
  }

  const getLeaveForDate = (date) => {
    const checkDate = new Date(date).toDateString()
    return leaveSlots.find(leave => {
      const leaveDate = new Date(leave.date).toDateString()
      return leaveDate === checkDate
    })
  }

  const getDaysArray = () => {
    const daysInMonth = getDaysInMonth(currentMonth)
    const firstDay = getFirstDayOfMonth(currentMonth)
    const days = []

    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(null)
    }

    // Days of the month
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex">
        <Sidebar role="caregiver" />
        <main className="flex-1 p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Manage Leave & Schedule</h1>
          <p className="text-gray-600 mb-6">You are available 24/7 by default. Add leave slots when you're not available.</p>

          {message && (
            <div
              className={`p-4 mb-6 rounded-xl border-t-4 transition-all duration-300 ${
                message.includes('Error') ? 'bg-red-100 text-red-700 border border-red-300 border-t-red-600' : 'bg-green-100 text-green-700 border border-green-300 border-t-green-600'
              }`}
            >
              {message}
            </div>
          )}

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-8">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Add Leave Slot
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Calendar className="w-4 h-4 inline mr-2" />
                      Date
                    </label>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Clock className="w-4 h-4 inline mr-2" />
                      Start Time
                    </label>
                    <input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Clock className="w-4 h-4 inline mr-2" />
                      End Time
                    </label>
                    <input
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Reason (Optional)
                    </label>
                    <input
                      type="text"
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="Personal, Medical, etc."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={addLeaveSlot}
                    disabled={loading}
                    className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50"
                  >
                    {loading ? 'Saving...' : 'Add Leave Slot'}
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-md p-6 border-t-4 border-t-red-600 hover:shadow-lg transition-all duration-300">
                <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  My Leave Slots
                </h2>

                {leaveSlots.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No leave slots added</p>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {leaveSlots.map((slot, index) => (
                      <div
                        key={`${slot.date}-${slot.startTime}-${index}`}
                        className="flex items-center justify-between p-4 bg-red-50 rounded-xl border border-red-200 hover:shadow-md transition-all duration-300"
                      >
                        <div>
                          <p className="font-medium text-gray-800">{formatDate(slot.date)}</p>
                          <p className="text-sm text-gray-600 mt-1">
                            <Clock className="w-4 h-4 inline mr-1" />
                            {slot.startTime} - {slot.endTime}
                          </p>
                          {slot.reason && (
                            <p className="text-xs text-gray-500 mt-1">{slot.reason}</p>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => removeLeaveSlot(index)}
                          disabled={loading}
                          className="text-red-600 hover:text-red-700 transition disabled:opacity-50"
                          aria-label="Remove leave slot"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-md p-6 border-t-4 border-t-blue-600 hover:shadow-lg transition-all duration-300">
                <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center justify-between">
                  <span>My Schedule</span>
                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      onClick={prevMonth}
                      className="p-2 hover:bg-gray-100 rounded-lg transition"
                      aria-label="Previous month"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <span className="font-semibold text-lg min-w-48 text-center">
                      {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </span>
                    <button
                      type="button"
                      onClick={nextMonth}
                      className="p-2 hover:bg-gray-100 rounded-lg transition"
                      aria-label="Next month"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </h2>

                <div className="border border-gray-200 rounded-xl overflow-hidden shadow-md">
                  <div className="grid grid-cols-7 bg-blue-50 border-b-2 border-blue-200">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                      <div key={day} className="p-4 text-center font-semibold text-blue-700 bg-blue-50">
                        {day}
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-7 gap-px bg-gray-200">
                    {getDaysArray().map((date, idx) => {
                      const isBooked = date && isDateBooked(date)
                      const booking = date && getBookingForDate(date)
                      const leave = date && getLeaveForDate(date)
                      const isToday = date && date.toDateString() === new Date().toDateString()
                      const isCurrentMonth = date && date.getMonth() === currentMonth.getMonth()

                      return (
                        <div
                          key={idx}
                          className={`p-4 min-h-28 bg-white relative transition-all duration-200 ${
                            !isCurrentMonth ? 'opacity-50' : ''
                          } ${
                            isToday ? 'border-2 border-blue-600' : ''
                          }`}
                        >
                          {date && (
                            <>
                              <div
                                className={`text-sm font-semibold mb-2 ${
                                  isToday ? 'text-blue-700' : 'text-gray-700'
                                }`}
                              >
                                {date.getDate()}
                              </div>

                              {isBooked && booking && (
                                <div className="bg-blue-200 border-l-4 border-blue-600 p-2 rounded-lg text-xs shadow-sm hover:shadow-md transition-all duration-200">
                                  <p className="font-semibold text-blue-900 truncate">
                                    {booking.client?.name || 'Booking'}
                                  </p>
                                  <p className="text-blue-800 text-xs">
                                    {booking.startTime} - {booking.endTime}
                                  </p>
                                  <p className="text-blue-700 text-xs font-medium mt-1">BOOKED</p>
                                </div>
                              )}

                              {leave && (
                                <div className="bg-red-200 border-l-4 border-red-600 p-2 rounded-lg text-xs mt-2 shadow-sm hover:shadow-md transition-all duration-200">
                                  <p className="font-semibold text-red-900 truncate">Leave</p>
                                  <p className="text-red-800 text-xs">
                                    {leave.startTime} - {leave.endTime}
                                  </p>
                                  {leave.reason && (
                                    <p className="text-red-700 text-xs truncate mt-1">{leave.reason}</p>
                                  )}
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-blue-200 border-2 border-blue-600 rounded"></div>
                    <span className="text-sm text-gray-700">Confirmed Booking</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-red-200 border-2 border-red-600 rounded"></div>
                    <span className="text-sm text-gray-700">Leave</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-blue-600 rounded"></div>
                    <span className="text-sm text-gray-700">Today</span>
                  </div>
                </div>

                {bookings.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h3 className="font-semibold text-gray-800 mb-4">Upcoming Bookings</h3>
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {bookings.map((booking) => (
                        <div key={booking._id} className="p-3 bg-blue-50 rounded-lg border-l-4 border-l-blue-600 hover:shadow-md transition-all duration-300">
                          <p className="font-semibold text-gray-800">{booking.client?.name}</p>
                          <p className="text-sm text-gray-600">
                            {new Date(booking.startDate).toLocaleDateString()} -{' '}
                            {new Date(booking.endDate).toLocaleDateString()}
                          </p>
                          <p className="text-sm text-gray-600">
                            {booking.startTime} - {booking.endTime}
                          </p>
                          <div className="flex justify-between items-center mt-2">
                            <span
                              className={`text-xs font-semibold px-2 py-1 rounded-lg border transition-all duration-300 ${
                                booking.status === 'confirmed'
                                  ? 'bg-blue-200 text-blue-900 border-blue-300'
                                  : 'bg-sky-200 text-sky-900 border-sky-300'
                              }`}
                            >
                              {booking.status.toUpperCase()}
                            </span>
                            <span className="text-xs text-gray-600">{booking.serviceType}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default UpdateAvailability

