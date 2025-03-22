import React from 'react'

function Footer() {
  return (
    <footer className="bg-gray-800 text-white p-6 text-center">
      <p>&copy; {new Date().getFullYear()} Samarthanam. All rights reserved.</p>
      <p>
        <a href="#" className="text-blue-400 hover:underline">Privacy Policy</a> | 
        <a href="#" className="text-blue-400 hover:underline"> Terms of Service</a>
      </p>
    </footer>
  )
}

export default Footer
