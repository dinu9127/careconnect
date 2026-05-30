import React, { useState, useEffect } from 'react'
import { Search, MapPin, Star, Calendar, ChevronDown, AlertCircle, Loader, LocateFixed } from 'lucide-react'
import Navbar from '../../components/layout/Navbar'
import Sidebar from '../../components/layout/Sidebar'
import CaregiverProfileModal from '../../components/ui/CaregiverProfileModal'
import BookingModal from '../../components/ui/BookingModal'
import { getAvatarPlaceholder } from '../../utils/avatar'
import axios from 'axios'
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet'
import L from 'leaflet'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow
})

const caregiverPin = new L.Icon({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})

const Caregivers = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedService, setSelectedService] = useState('All Services')
  const [selectedDistrict, setSelectedDistrict] = useState('All Locations')

  const [caregivers, setCaregivers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [useNearby, setUseNearby] = useState(false)
  const [userCoords, setUserCoords] = useState(null)
  const [radiusKm, setRadiusKm] = useState(10)
  const [locationError, setLocationError] = useState('')
  
  // Modal states
  const [selectedCaregiverProfile, setSelectedCaregiverProfile] = useState(null)
  const [profileModalOpen, setProfileModalOpen] = useState(false)
  const [bookingModalOpen, setBookingModalOpen] = useState(false)
  const [selectedCaregiverForBooking, setSelectedCaregiverForBooking] = useState(null)

  const services = [
    'All Services',
    'Childcare',
    'Elderly Care',
    'Hospital Companion Care',
    'Disability Support'
  ]

  const districts = [
    'All Locations',
    'Colombo', 'Gampaha', 'Kalutara',
    'Kandy', 'Matale', 'Nuwara Eliya',
    'Galle', 'Matara', 'Hambantota',
    'Jaffna', 'Kilinochchi', 'Mannar', 'Mullaitivu', 'Vavuniya',
    'Puttalam', 'Kurunegala',
    'Anuradhapura', 'Polonnaruwa',
    'Trincomalee', 'Batticaloa', 'Ampara',
    'Badulla', 'Monaragala',
    'Ratnapura', 'Kegalle'
  ]

  const requestUserLocation = () => {
    setLocationError('')
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser')
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserCoords({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        })
        setUseNearby(true)
      },
      () => {
        setLocationError('Unable to access your location. Please allow location access.')
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  // Fetch caregivers
  useEffect(() => {
    const fetchCaregivers = async () => {
      try {
        setLoading(true)
        setError('')

        const params = new URLSearchParams()
      
        if (selectedService !== 'All Services') params.append('serviceType', selectedService)

        let caregiversData = []

        if (useNearby && userCoords) {
          params.append('lat', userCoords.lat)
          params.append('lng', userCoords.lng)
          params.append('radiusKm', radiusKm)
          if (selectedDistrict && selectedDistrict !== 'All Locations') params.append('district', selectedDistrict)
          const response = await axios.get(`/api/caregivers/nearby?${params.toString()}`)
          caregiversData = response.data.data || []
        } else {
          if (searchQuery) params.append('name', searchQuery)
          if (selectedDistrict && selectedDistrict !== 'All Locations') params.append('district', selectedDistrict)
          const response = await axios.get(`/api/caregivers?${params.toString()}`)
          caregiversData = response.data.data || []
        }

        if (searchQuery) {
          const query = searchQuery.toLowerCase()
          caregiversData = caregiversData.filter((caregiver) =>
            caregiver.user?.name?.toLowerCase().includes(query)
          )
        }

        setCaregivers(caregiversData)
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
  }, [searchQuery, selectedService, useNearby, userCoords, radiusKm])

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

  const mapCenter = userCoords ? [userCoords.lat, userCoords.lng] : [7.8731, 80.7718]
  const mapZoom = userCoords ? 11 : 7

  const CaregiverCard = ({ caregiver }) => {
    const userData = caregiver.user || {}
    const avatarSrc = caregiver.profileImage || getAvatarPlaceholder(userData.name)
    
    return (
      <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-teal-100 hover:border-teal-300 group">
        <div className="p-6">
          <div className="flex gap-4 mb-4">
            {/* Profile Image */}
            <div className="relative flex-shrink-0">
              <img
                src={avatarSrc}
                alt={userData.name}
                className="w-24 h-24 rounded-xl object-cover ring-2 ring-teal-200 group-hover:ring-teal-400 transition"
                onError={(e) => {
                  e.currentTarget.onerror = null
                  e.currentTarget.src = getAvatarPlaceholder(userData.name)
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
              {caregiver.specialization && caregiver.specialization !== 'Not specified' && (
                <p className="text-sm text-gray-600 mb-2">{caregiver.specialization}</p>
              )}

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
            {Number.isFinite(caregiver.distanceKm) && (
              <div className="text-xs text-teal-700 font-medium">
                {caregiver.distanceKm.toFixed(1)} km away
              </div>
            )}

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
    <div className="h-screen bg-gradient-to-br from-slate-50 via-slate-50 to-teal-50 overflow-hidden">
      <Navbar isFixed />
      <div className="flex pt-16 h-full">
        <Sidebar role="client" isFixed />
        <main className="flex-1 p-8 overflow-y-auto md:ml-64 h-[calc(100vh-4rem)]">
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
                {/* District Filter */}
                <div className="relative">
                  <select
                    value={selectedDistrict}
                    onChange={(e) => setSelectedDistrict(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent transition appearance-none bg-white cursor-pointer"
                  >
                    {districts.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3">
               <button
                type="button"
                onClick={() => {
                  setUseNearby(false)
                  setUserCoords(null)
                }}
                className="inline-flex items-center gap-2 px-4 py-2 border border-teal-600 text-teal-700 rounded-lg hover:bg-teal-50 transition"
              >
                Show All Caregivers
              </button>
              <button
                type="button"
                onClick={requestUserLocation}
                className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition"
              >
                <LocateFixed className="w-4 h-4" />
                Use My Location
              </button>

             

              

              <div className="flex items-center gap-2 text-sm text-gray-700">
                <span>Radius</span>
                <select
                  value={radiusKm}
                  onChange={(e) => setRadiusKm(Number(e.target.value))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-transparent"
                >
                  {[2, 5, 10, 20, 30, 50].map((radius) => (
                    <option key={radius} value={radius}>{radius} km</option>
                  ))}
                </select>
              </div>

              <div className="ml-auto">
                <span
                  onClick={() => {
                    // Reset all filters to defaults
                    setSearchQuery('')
                    setSelectedService('All Services')
                    setSelectedDistrict('All Locations')
                    setUseNearby(false)
                    setUserCoords(null)
                    setRadiusKm(10)
                    setLocationError('')
                  }}
                  className="text-sm text-gray-600 hover:underline cursor-pointer"
                >
                  Reset Filters
                </span>
              </div>

              {useNearby && userCoords && (
                <span className="text-sm text-teal-700 font-medium">Nearby search active</span>
              )}
            </div>

            {locationError && (
              <p className="mt-3 text-sm text-red-600">{locationError}</p>
            )}
          </div>

          {/* Map Section */}
          <div className="bg-white rounded-2xl shadow-md p-4 mb-8 border border-teal-100">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-gray-900">Caregivers Map</h2>
              <span className="text-sm text-gray-600">Markers show verified caregivers</span>
            </div>
            <div className="h-[420px] w-full rounded-xl overflow-hidden">
              <MapContainer center={mapCenter} zoom={mapZoom} scrollWheelZoom className="h-full w-full">
                <TileLayer
                  attribution="&copy; OpenStreetMap contributors"
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {userCoords && (
                  <>
                    <Marker position={[userCoords.lat, userCoords.lng]} icon={caregiverPin}>
                      <Popup>You are here</Popup>
                    </Marker>
                    <Circle
                      center={[userCoords.lat, userCoords.lng]}
                      radius={radiusKm * 1000}
                      pathOptions={{ color: '#0f766e', fillColor: '#99f6e4', fillOpacity: 0.2 }}
                    />
                  </>
                )}

                {caregivers
                  .filter((caregiver) => caregiver.geoLocation?.coordinates?.length === 2)
                  .map((caregiver) => (
                    <Marker
                      key={caregiver._id}
                      position={[caregiver.geoLocation.coordinates[1], caregiver.geoLocation.coordinates[0]]}
                      icon={caregiverPin}
                    >
                      <Popup>
                        <div className="text-sm">
                          <div className="font-semibold">{caregiver.user?.name || 'Caregiver'}</div>
                          <div>{caregiver.location}</div>
                          {Number.isFinite(caregiver.distanceKm) && (
                            <div>{caregiver.distanceKm.toFixed(1)} km away</div>
                          )}
                        </div>
                      </Popup>
                    </Marker>
                  ))}
              </MapContainer>
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

