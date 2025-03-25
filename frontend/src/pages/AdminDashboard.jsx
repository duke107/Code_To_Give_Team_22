import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";
import DashboardStats from "../components/DashboardStats";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const AdminDashboard = () => {
  const [cityData, setCityData] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCityData = async () => {
      try {
        const response = await axios.get("http://localhost:3000/api/v1/admin/city-volunteers");
        if (response.data && Array.isArray(response.data)) {
          const filteredData = response.data.filter((item) => item.city);
          setCityData(filteredData);
        }
      } catch (error) {
        console.error("Error fetching city data:", error);
      }
    };

    fetchCityData();
  }, []);

  const chartData = {
    labels: cityData.map((item) => item.city),
    datasets: [
      {
        label: "Volunteers Per City",
        data: cityData.map((item) => item.users),
        backgroundColor: ["#3498db", "#2ecc71", "#f39c12", "#e74c3c", "#9b59b6", "#1abc9c", "#e67e22", "#34495e"],
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      title: { display: true, text: "Volunteers Per City" },
      legend: { display: true },
    },
  };

  return (
    <div className="grid grid-cols-[70%_30%] gap-6 p-6">
      {/* Left Section: Graph */}
      <div className="bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4">Volunteers Per City</h2>
        <div className="w-full h-96 overflow-hidden">
          <Bar data={chartData} options={chartOptions} />
        </div>
      </div>

      {/* Right Section: City List */}
      <div className="bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4 text-center">City Details</h2>
        <div className="flex flex-wrap gap-x-8">
          {cityData.map((item) => (
            <span
              key={item.city}
              className="cursor-pointer text-blue-600 transition-colors duration-300 hover:text-black"
              onClick={() => navigate(`/admin/city/${item.city}`)}
            >
              {item.city}
            </span>
          ))}
        </div>
      </div>

      {/* Dashboard Stats */}
      <DashboardStats />
    </div>
  );
};

export default AdminDashboard;
