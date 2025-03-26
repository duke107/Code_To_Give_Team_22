import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { adminLogout } from "../redux/slices/adminSlice";
import { FaBars, FaTimes } from "react-icons/fa";

const AdminNavbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    dispatch(adminLogout());
    navigate("/");
  };

  const navItems = [
    { path: "/admin/dashboard", label: "Dashboard"},
    { path: "/admin/pending-approvals", label: "Pending Approvals" },
    { path: "/admin/past-events", label: "Approved Events" },
    { path: "/admin/event-summaries", label: "Event Summaries" },
    { path: "/admin/messages", label: "Messages" },
  ];

  return (
    <>
      {/* Desktop Navbar */}
      <nav className="bg-blue-700 text-white px-6 py-4 flex justify-between items-center shadow-md">
        <Link to="/admin/dashboard">
          <img
            src="https://org1.hyundai.com/content/dam/hyundai/in/en/images/hyundai-story/samrath/samarthanam_logo.png"
            alt="Samarthanam Logo"
            className="h-10 w-auto"
          />
        </Link>

        {/* Navigation Links - Hidden on Mobile */}
        <div className="hidden md:flex gap-4">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`px-4 py-2 text-sm rounded-md font-medium transition-all ${
                location.pathname === item.path
                  ? "bg-blue-900 shadow-md"
                  : "bg-blue-600 hover:bg-blue-800"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* Logout Button - Hidden on Mobile */}
        <button
          onClick={handleLogout}
          className="hidden md:block bg-red-500 px-4 py-2 text-sm rounded-md hover:bg-red-600 transition shadow-md font-medium"
        >
          Logout
        </button>

        {/* Mobile Menu Button */}
        <button className="md:hidden text-2xl" onClick={() => setMenuOpen(true)}>
          <FaBars />
        </button>
      </nav>

      {/* Mobile Menu Modal */}
      {menuOpen && (
        <div
          className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setMenuOpen(false)}
        >
          <div
            className="bg-white w-64 p-6 rounded-lg shadow-lg relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-2 right-3 text-gray-500 hover:text-gray-800 text-2xl"
              onClick={() => setMenuOpen(false)}
            >
              <FaTimes />
            </button>

            {/* Mobile Navigation Links */}
            <nav className="flex flex-col space-y-4 text-gray-700 font-medium">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className="hover:text-black transition duration-200"
                  onClick={() => setMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}

              {/* Logout Button */}
              <button
                onClick={() => {
                  handleLogout();
                  setMenuOpen(false);
                }}
                className="mt-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow hover:bg-red-600 transition duration-200"
              >
                Logout
              </button>
            </nav>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminNavbar;