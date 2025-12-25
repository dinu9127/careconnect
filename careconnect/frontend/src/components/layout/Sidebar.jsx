import React from 'react'
import { Link } from 'react-router-dom'

const Sidebar = ({ role = 'client' }) => {
  const clientLinks = [
    { name: 'Dashboard', path: '/client/dashboard' },
    { name: 'Find Caregivers', path: '/client/caregivers' },
    { name: 'My Bookings', path: '/client/bookings' },
    { name: 'Messages', path: '/client/messages' },
  ]

  const caregiverLinks = [
    { name: 'Dashboard', path: '/caregiver/dashboard' },
    { name: 'My Schedule', path: '/caregiver/schedule' },
    { name: 'Clients', path: '/caregiver/clients' },
    { name: 'Earnings', path: '/caregiver/earnings' },
  ]

  const adminLinks = [
    { name: 'Dashboard', path: '/admin/dashboard' },
    { name: 'Users', path: '/admin/users' },
    { name: 'Caregivers', path: '/admin/caregivers' },
    { name: 'Reports', path: '/admin/reports' },
  ]

  const links = 
    role === 'admin' ? adminLinks :
    role === 'caregiver' ? caregiverLinks :
    clientLinks

  return (
    <aside className="w-64 bg-white shadow-md min-h-screen">
      <div className="p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4 capitalize">
          {role} Menu
        </h2>
        <nav className="space-y-2">
          {links.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition"
            >
              {link.name}
            </Link>
          ))}
        </nav>
      </div>
    </aside>
  )
}

export default Sidebar
