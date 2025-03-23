import React from "react";
import { Link, useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("adminToken"); // Remove token from storage
    navigate("/admin/login"); // Redirect to login page
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-10">
      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-2xl">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
          Admin Dashboard
        </h1>
        
        <ul className="space-y-4">
          <li>
            <Link
              to="/admin/users"
              className="block w-full text-lg text-white bg-blue-500 hover:bg-blue-600 py-3 rounded-md text-center transition-all"
            >
              Manage Users
            </Link>
          </li>
          <li>
            <Link
              to="/admin/events"
              className="block w-full text-lg text-white bg-green-500 hover:bg-green-600 py-3 rounded-md text-center transition-all"
            >
              Manage Events
            </Link>
          </li>
          <li>
            <Link
              to="/admin/jobs"
              className="block w-full text-lg text-white bg-purple-500 hover:bg-purple-600 py-3 rounded-md text-center transition-all"
            >
              Manage Jobs
            </Link>
          </li>
        </ul>

        <button
          onClick={handleLogout}
          className="w-full mt-6 text-lg text-white bg-red-500 hover:bg-red-600 py-3 rounded-md text-center transition-all"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default AdminDashboard;
