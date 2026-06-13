import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import { User, Phone, MapPin, Save, X, Search, LocateFixed, CheckCircle, AlertCircle } from 'lucide-react'
import Navbar from '../../components/layout/Navbar'
import Sidebar from '../../components/layout/Sidebar'
import { authService, userService } from '../../services/api'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow
})

const mapPin = new L.Icon({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})

const LocationPicker = ({ onSelect }) => {
  useMapEvents({
    click: (event) => onSelect(event.latlng)
  })

  return null
}

const ClientProfile = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [locationSearchQuery, setLocationSearchQuery] = useState('')
  const [locationSearchResults, setLocationSearchResults] = useState([])
  const [locationSearchError, setLocationSearchError] = useState('')
  const [locationSearching, setLocationSearching] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    careReceiverName: '',
    careReceiverRelationship: '',
    specialNotes: '',
    latitude: '',
    longitude: ''
  })

  const defaultCenter = [7.8731, 80.7718]
  const hasCoords = Number.isFinite(Number(formData.latitude)) && Number.isFinite(Number(formData.longitude))
  const mapCenter = hasCoords ? [Number(formData.latitude), Number(formData.longitude)] : defaultCenter
  const mapZoom = hasCoords ? 13 : 7

  const completeness = [
    formData.name,
    formData.phone,
    formData.address,
    formData.careReceiverName,
    formData.careReceiverRelationship,
    formData.latitude,
    formData.longitude
  ]

  const isComplete = completeness.every(value => String(value || '').trim() !== '')

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const response = await authService.getProfile()
      const user = response.data.data
      const coords = user.geoLocation?.coordinates

      setFormData({
        name: user.name || '',
        phone: user.phone || '',
        address: user.address || '',
        careReceiverName: user.careReceiverName || '',
        careReceiverRelationship: user.careReceiverRelationship || '',
        specialNotes: user.specialNotes || '',
        latitude: Array.isArray(coords) && coords.length === 2 ? String(coords[1]) : '',
        longitude: Array.isArray(coords) && coords.length === 2 ? String(coords[0]) : ''
      })
    } catch (error) {
      if (error.response?.status === 401) {
        navigate('/login')
        return
      }
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to load profile' })
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    if (name === 'phone') {
      const digitsOnly = value.replace(/\D/g, '').slice(0, 10)
      setFormData(prev => ({ ...prev, [name]: digitsOnly }))
      return
    }
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleUseCurrentLocation = () => {
    setLocationSearchError('')
    if (!navigator.geolocation) {
      setLocationSearchError('Geolocation is not supported by your browser')
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        setFormData(prev => ({
          ...prev,
          latitude: latitude.toFixed(6),
          longitude: longitude.toFixed(6)
        }))
      },
      () => {
        setLocationSearchError('Unable to fetch your location. Please allow location access.')
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  const handleLocationSearch = async () => {
    const query = locationSearchQuery.trim()
    if (!query) {
      setLocationSearchResults([])
      setLocationSearchError('')
      return
    }

    setLocationSearching(true)
    setLocationSearchError('')

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&countrycodes=lk`
      )
      const data = await response.json()
      const results = Array.isArray(data) ? data : []

      if (results.length === 0) {
        setLocationSearchError('No places found. Try a different search.')
      }

      setLocationSearchResults(results)
    } catch (error) {
      setLocationSearchError('Search failed. Please try again.')
    } finally {
      setLocationSearching(false)
    }
  }

  const handleMapSelect = ({ lat, lng }) => {
    setFormData(prev => ({
      ...prev,
      latitude: lat.toFixed(6),
      longitude: lng.toFixed(6)
    }))
  }

  const handleSave = async () => {
    const requiredFields = [
      ['Full name', formData.name],
      ['Phone number', formData.phone],
      ["Care receiver's name", formData.careReceiverName],
      ['Address', formData.address],
      ['Relationship to care receiver', formData.careReceiverRelationship],
      ['Map location', formData.latitude && formData.longitude]
    ]

    const missing = requiredFields
      .filter(([, value]) => !String(value || '').trim())
      .map(([label]) => label)

    if (String(formData.phone || '').trim() && !/^\d{10}$/.test(formData.phone)) {
      setMessage({
        type: 'error',
        text: 'Phone number must be exactly 10 digits.'
      })
      return
    }

    if (missing.length > 0) {
      setMessage({
        type: 'error',
        text: `Please complete your profile before saving. Missing: ${missing.join(', ')}.`
      })
      return
    }

    try {
      setSaving(true)
      setMessage({ type: '', text: '' })

      const payload = {
        name: formData.name,
        phone: formData.phone,
        address: formData.address,
        careReceiverName: formData.careReceiverName,
        careReceiverRelationship: formData.careReceiverRelationship,
        specialNotes: formData.specialNotes,
        latitude: formData.latitude,
        longitude: formData.longitude
      }

      const response = await userService.updateCurrentUser(payload)
      const updatedUser = response.data.data
      localStorage.setItem('user', JSON.stringify(updatedUser))
      setMessage({ type: 'success', text: 'Profile updated successfully' })
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to update profile'
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50 overflow-hidden">
      <Navbar isFixed />
      <div className="flex pt-16 h-full">
        <Sidebar role="client" isFixed />
        <main className="flex-1 p-8 overflow-y-auto md:ml-64 h-[calc(100vh-4rem)]">
          <div className="max-w-6xl mx-auto space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-teal-100 overflow-hidden">
              <div className="bg-gradient-to-r from-teal-600 to-cyan-600 px-6 py-8">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center">
                    <User className="w-10 h-10 text-teal-600" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-white">Client Profile</h1>
                    <p className="text-teal-100">Update your personal and care-receiver details</p>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {message.text && (
                  <div className={`rounded-xl border px-4 py-3 text-sm flex items-start gap-3 ${message.type === 'error'
                    ? 'bg-red-50 text-red-700 border-red-200'
                    : 'bg-green-50 text-green-700 border-green-200'
                    }`}>
                    {message.type === 'error' ? <AlertCircle className="w-5 h-5 mt-0.5" /> : <CheckCircle className="w-5 h-5 mt-0.5" />}
                    <p>{message.text}</p>
                  </div>
                )}

                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div>

                    <p className="text-sm text-slate-600">Complete all required fields so bookings can be submitted without interruption.</p>
                  </div>

                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                  <section className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                    <h3 className="text-lg font-semibold text-slate-900 mb-4">Personal Information</h3>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                        <div className="relative">
                          <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                            placeholder="Enter your full name"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                        <div className="relative">
                          <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            inputMode="numeric"
                            maxLength="10"
                            pattern="[0-9]{10}"
                            className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                            placeholder="07X XXX XXXX"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
                        <div className="relative">
                          <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                            placeholder="Home address"
                          />
                        </div>
                      </div>
                    </div>
                  </section>

                  <section className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                    <h3 className="text-lg font-semibold text-slate-900 mb-4">Care Receiver Details</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Care Receiver's Name</label>
                        <input
                          name="careReceiverName"
                          value={formData.careReceiverName}
                          onChange={handleChange}
                          className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                          placeholder="Enter care receiver's name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Relationship to Care Receiver</label>
                        <input
                          name="careReceiverRelationship"
                          value={formData.careReceiverRelationship}
                          onChange={handleChange}
                          className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                          placeholder="E.g. Son, daughter, spouse"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Special Notes</label>
                        <textarea
                          name="specialNotes"
                          value={formData.specialNotes}
                          onChange={handleChange}
                          rows="4"
                          className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                          placeholder="Optional details about care needs, preferences, or instructions"
                        />
                      </div>
                    </div>
                  </section>
                </div>

                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between gap-4 flex-wrap mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">Location on Map</h3>
                      <p className="text-sm text-slate-600">Select your location so caregivers can understand where the booking is needed.</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={handleUseCurrentLocation}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-teal-50 text-teal-700 hover:bg-teal-100 transition"
                      >
                        <LocateFixed className="w-4 h-4" />
                        Use Current Location
                      </button>


                    </div>
                  </div>

                  <div className="grid gap-3 md:grid-cols-[1fr_auto] mb-4">
                    <input
                      value={locationSearchQuery}
                      onChange={(e) => setLocationSearchQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          handleLocationSearch()
                        }
                      }}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                      placeholder="Search a location in Sri Lanka"
                    />
                  </div>

                  {locationSearchError && (
                    <p className="text-sm text-red-600 mb-3">{locationSearchError}</p>
                  )}

                  {locationSearchResults.length > 0 && (
                    <div className="space-y-2 mb-4">
                      {locationSearchResults.map((result) => {
                        const lat = Number.parseFloat(result.lat)
                        const lng = Number.parseFloat(result.lon)
                        return (
                          <button
                            key={result.place_id}
                            type="button"
                            onClick={() => {
                              handleMapSelect({ lat, lng })
                              setLocationSearchResults([])
                              setLocationSearchQuery(result.display_name)
                            }}
                            className="w-full text-left rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 hover:bg-slate-100 transition"
                          >
                            <div className="font-medium text-slate-900">{result.display_name}</div>
                          </button>
                        )
                      })}
                    </div>
                  )}

                  <div className="rounded-2xl overflow-hidden border border-slate-200">
                    <MapContainer center={mapCenter} zoom={mapZoom} scrollWheelZoom className="h-96 w-full">
                      <TileLayer
                        attribution="&copy; OpenStreetMap contributors"
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />
                      <LocationPicker onSelect={handleMapSelect} />
                      {hasCoords && (
                        <Marker position={[Number(formData.latitude), Number(formData.longitude)]} icon={mapPin} />
                      )}
                    </MapContainer>
                  </div>

                  <p className="mt-2 text-xs text-slate-500">
                    Tap the map or use search/current location to set your booking location.
                  </p>
                </section>

                <div className="flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => navigate('/client/dashboard')}
                    className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-teal-600 text-white hover:bg-teal-700 transition disabled:opacity-60"
                  >
                    <Save className="w-4 h-4" />
                    {saving ? 'Saving...' : 'Save Profile'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main >
      </div >
    </div >
  )
}

export default ClientProfile
