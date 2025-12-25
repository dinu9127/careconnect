import React from 'react'
import Navbar from '../../components/layout/Navbar'
import Sidebar from '../../components/layout/Sidebar'

const CaregiverDashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex">
        <Sidebar role="caregiver" />
        <main className="flex-1 p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Caregiver Dashboard</h1>
          
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Active Clients</h3>
              <p className="text-3xl font-bold text-blue-600">0</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Upcoming Shifts</h3>
              <p className="text-3xl font-bold text-green-600">0</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Earnings (This Month)</h3>
              <p className="text-3xl font-bold text-purple-600">$0</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Today's Schedule</h2>
            <p className="text-gray-600">No shifts scheduled for today</p>
          </div>
        </main>
      </div>
    </div>
  )
}

export default CaregiverDashboard
