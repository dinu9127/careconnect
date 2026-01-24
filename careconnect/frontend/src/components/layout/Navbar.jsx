import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'

const Navbar = () => {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      setUser(JSON.parse(userData))
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  const getDashboardLink = () => {
    if (!user) return '/'
    switch (user.role) {
      case 'admin':
        return '/admin/dashboard'
      case 'caregiver':
        return '/caregiver/dashboard'
      case 'client':
      default:
        return '/client/dashboard'
    }
  }

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to={getDashboardLink()} className="flex items-center gap-3">
            <img src="/images/logo/careconnectlogo.png" alt="CareConnect" className="h-8 w-auto" />
            <span className="text-2xl font-bold text-teal-600">CareConnect</span>
          </Link>
          
          <div className="flex items-center gap-6">
            {user && user.role === 'client' && (
              <Link 
                to="/client/caregivers" 
                className="text-gray-700 hover:text-teal-600 font-medium transition"
              >
                Find Caregivers
              </Link>
            )}
            <Link 
              to="/profile" 
              className="text-gray-700 hover:text-teal-600 font-medium transition"
            >
              Profile
            </Link>
            <button 
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
