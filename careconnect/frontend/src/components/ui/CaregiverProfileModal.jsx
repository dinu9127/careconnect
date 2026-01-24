import React from 'react'
import { X, Star, MapPin, Clock, Award, Phone, Mail, DollarSign } from 'lucide-react'

const CaregiverProfileModal = ({ caregiver, isOpen, onClose, onBookNow }) => {
  if (!isOpen || !caregiver) return null

  const userData = caregiver.user || {}

  const getAvailabilityDisplay = () => {
    if (!caregiver.availability || caregiver.availability.length === 0) {
      return 'Currently Unavailable'
    }
    const days = caregiver.availability.map(a => a.day.slice(0, 3)).join(', ')
    return `Available: ${days}`
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-teal-600 to-cyan-600 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Profile</h2>
          <button
            onClick={onClose}
            className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Profile Section */}
          <div className="flex gap-6 mb-8 pb-8 border-b border-slate-200">
            <div>
              <img
                src={caregiver.profileImage || `https://via.placeholder.com/150/4A5568/FFFFFF?text=${userData.name?.split(' ')[0]}`}
                alt={userData.name}
                className="w-32 h-32 rounded-xl object-cover ring-2 ring-slate-200"
              />
            </div>
            <div className="flex-1">
              <h3 className="text-3xl font-bold text-slate-900 mb-2">{userData.name}</h3>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-1">
                  <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                  <span className="font-bold text-lg text-slate-900">{caregiver.rating}</span>
                  <span className="text-slate-600">({caregiver.reviewCount} reviews)</span>
                </div>
              </div>
              <p className="text-slate-600 mb-4">{caregiver.specialization}</p>
              <div className="flex flex-wrap gap-2">
                {caregiver.serviceTypes?.map((service, index) => (
                  <span key={index} className="px-3 py-1 bg-teal-50 text-teal-700 text-sm font-medium rounded-full">
                    {service}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="mb-8 pb-8 border-b border-slate-200">
            <h4 className="text-lg font-bold text-slate-900 mb-4">Contact Information</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-slate-400" />
                <span className="text-slate-700">{userData.email}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-slate-400" />
                <span className="text-slate-700">{userData.phone}</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-slate-400" />
                <span className="text-slate-700">{caregiver.location}</span>
              </div>
            </div>
          </div>

          {/* Professional Information */}
          <div className="mb-8 pb-8 border-b border-slate-200">
            <h4 className="text-lg font-bold text-slate-900 mb-4">Professional Information</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 text-slate-600 mb-1">
                  <Award className="w-4 h-4" />
                  <span className="text-sm">Experience</span>
                </div>
                <p className="text-xl font-bold text-slate-900">{caregiver.experience} years</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 text-slate-600 mb-1">
                  <DollarSign className="w-4 h-4" />
                  <span className="text-sm">Hourly Rate</span>
                </div>
                <p className="text-xl font-bold text-slate-900">Rs. {caregiver.hourlyRate}</p>
              </div>
            </div>
          </div>

          {/* About */}
          {caregiver.bio && (
            <div className="mb-8 pb-8 border-b border-slate-200">
              <h4 className="text-lg font-bold text-slate-900 mb-3">About</h4>
              <p className="text-slate-700">{caregiver.bio}</p>
            </div>
          )}

          {/* Availability */}
          <div className="mb-8">
            <h4 className="text-lg font-bold text-slate-900 mb-4">Availability</h4>
            <div className="bg-slate-50 p-4 rounded-lg">
              {caregiver.availability && caregiver.availability.length > 0 ? (
                <div className="space-y-2">
                  {caregiver.availability.map((avail, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-teal-600" />
                      <span className="text-slate-700">
                        <strong>{avail.day}</strong>: {avail.startTime} - {avail.endTime}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-600">No availability information</p>
              )}
            </div>
          </div>

          {/* Certifications */}
          {caregiver.certifications && caregiver.certifications.length > 0 && (
            <div className="mb-8">
              <h4 className="text-lg font-bold text-slate-900 mb-4">Certifications</h4>
              <div className="space-y-2">
                {caregiver.certifications.map((cert, index) => (
                  <div key={index} className="bg-slate-50 p-3 rounded-lg">
                    <p className="font-semibold text-slate-900">{cert.name}</p>
                    <p className="text-sm text-slate-600">{cert.issuer}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 border-2 border-slate-200 text-slate-900 font-semibold rounded-xl hover:bg-slate-50 transition"
            >
              Close
            </button>
            <button
              onClick={() => {
                onBookNow(caregiver)
                onClose()
              }}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-teal-600 to-cyan-600 text-white font-semibold rounded-xl hover:from-teal-700 hover:to-cyan-700 transition"
            >
              Book Now
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CaregiverProfileModal
