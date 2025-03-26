import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../redux/slices/authSlice";
import { FaBell, FaTimes, FaBars } from "react-icons/fa";

const Header = ({ notifications }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const [menuModalOpen, setMenuModalOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const unreadCount = notifications?.filter((n) => !n.isRead).length || 0;

  // Function to check if link is active
  const isActive = (path) => location.pathname === path;

  // Define navigation links based on authentication status
  const commonLinks = [
    { path: "/about", label: "About Us" },
    { path: "/gallery", label: "Gallery" },
    { path: "/donate", label: "Donate" },
  ];

  const authLinks = [
    { path: "/dashboard", label: "Dashboard" },
    { path: "/events", label: "Events" },
  ];
  const messageLinks = [
    { path: "/organiser/messages", label: "Messages" },
  ];

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
          {commonLinks.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`${
                isActive(item.path)
                  ? "text-blue-700 font-bold border-b-2 border-blue-700"
                  : "hover:text-black transition duration-200"
              }`}
            >
              {item.label}
            </Link>
          ))}
          {isAuthenticated &&
            authLinks.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`${
                  isActive(item.path)
                    ? "text-blue-700 font-bold border-b-2 border-blue-700"
                    : "hover:text-black transition duration-200"
                }`}
              >
                {item.label}
              </Link>
            ))}
          {isAuthenticated &&
            user.role === "Event Organiser" &&
            messageLinks.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`${
                  isActive(item.path)
                    ? "text-blue-700 font-bold border-b-2 border-blue-700"
                    : "hover:text-black transition duration-200"
                }`}
              >
                {item.label}
              </Link>
            ))}
        </nav>
  
        {/* Right Side: Buttons + Bell Icon + Hamburger */}
        <div className="flex items-center gap-4">
          {/* Account/Login Buttons */}
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
          {isAuthenticated && (
            <Link to="/notification" className="relative">
              <FaBell
                size={22}
                className="text-gray-700 hover:text-gray-900 transition duration-200"
              />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </Link>
          )}
  
          {/* Mobile Hamburger */}
          <button
            className="md:hidden text-gray-700 text-2xl"
            onClick={() => setMenuModalOpen(true)}
          >
            <FaBars />
          </button>
        </div>
      </header>
  
      {/* Mobile Menu Modal */}
      {menuModalOpen && (
        <div
          className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setMenuModalOpen(false)}
        >
          <div
            className="bg-white w-64 p-6 rounded-lg shadow-lg relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-2 right-3 text-gray-500 hover:text-gray-800 text-xl"
              onClick={() => setMenuModalOpen(false)}
            >
              <FaTimes />
            </button>
  
            {/* Mobile Links */}
            <nav className="flex flex-col space-y-4 text-gray-700 font-medium">
              {commonLinks.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className="hover:text-black transition duration-200"
                  onClick={() => setMenuModalOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              {isAuthenticated &&
                authLinks.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className="hover:text-black transition duration-200"
                    onClick={() => setMenuModalOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
              {isAuthenticated &&
                user.role === "Event Organiser" &&
                messageLinks.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className="hover:text-black transition duration-200"
                    onClick={() => setMenuModalOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
  
              {/* Account / Logout / Sign In buttons in Mobile Menu */}
              {isAuthenticated ? (
                <div className="flex flex-col space-y-2 mt-4">
                  <button
                    onClick={() => {
                      navigate("/change-details");
                      setMenuModalOpen(false);
                    }}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg shadow hover:bg-green-700 transition duration-200"
                  >
                    Account
                  </button>
                  <button
                    onClick={() => {
                      handleLogout();
                      setMenuModalOpen(false);
                    }}
                    className="bg-red-500 text-white px-4 py-2 rounded-lg shadow hover:bg-red-600 transition duration-200"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setMenuModalOpen(false)}
                  className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm shadow-md hover:bg-blue-700 transition duration-200 block text-center"
                >
                  Sign In
                </Link>
              )}
            </nav>
          </div>
        </div>
      )}
    </>
  );
  
};

export default Header;