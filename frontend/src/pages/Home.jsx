import React from 'react'
import { Link } from 'react-router-dom'

function Home() {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Hero Section */}
      <div className="h-[60vh] flex flex-col items-center justify-center bg-blue-600 text-white text-center">
        <h1 className="text-4xl font-bold mb-4">Welcome to Samarthanam</h1>
        <p className="text-lg max-w-2xl mx-auto">
          Empowering lives and creating opportunities.
        </p>
        <Link
          to="/donate"
          className="mt-6 px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg shadow-md hover:bg-gray-200"
        >
          Donate Now
        </Link>
      </div>

      {/* Mission Section */}
      <div className="p-8 text-center">
        <h2 className="text-3xl font-semibold mb-6">Our Mission</h2>
        <p className="max-w-3xl mx-auto text-gray-700">
          We strive to empower the disabled and create a more inclusive world through education, rehabilitation, and innovation.
        </p>
      </div>
    </div>
  )
}

export default Home
