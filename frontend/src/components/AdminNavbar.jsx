import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { adminLogout } from "../redux/slices/adminSlice";

const AdminNavbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(adminLogout());
    navigate("/");
  };

  return (
    <nav className="bg-blue-600 text-white p-4 flex justify-between items-center w-full">
      <Link to="/admin/dashboard" className="text-xl font-bold ">
        Admin Dashboard
      </Link>
      <div className="flex space-x-4">
        <Link
          to="/admin/pending-approvals"
          className="px-6 py-3 bg-blue-500 rounded-lg hover:bg-blue-700 transition font-semibold text-white shadow-md whitespace-nowrap"
        >
          Pending Approvals
        </Link>
        <Link
          to="/admin/past-events"
          className="px-6 py-3 bg-blue-500 rounded-lg hover:bg-blue-700 transition font-semibold text-white shadow-md whitespace-nowrap"
        >
          Past Events
        </Link>
        {/* New: Event Summaries Link */}
        <Link
          to="/admin/event-summaries"
          className="px-6 py-3 bg-blue-500 rounded-lg hover:bg-blue-700 transition font-semibold text-white shadow-md whitespace-nowrap"
        >
          Event Summaries
        </Link>
      </div>
      <button
        onClick={handleLogout}
        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition text-sm shadow-md"
      >
        Logout
      </button>
    </nav>
  );
};

export default AdminNavbar;
