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
          
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-700">Active Caregivers</h3>
              </div>
              <p className="text-3xl font-bold text-blue-600">0</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-700">Appointments</h3>
              </div>
              <p className="text-3xl font-bold text-green-600">0</p>
            </div>
            <Link to="/client/complaints" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-orange-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-700">Complaints</h3>
              </div>
              <p className="text-3xl font-bold text-orange-600">0</p>
            </Link>
          </div>

          {/* Find Caregivers CTA */}
          <div className="bg-gradient-to-r from-teal-500 to-cyan-600 rounded-2xl p-8 mb-8 text-white">
            <h2 className="text-2xl font-bold mb-3">Find Your Perfect Caregiver</h2>
            <p className="mb-6 opacity-90">Browse through our verified professional caregivers and book the right care for your needs.</p>
            <Link 
              to="/caregivers"
              className="inline-flex items-center gap-2 bg-white text-teal-600 font-semibold px-6 py-3 rounded-xl hover:bg-teal-50 transition"
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
