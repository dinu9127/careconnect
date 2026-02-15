import React, { useState, useEffect } from 'react'
import Navbar from '../../components/layout/Navbar'
import Sidebar from '../../components/layout/Sidebar'
import { Calendar, Clock, Plus, X, ChevronLeft, ChevronRight } from 'lucide-react'
import api from '../../services/api'

const UpdateAvailability = () => {
  const [availability, setAvailability] = useState([])
  const [bookings, setBookings] = useState([])
  const [selectedDate, setSelectedDate] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [currentMonth, setCurrentMonth] = useState(new Date())

  useEffect(() => {
    fetchAvailability()
    fetchBookings()
  }, [])

  const fetchAvailability = async () => {
    try {
      const response = await api.get('/caregivers/me')
      setAvailability(response.data.data?.availability || [])
    } catch (error) {
      console.error('Error fetching availability:', error)
      setMessage('Error loading availability')
    }
  }

  const fetchBookings = async () => {
    try {
      const response = await api.get('/bookings/caregiver-bookings')
      // Filter only confirmed and in-progress bookings
      setBookings(response.data.data?.filter(b => b.status === 'confirmed' || b.status === 'in-progress') || [])
    } catch (error) {
      console.error('Error fetching bookings:', error)
    }
  }

  const addAvailability = async () => {
    if (!selectedDate || !startTime || !endTime) {
      setMessage('Please fill all fields')
      return
    }

    setLoading(true)
    try {
      const newSlot = {
        date: selectedDate,
        startTime,
        endTime
      }

      const response = await api.put('/caregivers/me', {
        availability: [...availability, newSlot]
      })

      setAvailability(response.data.data?.availability || [])
      setSelectedDate('')
      setStartTime('')
      setEndTime('')
      setMessage('Availability updated successfully!')
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      setMessage('Error updating availability: ' + (error.response?.data?.message || error.message))
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const removeAvailability = async (index) => {
    setLoading(true)
    try {
      const updatedAvailability = availability.filter((_, i) => i !== index)

      const response = await api.put('/caregivers/me', {
        availability: updatedAvailability
      })

      setAvailability(response.data.data?.availability || [])
      setMessage('Availability updated successfully!')
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      setMessage('Error updating availability: ' + (error.response?.data?.message || error.message))
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
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
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Manage Schedule & Availability</h1>

          {message && (
            <div className={`p-4 mb-6 rounded-lg ${message.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
              {message}
            </div>
          )}

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column: Add Availability & Current List */}
            <div className="lg:col-span-1 space-y-8">
              {/* Add Availability Form */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Change Availability
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
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <button
                    onClick={addAvailability}
                    disabled={loading}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition disabled:bg-gray-400"
                  >
                    {loading ? 'Updating...' : 'Update Availability'}
                  </button>
                </div>
              </div>

              {/* Current Availability List */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  My Availability
                </h2>

                {availability.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No availability added yet</p>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {availability.map((slot, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
                      >
                        <div>
                          <p className="font-medium text-gray-800">
                            {formatDate(slot.date)}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            <Clock className="w-4 h-4 inline mr-1" />
                            {slot.startTime} - {slot.endTime}
                          </p>
                        </div>
                        <button
                          onClick={() => removeAvailability(index)}
                          disabled={loading}
                          className="text-red-600 hover:text-red-700 transition"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Calendar */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center justify-between">
                  <span>My Schedule</span>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={prevMonth}
                      className="p-2 hover:bg-gray-100 rounded-lg transition"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <span className="font-semibold text-lg min-w-48 text-center">
                      {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </span>
                    <button
                      onClick={nextMonth}
                      className="p-2 hover:bg-gray-100 rounded-lg transition"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </h2>

                {/* Calendar */}
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  {/* Week days header */}
                  <div className="grid grid-cols-7 bg-gray-100">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                      <div key={day} className="p-4 text-center font-semibold text-gray-700">
                        {day}
                      </div>
                    ))}
                  </div>

                  {/* Calendar days */}
                  <div className="grid grid-cols-7 gap-px bg-gray-200">
                    {getDaysArray().map((date, idx) => {
                      const isBooked = date && isDateBooked(date)
                      const booking = date && getBookingForDate(date)
                      const isToday = date && date.toDateString() === new Date().toDateString()
                      const isCurrentMonth = date && date.getMonth() === currentMonth.getMonth()

                      return (
                        <div
                          key={idx}
                          className={`p-4 min-h-28 bg-white relative ${
                            !isCurrentMonth ? 'opacity-50' : ''
                          }`}
                        >
                          {date && (
                            <>
                              <div className={`text-sm font-semibold mb-2 ${
                                isToday ? 'text-blue-600 bg-blue-50 rounded-full w-7 h-7 flex items-center justify-center' : 'text-gray-700'
                              }`}>
                                {date.getDate()}
                              </div>

                              {isBooked && booking && (
                                <div className="bg-blue-100 border-l-4 border-blue-600 p-2 rounded text-xs mt-1">
                                  <p className="font-semibold text-blue-900 truncate">
                                    {booking.client?.name || 'Booking'}
                                  </p>
                                  <p className="text-blue-800 text-xs">
                                    {booking.startTime} - {booking.endTime}
                                  </p>
                                  <p className="text-blue-700 text-xs font-medium mt-1">
                                    {booking.status.toUpperCase()}
                                  </p>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Legend */}
                <div className="mt-6 flex flex-wrap gap-6">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-blue-100 border-l-4 border-blue-600 rounded"></div>
                    <span className="text-sm text-gray-700">Confirmed Booking</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-blue-50 border-2 border-blue-600 rounded"></div>
                    <span className="text-sm text-gray-700">Today</span>
                  </div>
                </div>

                {/* Bookings Summary */}
                {bookings.length > 0 && (
                  <div className="mt-6 pt-6 border-t">
                    <h3 className="font-semibold text-gray-800 mb-4">Upcoming Bookings</h3>
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {bookings.map(booking => (
                        <div key={booking._id} className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <p className="font-semibold text-gray-800">{booking.client?.name}</p>
                          <p className="text-sm text-gray-600">
                            {new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}
                          </p>
                          <p className="text-sm text-gray-600">
                            {booking.startTime} - {booking.endTime}
                          </p>
                          <div className="flex justify-between items-center mt-2">
                            <span className={`text-xs font-semibold px-2 py-1 rounded ${
                              booking.status === 'confirmed' ? 'bg-blue-200 text-blue-800' : 'bg-purple-200 text-purple-800'
                            }`}>
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

