import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { logout } from '../redux/slices/authSlice'

function Header() {
  const { isAuthenticated } = useSelector((state) => state.auth)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
  }

  return (
    <header className="bg-white shadow-md p-4 flex justify-between items-center">
      <Link to="/">
                <img
                    src="https://org1.hyundai.com/content/dam/hyundai/in/en/images/hyundai-story/samrath/samarthanam_logo.png"
                    alt="Samarthanam Logo"
                    className="h-12 w-auto"
                />
            </Link>
      <nav className="space-x-10 h-10">
        <Link to="/about" className="text-gray-700 hover:text-blue-600">About Us</Link>
        <Link to="/gallery" className="text-gray-700 hover:text-blue-600">Gallery</Link>
        <Link to="/donate" className="text-gray-700 hover:text-blue-600">Donate</Link>
        {isAuthenticated ? (
          <button
            onClick={handleLogout}
            className="bg-blue-600 text-white px-4 py-2 rounded-md shadow hover:bg-blue-700"
          >
            Logout
          </button>
        ) : (
          <Link
            to="/login"
            className="bg-blue-600 text-white px-4 py-2 rounded-md shadow hover:bg-blue-700"
          >
            Login
          </Link>
        )}
      </nav>
    </header>
  )
}

export default Header
