import React, { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { User, LogOut } from 'lucide-react'

const Navbar = () => {
  const navigate = useNavigate()
  const location = useLocation()
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

  const getProfileLink = () => {
    const role = user?.role?.toLowerCase()

    if (role === 'caregiver' || location.pathname.startsWith('/caregiver')) return '/caregiver/profile'
    if (role === 'admin' || location.pathname.startsWith('/admin')) return '/admin/profile'
    if (role === 'client' || location.pathname.startsWith('/client')) return '/profile'

    return '/profile'
  }

  return (
    <nav className="bg-slate-900 shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition">
            <img src="/images/logo/careconnectlogo.png" alt="CareConnect" className="h-8 w-auto" />
            <span className="text-2xl font-bold text-white">CareConnect</span>
          </Link>
          
          <div className="flex items-center gap-6">
            {user && (
              <div className="flex items-center gap-4">
                <span className="text-gray-200 text-sm">
                  Welcome, <span className="font-semibold text-white">{user.name}</span>
                </span>
                <Link 
                  to={getProfileLink()} 
                  className="text-gray-100 hover:text-white transition-colors duration-200 hover:scale-110"
                  aria-label="Profile"
                  title="Profile"
                >
                  <User className="w-5 h-5" aria-hidden="true" />
                </Link>
              </div>
            )}
            <button 
              className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg"
              onClick={handleLogout}
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar

