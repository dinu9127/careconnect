import React from 'react'
import { Link } from 'react-router-dom'
import { Users, Calendar, AlertCircle, ArrowRight } from 'lucide-react'
import Navbar from '../../components/layout/Navbar'
import Sidebar from '../../components/layout/Sidebar'

const ClientDashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex">
        <Sidebar role="client" />
        <main className="flex-1 p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Client Dashboard</h1>
          
    

          {/* Find Caregivers CTA */}
          <div className="bg-gradient-to-r from-teal-500 to-cyan-600 rounded-2xl p-8 mb-8 text-white">
            <h2 className="text-2xl font-bold mb-3">Find Your Perfect Caregiver</h2>
            <p className="mb-6 opacity-90">Browse through our verified professional caregivers and book the right care for your needs.</p>
            <Link 
              to="/caregivers"
              className="inline-flex items-center gap-2 bg-white text-blue-600 font-semibold px-6 py-3 rounded-xl hover:bg-blue-50 transition"
            >
              Browse Caregivers
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Activity</h2>
            <p className="text-gray-600">No recent activity to display</p>
          </div>
        </main>
      </div>
    </div>
  )
}

export default ClientDashboard

