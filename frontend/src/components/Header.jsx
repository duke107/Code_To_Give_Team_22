import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../redux/slices/authSlice";
import { FaBell, FaTimes, FaBars } from "react-icons/fa";
import io from "socket.io-client";

const socket = io("http://localhost:3000", { withCredentials: true });

const Header = ({ notifications }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation(); //to Get current route

  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);
  const [menuModalOpen, setMenuModalOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const unreadCount = notifications?.filter((n) => !n.isRead).length || 0;

  // Function to check if link is active
  const isActive = (path) => location.pathname === path;

  return (
    <>
      <header className="bg-white shadow-md py-4 px-6 flex justify-between items-center relative">
        {/* Logo */}
        <Link to="/">
          <img
            src="https://org1.hyundai.com/content/dam/hyundai/in/en/images/hyundai-story/samrath/samarthanam_logo.png"
            alt="Samarthanam Logo"
            className="h-10 w-auto"
          />
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex space-x-6 text-gray-700 font-medium">
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
              className={`${isActive(item.path) ? "text-blue-700 font-bold border-b-2 border-blue-700" : "hover:text-black transition duration-200"}`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Right Side: Buttons + Bell Icon + Hamburger */}
        <div className="flex items-center gap-4">
          {/* Desktop: Account/Login Buttons */}
          {isAuthenticated ? (
            <div className="hidden md:flex items-center gap-2">
              <button
                onClick={() => navigate("/change-details")}
                className="bg-green-600 text-white px-4 py-2 rounded-lg shadow hover:bg-green-700 transition duration-200"
              >
                Account
              </button>
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-4 py-2 rounded-lg shadow hover:bg-red-600 transition duration-200"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="hidden md:flex bg-blue-600 text-white px-4 py-2 rounded-lg text-sm shadow-md hover:bg-blue-700 transition duration-200"
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

          {/* Mobile Hamburger */}
          <button 
            className="md:hidden text-gray-700 text-2xl" 
            onClick={() => setMenuModalOpen(true)}
          >
            <FaBars />
          </button>
        </div>
      </header>

      {/* Mobile Modal */}
      {menuModalOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center"
          onClick={() => setMenuModalOpen(false)}
        >
          <div 
            className="bg-white rounded-lg p-6 w-11/12 max-w-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-end">
              <button 
                onClick={() => setMenuModalOpen(false)}
                className="text-gray-700"
              >
                <FaTimes size={20} />
              </button>
            </div>

            {/* Account/Auth Options (Mobile) */}
            <div className="mt-4 space-y-3">
              {isAuthenticated ? (
                <>
                  <button
                    onClick={() => {
                      setMenuModalOpen(false);
                      navigate("/change-details");
                    }}
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg transition duration-200"
                  >
                    Account
                  </button>
                  <button
                    onClick={() => {
                      setMenuModalOpen(false);
                      handleLogout();
                    }}
                    className="w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg transition duration-200"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition duration-200"
                  onClick={() => setMenuModalOpen(false)}
                >
                  Sign In
                </Link>
              )}
            </div>

            {/* Navigation Links */}
            <nav className="mt-6 space-y-4 text-gray-700 font-medium">
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
                  onClick={() => setMenuModalOpen(false)}
                  className="block hover:text-black transition duration-200"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}
    </>
  );
  
};

export default Header;