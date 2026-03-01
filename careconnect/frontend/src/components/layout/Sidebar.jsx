import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X, LayoutDashboard, Users, Calendar, Settings, AlertCircle, CreditCard, FileText, Home } from 'lucide-react'

const Sidebar = ({ role = 'client' }) => {
  const [isOpen, setIsOpen] = useState(true)
  const location = useLocation()

  const clientLinks = [
    { name: 'Dashboard', path: '/client/dashboard', icon: LayoutDashboard },
    { name: 'Find Caregivers', path: '/client/caregivers', icon: Users },
    { name: 'My Bookings', path: '/client/bookings', icon: Calendar },
    { name: 'Complaints', path: '/client/complaints', icon: AlertCircle },
  ]

  const caregiverLinks = [
    { name: 'Dashboard', path: '/caregiver/dashboard', icon: LayoutDashboard },
    { name: 'My Schedule', path: '/caregiver/schedule', icon: Calendar },
    { name: 'Manage Leave', path: '/caregiver/availability', icon: Settings },
    { name: 'Update Profile', path: '/caregiver/profile', icon: Users },
  ]

  const adminLinks = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'User Management', path: '/admin/users', icon: Users },
    { name: 'Payments', path: '/admin/payments', icon: CreditCard },
    { name: 'Complaints', path: '/admin/complaints', icon: AlertCircle },
    { name: 'Reports', path: '/admin/reports', icon: FileText },
    { name: 'Profile', path: '/admin/profile', icon: Users },
  ]

  const links = 
    role === 'admin' ? adminLinks :
    role === 'caregiver' ? caregiverLinks :
    clientLinks

  const isActive = (path) => {
    return location.pathname === path
  }

  const getRoleColor = () => {
    if (role === 'admin') return {
      header: 'from-purple-600 to-purple-700',
      active: 'from-purple-500 to-purple-600',
      toggle: 'bg-purple-600 hover:bg-purple-700'
    }
    if (role === 'caregiver') return {
      header: 'from-sky-500 to-sky-600',
      active: 'from-sky-400 to-sky-500',
      toggle: 'bg-sky-500 hover:bg-sky-600'
    }
    return {
      header: 'from-teal-600 to-teal-700',
      active: 'from-teal-500 to-teal-600',
      toggle: 'bg-teal-600 hover:bg-teal-700'
    }
  }

  const colors = getRoleColor()

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed top-20 left-4 z-50 p-2 ${colors.toggle} text-white rounded-lg hover:shadow-lg transition-all duration-300 md:hidden`}
        aria-label="Toggle sidebar"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Sidebar */}
      <aside
        className={`${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } fixed md:relative md:translate-x-0 transition-transform duration-300 w-64 bg-slate-900 min-h-screen z-40 shadow-2xl`}
      >
        {/* Header */}
        <div className={`bg-gradient-to-r ${colors.header} text-white p-6 shadow-lg`}>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-white bg-opacity-20 flex items-center justify-center">
              <Home className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-sm font-bold capitalize">{role} Portal</h2>
              <p className="text-xs opacity-75">CareConnect</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {links.map((link) => {
            const Icon = link.icon
            const active = isActive(link.path)
            
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => {
                  if (window.innerWidth < 768) {
                    setIsOpen(false)
                  }
                }}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                  active
                    ? `bg-gradient-to-r ${colors.active} text-white shadow-lg`
                    : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                <Icon className={`w-5 h-5 flex-shrink-0 ${active ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`} />
                <span className="font-medium text-sm">{link.name}</span>
                {active && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white"></div>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-700">
          <div className="text-center text-xs text-slate-400">
            <p>CareConnect</p>
            <p>Healthcare Management</p>
          </div>
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
