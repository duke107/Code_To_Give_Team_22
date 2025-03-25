import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Bar, Pie } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from "chart.js";
import DashboardStats from "../components/DashboardStats";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

const AdminDashboard = () => {
  const [cityData, setCityData] = useState([]);
  const [totalDonations, setTotalDonations] = useState(0);
  const [donors, setDonors] = useState([]);
  const [donationDenominations, setDonationDenominations] = useState({});
  const [showDonorsModal, setShowDonorsModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const cityRes = await axios.get("http://localhost:3000/api/v1/admin/city-volunteers");
        if (cityRes.data && Array.isArray(cityRes.data)) {
          setCityData(cityRes.data.filter((item) => item.city));
        }

        const donationRes = await axios.get("http://localhost:3000/api/v1/donate/fetchAdmin", { withCredentials: true });
        if (donationRes.data && donationRes.data.data.donations) {
          const donations = donationRes.data.data.donations;
          setDonors(donations);
          setTotalDonations(donations.reduce((sum, d) => sum + d.amount, 0));
          
          const denominations = {};
          donations.forEach((donation) => {
            const amount = donation.amount;
            denominations[amount] = (denominations[amount] || 0) + 1;
          });
          setDonationDenominations(denominations);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
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

  const pieChartData = {
    labels: Object.keys(donationDenominations),
    datasets: [
      {
        label: "Donations by Amount",
        data: Object.values(donationDenominations),
        backgroundColor: ["#f1c40f", "#e74c3c", "#3498db", "#2ecc71", "#9b59b6"],
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
      <div className="bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4">Volunteers Per City</h2>
        <div className="w-full h-96 overflow-hidden">
          <Bar data={chartData} options={chartOptions} />
        </div>
      </div>

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

      <DashboardStats />

      <div className="bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4 text-center">Total Donations</h2>
        <p className="text-2xl font-semibold text-center text-green-600">₹{totalDonations}</p>
        <button
          onClick={() => setShowDonorsModal(true)}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 w-full"
        >
          View Donors List
        </button>
        <div className="w-full h-64 mt-6">
          <Pie data={pieChartData} />
        </div>
      </div>

      {showDonorsModal && (
        <div
          className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center"
          onClick={() => setShowDonorsModal(false)}
        >
          <div
            className="bg-white p-6 rounded-lg shadow-lg w-96 max-h-96 overflow-y-auto relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowDonorsModal(false)}
              className="absolute top-2 right-3 text-gray-500 hover:text-gray-800 text-xl"
            >
              &times;
            </button>
            <h3 className="text-xl font-bold text-gray-800 mb-4">Donors List</h3>
            <ul className="space-y-4">
              {donors.length > 0 ? (
                donors.map((donation) => (
                  <li key={donation._id} className="bg-gray-100 shadow-md rounded-lg p-4">
                    <p className="font-medium">{donation.donorName} donated ₹{donation.amount}</p>
                    <p className="text-gray-600">Message: {donation.message}</p>
                  </li>
                ))
              ) : (
                <p className="text-gray-500">No donations received yet.</p>
              )}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
