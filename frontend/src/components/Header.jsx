import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../redux/slices/authSlice';
import { FaBell } from "react-icons/fa";
import io from "socket.io-client";

const socket = io("http://localhost:3000", {
  withCredentials: true,
});

const Header = () => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  socket.on("connect", () => {
    console.log("WebSocket connected:", socket.id);
  });

  useEffect(() => {
    if (isAuthenticated) {
      fetch("http://localhost:3000/api/v1/notification", {
        credentials: "include",
      })
        .then((res) => res.json())
        .then((data) => {
          // assuming your API returns notifications in data.data
          setNotifications(data.data || []);
        })
        .catch((err) =>
          console.error("Error fetching initial notifications:", err)
        );
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated && user) {
      console.log("Socket connecting for user:", user._id);
      socket.emit("join", user._id);

      socket.on("new-notification", (notification) => {
        console.log("Received new notification:", notification);
        setNotifications((prev) => [notification, ...prev]);
      });
    }

    // Clean up on unmount
    return () => {
      console.log("Cleaning up socket listeners");
      socket.off("new-notification");
    };
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <header className="bg-white shadow-md py-4 px-6 flex justify-between items-center">
      {/* Logo */}
      <Link to="/">
        <img
          src="https://org1.hyundai.com/content/dam/hyundai/in/en/images/hyundai-story/samrath/samarthanam_logo.png"
          alt="Samarthanam Logo"
          className="h-12 w-auto"
        />
      </Link>

      {/* Navigation Links */}
      <nav className="space-x-6 hidden md:flex text-gray-700 font-medium">
        <Link to="/about" className="hover:text-black">About Us</Link>
        <Link to="/gallery" className="hover:text-black">Gallery</Link>
        <Link to="/donate" className="hover:text-black">Donate</Link>
        <Link to="/dashboard" className="hover:text-black">Dashboard</Link>
        <Link to="/events" className="hover:text-black">Events</Link>
      </nav>

      {/* Auth Buttons & Notifications */}
      <div className="flex items-center gap-2 relative">
        {isAuthenticated ? (
          <>
            <div className="relative">
              <button
                onClick={() => setAccountDropdownOpen((prev) => !prev)}
                className="bg-green-600 text-white px-4 py-2 rounded-lg shadow hover:bg-green-700"
              >
                Account
              </button>
              {accountDropdownOpen && (
                <div className="right-0 mt-2 w-40 bg-white border border-gray-200 rounded shadow-lg z-50">
                  <button
                    onClick={() => {
                      setAccountDropdownOpen(false);
                      navigate("/change-details");
                    }}
                    className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                  >
                    Change Details
                  </button>
                  <button
                    onClick={() => {
                      setAccountDropdownOpen(false);
                      handleLogout();
                    }}
                    className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
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
          >
            Sign In
          </Link>
        )}
        <Link to="/notification" className="relative">
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
