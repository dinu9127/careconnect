import React, { useState, useEffect } from 'react'
import { Search, MapPin, Star, Calendar, ChevronDown, AlertCircle, Loader } from 'lucide-react'
import Navbar from '../../components/layout/Navbar'
import Sidebar from '../../components/layout/Sidebar'
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
    alert('Booking created successfully!')
  }

  const CaregiverCard = ({ caregiver }) => {
    const userData = caregiver.user || {}
    
    return (
      <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-teal-100 hover:border-teal-300 group">
        <div className="p-6">
          <div className="flex gap-4 mb-4">
            {/* Profile Image */}
            <div className="relative flex-shrink-0">
              <img
                src={caregiver.profileImage || `https://via.placeholder.com/150/4A5568/FFFFFF?text=${userData.name?.split(' ')[0]}`}
                alt={userData.name}
                className="w-24 h-24 rounded-xl object-cover ring-2 ring-teal-200 group-hover:ring-teal-400 transition"
                onError={(e) => {
                  e.target.src = `https://via.placeholder.com/150/4A5568/FFFFFF?text=${userData.name?.split(' ')[0]}`
                }}
              />
              <div className="absolute -top-1 -right-1 bg-teal-600 rounded-full p-1 shadow-lg">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            </div>

            {/* Caregiver Info */}
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-gray-900 mb-1 truncate">
                {userData.name}
              </h3>
              <p className="text-sm text-gray-600 mb-2">{caregiver.specialization}</p>

              {/* Rating */}
              <div className="flex items-center gap-2 mb-2">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span className="text-sm font-semibold text-gray-900">{caregiver.rating}</span>
                </div>
                <span className="text-sm text-gray-500">({caregiver.reviewCount} Reviews)</span>
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-2 mb-4">
            {/* Location */}
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="w-4 h-4 text-teal-600" />
              <span>{caregiver.location}</span>
            </div>

            {/* Hourly Rate */}
            <div className="flex items-center gap-2 text-sm text-teal-700 font-semibold">
              <span>Rs. {caregiver.hourlyRate}/hour</span>
            </div>
          </div>

          {/* Service Types */}
          <div className="flex flex-wrap gap-2 mb-4">
            {caregiver.serviceTypes?.slice(0, 2).map((service) => (
              <span
                key={service}
                className="px-3 py-1 bg-teal-50 text-teal-700 text-xs font-semibold rounded-full border border-teal-200"
              >
                {service}
              </span>
            ))}
            {caregiver.serviceTypes?.length > 2 && (
              <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-full">
                +{caregiver.serviceTypes.length - 2}
              </span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => handleViewProfile(caregiver)}
              className="flex-1 px-4 py-2 border-2 border-teal-600 text-teal-600 font-semibold rounded-xl hover:bg-teal-50 transition-all duration-300 hover:shadow-md"
            >
              View Profile
            </button>
            <button
              onClick={() => handleBookNow(caregiver)}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-teal-600 to-teal-700 text-white font-semibold rounded-xl hover:from-teal-700 hover:to-teal-800 transition-all duration-300 hover:shadow-lg"
            >
              Book Now
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-50 to-teal-50">
      <Navbar />
      <div className="flex">
        <Sidebar role="client" />
        <main className="flex-1 p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Find Caregivers</h1>
            <p className="text-gray-600">Search and book verified professional caregivers in Sri Lanka</p>
          </div>

          {/* Search and Filter Section */}
          <div className="bg-white rounded-2xl shadow-md p-6 mb-8 border border-teal-100">
            <div className="grid md:grid-cols-4 gap-4">
              {/* Search Input */}
              <div className="relative md:col-span-2">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-teal-600" />
                <input
                  type="text"
                  placeholder="Search by caregiver name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent transition"
                />
              </div>

              {/* Location Filter */}
              <div className="relative">
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent transition appearance-none bg-white cursor-pointer"
                >
                  {locations.map(location => (
                    <option key={location} value={location}>{location}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>

              {/* Service Filter */}
              <div className="relative">
                <select
                  value={selectedService}
                  onChange={(e) => setSelectedService(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent transition appearance-none bg-white cursor-pointer"
                >
                  {services.map(service => (
                    <option key={service} value={service}>{service}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-8 flex items-gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700 font-medium">{error}</p>
            </div>
          )}

          {/* Loading State */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader className="w-12 h-12 text-teal-600 animate-spin mb-4" />
              <p className="text-gray-600 font-medium">Loading caregivers...</p>
            </div>
          ) : caregivers.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-10 h-10 text-teal-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No caregivers found</h3>
              <p className="text-gray-600">Try adjusting your search or filters</p>
            </div>
          ) : (
            <>
              {/* All Caregivers Section */}
              <div className="mb-12">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-1 h-6 bg-teal-600 rounded"></div>
                  <h2 className="text-2xl font-bold text-gray-900">Available Caregivers</h2>
                  <span className="ml-auto text-gray-600 font-medium">({caregivers.length})</span>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {caregivers.map((caregiver) => (
                    <CaregiverCard key={caregiver._id} caregiver={caregiver} />
                  ))}
                </div>
              </div>

              {/* Results Summary */}
              <div className="mt-12 text-center text-gray-600 pb-8 font-medium">
                <p>Showing {caregivers.length} verified caregiver{caregivers.length !== 1 ? 's' : ''}</p>
              </div>
            </>
          )}
        </main>
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

