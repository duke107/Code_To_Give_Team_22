// Home.jsx
import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../redux/slices/authSlice';
import { Navigate } from 'react-router-dom';

function Home() {
  const state = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logout());
  };

  // If user is not authenticated, redirect to login
  if (!state.isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="bg-gray-800 text-white w-64 flex flex-col p-6">
       

        {/* Navigation Links */}
        <nav className="flex-1">
          <ul>
            <li className="mb-2">
              <NavLink
                to="/dashboard"
                className={({ isActive }) =>
                  `block p-2 rounded transition-colors ${
                    isActive ? 'bg-gray-700' : 'hover:bg-gray-700'
                  }`
                }
              >
                Dashboard
              </NavLink>
            </li>
            <li className="mb-2">
              <NavLink
                to="/events"
                className={({ isActive }) =>
                  `block p-2 rounded transition-colors ${
                    isActive ? 'bg-gray-700' : 'hover:bg-gray-700'
                  }`
                }
              >
                Events
              </NavLink>
            </li>
            <li className="mb-2">
              <NavLink
                to="/change-details"
                className={({ isActive }) =>
                  `block p-2 rounded transition-colors ${
                    isActive ? 'bg-gray-700' : 'hover:bg-gray-700'
                  }`
                }
              >
                Change Details
              </NavLink>
            </li>
          </ul>
        </nav>

        
      </aside>

      {/* Main Content */}
      <main className="flex-1 bg-gray-100 p-6">
        <Outlet />
      </main>
    </div>
  );
}

export default Home;
