import React, { useState, useEffect } from 'react'
import Navbar from '../../components/layout/Navbar'
import Sidebar from '../../components/layout/Sidebar'
import { Calendar, Clock, Plus, X } from 'lucide-react'
import api from '../../services/api'

const UpdateAvailability = () => {
  const [availability, setAvailability] = useState([])
  const [selectedDate, setSelectedDate] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetchAvailability()
  }, [])

  const fetchAvailability = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'))
      const response = await api.get(`/api/caregivers/${user.id}`)
      setAvailability(response.data.availability || [])
    } catch (error) {
      console.error('Error fetching availability:', error)
    }
  }

  const addAvailability = async () => {
    if (!selectedDate || !startTime || !endTime) {
      setMessage('Please fill all fields')
      return
    }

    setLoading(true)
    try {
      const user = JSON.parse(localStorage.getItem('user'))
      const newSlot = {
        date: selectedDate,
        startTime,
        endTime
      }

      const response = await api.put(`/api/caregivers/${user.id}`, {
        availability: [...availability, newSlot]
      })

      setAvailability(response.data.availability)
      setSelectedDate('')
      setStartTime('')
      setEndTime('')
      setMessage('Availability added successfully!')
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      setMessage('Error adding availability')
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const removeAvailability = async (index) => {
    setLoading(true)
    try {
      const user = JSON.parse(localStorage.getItem('user'))
      const updatedAvailability = availability.filter((_, i) => i !== index)

      const response = await api.put(`/api/caregivers/${user.id}`, {
        availability: updatedAvailability
      })

      setAvailability(response.data.availability)
      setMessage('Availability removed successfully!')
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      setMessage('Error removing availability')
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex">
        <Sidebar role="caregiver" />
        <main className="flex-1 p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Update Availability</h1>

          {message && (
            <div className={`p-4 mb-6 rounded-lg ${message.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
              {message}
            </div>
          )}

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Add Availability Form */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Add New Availability
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>

                <button
                  onClick={addAvailability}
                  disabled={loading}
                  className="w-full bg-teal-600 text-white py-3 rounded-lg font-medium hover:bg-teal-700 transition disabled:bg-gray-400"
                >
                  {loading ? 'Adding...' : 'Add Availability'}
                </button>
              </div>
            </div>

            {/* Current Availability List */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Current Availability
              </h2>

              {availability.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No availability added yet</p>
              ) : (
                <div className="space-y-3">
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
        </main>
      </div>
    </div>
  )
}

export default UpdateAvailability
