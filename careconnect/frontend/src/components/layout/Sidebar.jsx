import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Menu, X } from 'lucide-react'

const Sidebar = ({ role = 'client' }) => {
  const [isOpen, setIsOpen] = useState(true)

  const clientLinks = [
    { name: 'Dashboard', path: '/client/dashboard' },
    { name: 'Find Caregivers', path: '/client/caregivers' },
    { name: 'My Bookings', path: '/client/bookings' },
    { name: 'Complaints', path: '/client/complaints' },
  ]

  const caregiverLinks = [
    { name: 'Dashboard', path: '/caregiver/dashboard' },
    { name: 'My Schedule', path: '/caregiver/schedule' },
    { name: 'Update Availability', path: '/caregiver/availability' },
    { name: 'Update Profile', path: '/caregiver/profile' },
  ]

  const adminLinks = [
    { name: 'Dashboard', path: '/admin/dashboard' },
    { name: 'Users', path: '/admin/users' },
    { name: 'Caregivers', path: '/admin/caregivers' },
    { name: 'Payments', path: '/admin/payments' },
    { name: 'Complaints', path: '/admin/complaints' },
    { name: 'Reports', path: '/admin/reports' },
  ]

  const links = 
    role === 'admin' ? adminLinks :
    role === 'caregiver' ? caregiverLinks :
    clientLinks

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-20 left-4 z-50 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition md:hidden"
        aria-label="Toggle sidebar"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Sidebar */}
      <aside
        className={`${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } fixed md:relative md:translate-x-0 transition-transform duration-300 w-64 bg-white shadow-md min-h-screen z-40`}
      >
        <div className="p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4 capitalize">
            {role} Menu
          </h2>
          <nav className="space-y-2">
            {links.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => {
                  // Close sidebar on mobile after clicking a link
                  if (window.innerWidth < 768) {
                    setIsOpen(false)
                  }
                }}
                className="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition"
              >
                {link.name}
              </Link>
            ))}
          </nav>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  )
}

export default Sidebar
