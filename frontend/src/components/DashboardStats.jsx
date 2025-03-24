import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaUsers, FaCalendarCheck, FaTasks, FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from "react-icons/fa";

const DashboardStats = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalEvents: 0,
    totalTasks: 0,
    totalVolunteers: 0,
    upcomingEvents: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get("http://localhost:3000/api/v1/admin/stats");
        setStats(response.data);
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="bg-white shadow-lg rounded-lg p-6 flex flex-col gap-6">
      <h2 className="text-2xl font-bold text-gray-800 border-b pb-3">Dashboard Overview</h2>
      
      {/* Statistics Grid */}
      <div className="grid grid-cols-3 gap-6">
        {/* Total Users */}
        <div className="bg-blue-100 p-4 rounded-lg flex items-center gap-4">
          <FaUsers className="text-blue-600 text-3xl" />
          <div>
            <h3 className="text-lg font-semibold">Total Users</h3>
            <p className="text-xl font-bold">{stats.users}</p>
          </div>
        </div>

        {/* Total Events */}
        <div className="bg-green-100 p-4 rounded-lg flex items-center gap-4">
          <FaCalendarCheck className="text-green-600 text-3xl" />
          <div>
            <h3 className="text-lg font-semibold">Total Events</h3>
            <p className="text-xl font-bold">{stats.events}</p>
          </div>
        </div>

        {/* Total Tasks */}
        <div className="bg-yellow-100 p-4 rounded-lg flex items-center gap-4">
          <FaTasks className="text-yellow-600 text-3xl" />
          <div>
            <h3 className="text-lg font-semibold">Total Tasks Completed</h3>
            <p className="text-xl font-bold">{stats.tasks}</p>
          </div>
        </div> 
    </div>
    </div>
  );
};

export default DashboardStats;
