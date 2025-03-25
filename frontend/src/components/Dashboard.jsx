import React, { useEffect, useState } from 'react';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS } from 'chart.js/auto';
import 'tailwindcss/tailwind.css';
import { useSelector } from 'react-redux';

function Dashboard() {
  // Assume we have user details in Redux (organiser)
  const { user } = useSelector((state) => state.auth);

  // States for fetched events & loading/error
  const [events, setEvents] = useState([]);
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // States for stats
  const [totalEvents, setTotalEvents] = useState(0);
  const [totalVolunteers, setTotalVolunteers] = useState(0);
  const [totalDonations, setTotalDonations] = useState(0);
  const [treesPlanted, setTreesPlanted] = useState(0);

  // States for chart data
  const [eventNames, setEventNames] = useState([]);
  const [volunteersPerEvent, setVolunteersPerEvent] = useState([]);
  const [donationCategories, setDonationCategories] = useState([]);
  const [donationAmounts, setDonationAmounts] = useState([]);

  useEffect(() => {
    if (!user?._id) return;

    const fetchMyEvents = async () => {
      try {
        // Fetch events organised by current user (adjust endpoint if needed)
        const url = `http://localhost:3000/api/v1/events/getEvents?createdBy=${user._id}`;
        const res = await fetch(url, {
          method: 'GET',
          credentials: 'include',
        });
        if (!res.ok) {
          throw new Error(`Error ${res.status}: ${res.statusText}`);
        }
        const data = await res.json();
        setEvents(data);
        setTotalEvents(data.length);

        // Compute total volunteers & prepare bar chart data
        let overallVolunteers = 0;
        const names = [];
        const volunteersCountArray = [];

        data.forEach((evt) => {
          let eventVolunteers = 0;
          if (evt.volunteeringPositions) {
            evt.volunteeringPositions.forEach((pos) => {
              if (pos.registeredUsers) {
                eventVolunteers += pos.registeredUsers.length;
              }
            });
          }
          overallVolunteers += eventVolunteers;
          names.push(evt.title);
          volunteersCountArray.push(eventVolunteers);
        });

        setTotalVolunteers(overallVolunteers);
        setEventNames(names);
        setVolunteersPerEvent(volunteersCountArray);

        // Fetch all donations
        const donationRes = await fetch('http://localhost:3000/api/v1/events/getAllDonations', {
          method: 'GET',
          credentials: 'include',
        });
        if (!donationRes.ok) {
          throw new Error(`Error ${donationRes.status}: ${donationRes.statusText}`);
        }
        const donationData = await donationRes.json();
        setDonations(donationData);

        // Compute overall donation amount and trees planted.
        let donationSum = donationData.data.reduce((acc, donation) => acc + donation.amount, 0);
        setTotalDonations(donationSum);
        // For every 20 rupees, 5 trees are planted (0.25 trees per rupee)
        setTreesPlanted(donationSum * 0.25);

        // Group donations by amount denominations
        const donationGroups = {
          'Below ₹1000': 0,
          '₹1000-₹5000': 0,
          '₹5000-₹10000': 0,
          'Above ₹10000': 0,
        };

        donationData.data.forEach((donation) => {
          const amt = donation.amount;
          if (amt < 1000) {
            donationGroups['Below ₹1000'] += donation.amount;
          } else if (amt < 5000) {
            donationGroups['₹1000-₹5000'] += donation.amount;
          } else if (amt < 10000) {
            donationGroups['₹5000-₹10000'] += donation.amount;
          } else {
            donationGroups['Above ₹10000'] += donation.amount;
          }
        });

        setDonationCategories(Object.keys(donationGroups));
        setDonationAmounts(Object.values(donationGroups));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMyEvents();
  }, [user]);

  if (loading) {
    return <p className="p-6 text-center text-gray-600">Loading dashboard data...</p>;
  }

  if (error) {
    return <p className="p-6 text-center text-red-500">Error: {error}</p>;
  }

  // Bar chart configuration (Volunteers per Event)
  const barData = {
    labels: eventNames,
    datasets: [
      {
        label: 'Volunteers',
        data: volunteersPerEvent,
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
    ],
  };
  const barOptions = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  // Pie chart configuration (Donation Distribution by Denomination)
  const pieData = {
    labels: donationCategories,
    datasets: [
      {
        label: 'Donation Distribution',
        data: donationAmounts,
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(255, 205, 86, 0.6)',
          'rgba(201, 203, 207, 0.6)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(255, 205, 86, 1)',
          'rgba(201, 203, 207, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };
  const pieOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
      },
    },
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">Organiser Dashboard</h2>
  
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        {/* Events Organized */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-sm font-medium text-gray-500 uppercase">Events Organized</h3>
          <p className="mt-2 text-3xl font-semibold text-gray-800">{totalEvents}</p>
        </div>
  
        {/* Volunteers */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-sm font-medium text-gray-500 uppercase">Volunteers</h3>
          <p className="mt-2 text-3xl font-semibold text-gray-800">{totalVolunteers}</p>
        </div>
  
        {/* Donations Received */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-sm font-medium text-gray-500 uppercase">Donations Received</h3>
          <p className="mt-2 text-3xl font-semibold text-gray-800">₹{totalDonations}</p>
        </div>
  
        {/* Trees Planted */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-sm font-medium text-gray-500 uppercase">Trees Planted</h3>
          <p className="mt-2 text-3xl font-semibold text-gray-800">{Math.floor(treesPlanted)}</p>
        </div>
      </div>
  
      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Bar Chart (Volunteers per Event) */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Volunteers per Event</h3>
          <div className="h-64">
            <Bar data={barData} options={barOptions} />
          </div>
        </div>
  
        {/* Pie Chart (Donation Distribution by Denomination) */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Donation Distribution by Denomination</h3>
          <div className="h-64">
            <Pie data={pieData} options={pieOptions} />
          </div>
        </div>
      </div>
  
      {/* Donations List */}
      <div className="mt-8">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Donations Received</h3>
        {donations.length > 0 ? (
          <ul className="space-y-4">
            {donations.map((donation) => (
              <li key={donation._id} className="bg-white shadow-md rounded-lg p-4">
                <p className="font-medium">{donation.donorName} donated ₹{donation.amount}</p>
                <p className="text-gray-600">Email: {donation.email}</p>
                <p className="text-gray-600">Message: {donation.message}</p>
                <p className="text-gray-500 text-sm">Status: {donation.status}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No donations received yet.</p>
        )}
      </div>
  
    </div>
  );
}

export default Dashboard;
