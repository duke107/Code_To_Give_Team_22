import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { adminLogout } from "../redux/slices/adminSlice";

const AdminNavbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();

  const handleLogout = () => {
    dispatch(adminLogout());
    navigate("/");
  };

  const navItems = [
    { path: "/admin/pending-approvals", label: "Pending Approvals" },
    { path: "/admin/past-events", label: "Approved Events" },
    { path: "/admin/event-summaries", label: "Event Summaries" },
    { path: "/admin/messages", label: "Messages" }, // New Link
  ];

  return (
    <nav className="bg-blue-700 text-white px-4 py-3 flex flex-wrap justify-between items-center shadow-md">
      {/* Dashboard Link */}
      <Link to="/admin/dashboard" className="text-lg font-bold whitespace-nowrap">
        Admin Dashboard
      </Link>

      {/* Navigation Links */}
      <div className="flex flex-wrap gap-2">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`px-3 py-1.5 text-sm rounded-md font-medium transition-all ${
              location.pathname === item.path
                ? "bg-blue-900 shadow-md"
                : "bg-blue-600 hover:bg-blue-800"
            }`}
          >
            {item.label}
          </Link>
        ))}
      </div>

      {/* Logout Button */}
      <button
        onClick={handleLogout}
        className="bg-red-500 px-3 py-1.5 text-sm rounded-md hover:bg-red-600 transition shadow-md font-medium"
      >
        Logout
      </button>
    </nav>
  );
};

export default AdminNavbar;
