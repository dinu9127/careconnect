import React from 'react'
import { Link } from 'react-router-dom'

const Navbar = () => {
  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="text-2xl font-bold text-blue-600">
            CareConnect
          </Link>
          
          <div className="flex items-center gap-4">
            <Link 
              to="/profile" 
              className="text-gray-700 hover:text-blue-600 font-medium transition"
            >
              Profile
            </Link>
            <button 
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition"
              onClick={() => console.log('Logout clicked')}
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
