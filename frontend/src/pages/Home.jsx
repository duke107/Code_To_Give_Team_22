import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Navigate } from 'react-router-dom'
import { logout } from '../redux/slices/authSlice'
 // Adjust the path as needed

function Home() {
    const state = useSelector((state) => state.auth)
    const dispatch = useDispatch()

    const handleLogout = () => {
        dispatch(logout())
    }

    if (!state.isAuthenticated) {
        return <Navigate to="/login" />
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            <h1 className="text-4xl font-semibold text-gray-800 mb-4">Home</h1>
            <button
                onClick={handleLogout}
                className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition duration-300 ease-in-out shadow-md"
            >
                Logout
            </button>
        </div>
    )
}

export default Home
