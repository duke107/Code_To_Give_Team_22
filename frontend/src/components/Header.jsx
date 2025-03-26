import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../redux/slices/authSlice";
import { FaBell } from "react-icons/fa";
import io from "socket.io-client";

const socket = io("http://localhost:3000", { withCredentials: true });

const Header = ({ notifications }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation(); //to Get current route

  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const unreadCount = notifications?.filter((n) => !n.isRead).length || 0;

  // Function to check if link is active
  const isActive = (path) => location.pathname === path;

  return (
    <header className="bg-white shadow-md py-4 px-6 flex justify-between items-center">
      {/* Logo */}
      <Link to="/">
        <img
          src="https://org1.hyundai.com/content/dam/hyundai/in/en/images/hyundai-story/samrath/samarthanam_logo.png"
          alt="Samarthanam Logo"
          className="h-10 w-auto"
        />
      </Link>

  
      {/* Navigation Links */}
      <nav className="hidden md:flex space-x-6 text-gray-700 font-bold text-lg ">
        {[
          { path: "/about", label: "About Us" },
          { path: "/gallery", label: "Gallery" },
          { path: "/donate", label: "Donate" },
          { path: "/dashboard", label: "Dashboard" },
          { path: "/events", label: "Events" },
        ].map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`${
              isActive(item.path)
                ? "text-blue-700 font-bold border-b-2 border-blue-700"
                : "text-black hover:text-red-600 transition-colors duration-200"
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>

    
   
       
  
      {/* Auth Buttons & Notifications */}
      <div className="flex items-center gap-4 relative">
        {isAuthenticated ? (
          <>
          <div className="relative">
            <button
              onClick={() => setAccountDropdownOpen((prev) => !prev)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg shadow hover:bg-green-700">
              Account
            </button>
            {accountDropdownOpen && (
              <div className="right-0 mt-2 w-40 bg-white border border-gray-200 rounded shadow-lg z-50">
                <button
                  onClick={() => {
                    setAccountDropdownOpen(false);
                    navigate("/change-details");
                  }}
                  className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100">
                  Change Details
                </button>
                <button
                  onClick={() => {
                    setAccountDropdownOpen(false);
                    handleLogout();
                  }}
                  className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100">
                  Logout
                </button>
              </div>
            )}
          </div>
        </>
        ) : (
          <Link
            to="/login"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm shadow-md hover:bg-blue-700 transition duration-200"
          >
            Sign In
          </Link>
        )}
  
        {/* Notifications */}
        <Link to="/notification" className="relative">
          <FaBell size={22} className="text-gray-700 hover:text-gray-900 transition duration-200" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
  
};

export default Header;
