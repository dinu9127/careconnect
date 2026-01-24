import React, { useState, useEffect } from 'react'
import { Search, MapPin, Star, Calendar, ChevronDown, AlertCircle, Loader } from 'lucide-react'
import Navbar from '../../components/layout/Navbar'
import CaregiverProfileModal from '../../components/ui/CaregiverProfileModal'
import BookingModal from '../../components/ui/BookingModal'
import axios from 'axios'

const Caregivers = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedService, setSelectedService] = useState('All Services')
  const [selectedLocation, setSelectedLocation] = useState('All Locations')
  const [caregivers, setCaregivers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  // Modal states
  const [selectedCaregiverProfile, setSelectedCaregiverProfile] = useState(null)
  const [profileModalOpen, setProfileModalOpen] = useState(false)
  const [bookingModalOpen, setBookingModalOpen] = useState(false)
  const [selectedCaregiverForBooking, setSelectedCaregiverForBooking] = useState(null)

  const locations = [
    'All Locations',
    'Colombo',
    'Kandy',
    'Galle',
    'Jaffna',
    'Trincomalee',
    'Matara',
    'Negombo',
    'Badulla',
    'Ratnapura',
    'Anuradhapura',
    'Polonnaruwa',
    'Ampara',
    'Batticaloa',
    'Mullaitvu',
    'Vavuniya'
  ]

  const services = [
    'All Services',
    'Childcare',
    'Elderly Care',
    'Hospital Companion Care',
    'Disability Support'
  ]

  // Fetch caregivers
  useEffect(() => {
    const fetchCaregivers = async () => {
      try {
        setLoading(true)
        setError('')

        const params = new URLSearchParams()
        if (searchQuery) params.append('name', searchQuery)
        if (selectedLocation !== 'All Locations') params.append('location', selectedLocation)
        if (selectedService !== 'All Services') params.append('serviceType', selectedService)

        const response = await axios.get(`/api/caregivers?${params.toString()}`)

        if (response.data.success) {
          setCaregivers(response.data.data || [])
        }
      } catch (err) {
        setError('Failed to load caregivers. Please try again.')
        console.error('Error fetching caregivers:', err)
      } finally {
        setLoading(false)
      }
    }

    const debounceTimer = setTimeout(() => {
      fetchCaregivers()
    }, 500)

    return () => clearTimeout(debounceTimer)
  }, [searchQuery, selectedService, selectedLocation])

  const handleViewProfile = (caregiver) => {
    setSelectedCaregiverProfile(caregiver)
    setProfileModalOpen(true)
  }

  const handleBookNow = (caregiver) => {
    setSelectedCaregiverForBooking(caregiver)
    setBookingModalOpen(true)
  }

  const handleBookingSuccess = () => {
    setBookingModalOpen(false)
    setSelectedCaregiverForBooking(null)
    // Optionally show success message or redirect
    alert('Booking created successfully!')
  }

  // Categorize caregivers by availability
  const categorizeCaregivers = () => {
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const todayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][today.getDay()]
    const tomorrowName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][tomorrow.getDay()]

    const categorized = {
      available: [],
      limited: [],
      unavailable: []
    }

    caregivers.forEach(caregiver => {
      const todayAvailable = caregiver.availability?.some(avail => avail.day === todayName)
      const tomorrowAvailable = caregiver.availability?.some(avail => avail.day === tomorrowName)

      if (todayAvailable || tomorrowAvailable) {
        categorized.available.push(caregiver)
      } else if (caregiver.availability?.length > 0) {
        categorized.limited.push(caregiver)
      } else {
        categorized.unavailable.push(caregiver)
      }
    })

    return categorized
  }

  const categorized = categorizeCaregivers()

  const CaregiverCard = ({ caregiver }) => {
    const userData = caregiver.user || {}
    
    return (
      <div className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-slate-100 hover:border-teal-200">
        <div className="p-6">
          <div className="flex gap-4 mb-4">
            {/* Profile Image */}
            <div className="relative flex-shrink-0">
              <img
                src={caregiver.profileImage || `https://via.placeholder.com/150/4A5568/FFFFFF?text=${userData.name?.split(' ')[0]}`}
                alt={userData.name}
                className="w-24 h-24 rounded-xl object-cover ring-2 ring-slate-100"
                onError={(e) => {
                  e.target.src = `https://via.placeholder.com/150/4A5568/FFFFFF?text=${userData.name?.split(' ')[0]}`
                }}
              />
              <div className="absolute -top-1 -right-1 bg-teal-500 rounded-full p-1">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            </div>

            {/* Caregiver Info */}
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-slate-900 mb-1 truncate">
                {userData.name}
              </h3>
              <p className="text-sm text-slate-600 mb-2">{caregiver.specialization}</p>

              {/* Rating */}
              <div className="flex items-center gap-2 mb-2">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span className="text-sm font-semibold text-slate-900">{caregiver.rating}</span>
                </div>
                <span className="text-sm text-slate-500">({caregiver.reviewCount} Reviews)</span>
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-2 mb-4">
            {/* Location */}
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <MapPin className="w-4 h-4 text-slate-400" />
              <span>{caregiver.location}</span>
            </div>

            {/* Availability */}
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span>{caregiver.availability?.length || 0} days available</span>
            </div>

            {/* Hourly Rate */}
            <div className="flex items-center gap-2 text-sm text-teal-600 font-semibold">
              <span>Rs. {caregiver.hourlyRate}/hour</span>
            </div>
          </div>

          {/* Service Types */}
          <div className="flex flex-wrap gap-2 mb-4">
            {caregiver.serviceTypes?.slice(0, 2).map((service) => (
              <span
                key={service}
                className="px-2 py-1 bg-teal-50 text-teal-700 text-xs font-medium rounded-full"
              >
                {service}
              </span>
            ))}
            {caregiver.serviceTypes?.length > 2 && (
              <span className="px-2 py-1 bg-slate-100 text-slate-700 text-xs font-medium rounded-full">
                +{caregiver.serviceTypes.length - 2}
              </span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => handleViewProfile(caregiver)}
              className="flex-1 px-4 py-2 border-2 border-teal-600 text-teal-600 font-semibold rounded-xl hover:bg-teal-50 transition"
            >
              View Profile
            </button>
            <button
              onClick={() => handleBookNow(caregiver)}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-teal-600 to-cyan-600 text-white font-semibold rounded-xl hover:from-teal-700 hover:to-cyan-700 transition"
            >
              Book Now
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Find Caregivers</h1>
          <p className="text-slate-600">Search and book verified professional caregivers in Sri Lanka</p>
        </div>

        {/* Search and Filter Section */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
          <div className="grid md:grid-cols-4 gap-4">
            {/* Search Input */}
            <div className="relative md:col-span-2">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search by caregiver name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
              />
            </div>

            {/* Location Filter */}
            <div className="relative">
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition appearance-none bg-white cursor-pointer"
              >
                {locations.map(location => (
                  <option key={location} value={location}>{location}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
            </div>

            {/* Service Filter */}
            <div className="relative">
              <select
                value={selectedService}
                onChange={(e) => setSelectedService(e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition appearance-none bg-white cursor-pointer"
              >
                {services.map(service => (
                  <option key={service} value={service}>{service}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-8 flex items-gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader className="w-12 h-12 text-teal-600 animate-spin mb-4" />
            <p className="text-slate-600">Loading caregivers...</p>
          </div>
        ) : caregivers.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No caregivers found</h3>
            <p className="text-slate-600">Try adjusting your search or filters</p>
          </div>
        ) : (
          <>
            {/* Available Now Section */}
            {categorized.available.length > 0 && (
              <div className="mb-12">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-1 h-6 bg-green-500 rounded"></div>
                  <h2 className="text-2xl font-bold text-slate-900">Available Today</h2>
                  <span className="ml-auto text-slate-600">({categorized.available.length})</span>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {categorized.available.map((caregiver) => (
                    <CaregiverCard key={caregiver._id} caregiver={caregiver} />
                  ))}
                </div>
              </div>
            )}

            {/* Limited Availability Section */}
            {categorized.limited.length > 0 && (
              <div className="mb-12">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-1 h-6 bg-amber-500 rounded"></div>
                  <h2 className="text-2xl font-bold text-slate-900">Limited Availability</h2>
                  <span className="ml-auto text-slate-600">({categorized.limited.length})</span>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {categorized.limited.map((caregiver) => (
                    <CaregiverCard key={caregiver._id} caregiver={caregiver} />
                  ))}
                </div>
              </div>
            )}

            {/* Unavailable Section */}
            {categorized.unavailable.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-1 h-6 bg-slate-300 rounded"></div>
                  <h2 className="text-2xl font-bold text-slate-900">Not Available</h2>
                  <span className="ml-auto text-slate-600">({categorized.unavailable.length})</span>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {categorized.unavailable.map((caregiver) => (
                    <CaregiverCard key={caregiver._id} caregiver={caregiver} />
                  ))}
                </div>
              </div>
            )}

            {/* Results Summary */}
            <div className="mt-12 text-center text-slate-600 pb-8">
              <p>Showing {caregivers.length} verified caregiver{caregivers.length !== 1 ? 's' : ''}</p>
            </div>
          </>
        )}
      </div>

      {/* Modals */}
      <CaregiverProfileModal
        caregiver={selectedCaregiverProfile}
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        onBookNow={handleBookNow}
      />

      <BookingModal
        caregiver={selectedCaregiverForBooking}
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        onSuccess={handleBookingSuccess}
      />
    </div>
  )
}

export default Caregivers
