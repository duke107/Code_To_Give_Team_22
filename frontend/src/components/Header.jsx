import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../redux/slices/authSlice";
import { FaBell } from "react-icons/fa";
import io from "socket.io-client";


const socket = io("http://localhost:3000", {
  withCredentials: true,
});

const Header = ({notifications}) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);
  
  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const unreadCount = notifications?.filter((n) => !n.isRead).length || 0;
  console.log(unreadCount)

  return (
    <header className="bg-white shadow-md py-4 px-6 flex justify-between items-center">
      {/* Logo */}
      <Link to="/" tabIndex="0">
        <img
          src="https://org1.hyundai.com/content/dam/hyundai/in/en/images/hyundai-story/samrath/samarthanam_logo.png"
          alt="Samarthanam Logo"
          className="h-12 w-auto"
        />
      </Link>

      {/* Navigation Links */}
      <nav className="space-x-6 hidden md:flex text-gray-700 font-medium">
        <Link to="/about" className="hover:text-black" tabIndex="0">
          About Us
        </Link>
        <Link to="/gallery" className="hover:text-black" tabIndex="0">
          Gallery
        </Link>
        <Link to="/donate" className="hover:text-black" tabIndex="0">
          Donate
        </Link>
        <Link to="/dashboard" className="hover:text-black" tabIndex="0">
          Dashboard
        </Link>
        <Link to="/events" className="hover:text-black" tabIndex="0">
          Events
        </Link>
      </nav>

      {/* Auth Buttons & Notifications */}
      <div className="flex items-center gap-2 relative">
        {isAuthenticated ? (
          <>
            <div className="relative">
              <button
                onClick={() => setAccountDropdownOpen((prev) => !prev)}
                className="bg-green-600 text-white px-4 py-2 rounded-lg shadow hover:bg-green-700"
                tabIndex="0"
              >
                Account
              </button>
              {accountDropdownOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded shadow-lg z-50">
                  <button
                    onClick={() => {
                      setAccountDropdownOpen(false);
                      navigate("/change-details");
                    }}
                    className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                    tabIndex="0"
                  >
                    Change Details
                  </button>
                  <button
                    onClick={() => {
                      setAccountDropdownOpen(false);
                      handleLogout();
                    }}
                    className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                    tabIndex="0"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <Link
            to="/login"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm shadow hover:bg-blue-700"
            tabIndex="0"
          >
            Sign In
          </Link>
        )}
        <Link to="/notification" className="relative" tabIndex="0">
          <FaBell size={20} className="text-gray-700" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
};

export default Header;
