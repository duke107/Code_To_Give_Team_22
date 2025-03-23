import React, { useEffect, useState } from 'react';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS } from 'chart.js/auto';
import 'tailwindcss/tailwind.css';
import { useSelector } from 'react-redux';
//HANDLE HANDLE DONATIONS FOR EACH EVENT AND PLANT TREES ACCORDINGLY
function Dashboard() {
  // Example: if you have user in Redux or context
  const { user } = useSelector((state) => state.auth);


  // States for fetched events & loading/error
  const [events, setEvents] = useState([]);
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
  const [donationCategories, setDonationCategories] = useState(['Donations']);
  const [donationAmounts, setDonationAmounts] = useState([0]);

  useEffect(() => {
    // Only fetch if user is available
    if (!user?._id) return;

    const fetchMyEvents = async () => {
      try {
        // Reuse the same /getEvents endpoint but add ?createdBy=<userId>
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

        // Compute total volunteers, donations, trees, etc.
        let overallVolunteers = 0;
        let overallDonations = 0;
        let overallTrees = 0;

        const names = [];
        const volunteersCountArray = [];

        data.forEach((evt) => {
          // Summation of volunteers across volunteeringPositions
          let eventVolunteers = 0;
          if (evt.volunteeringPositions) {
            evt.volunteeringPositions.forEach((pos) => {
              if (pos.registeredUsers) {
                eventVolunteers += pos.registeredUsers.length;
              }
            });
          }
          overallVolunteers += eventVolunteers;

          // Summation of donations/trees (assuming fields exist)
          overallDonations += evt.donations || 0;
          overallTrees += evt.treesPlanted || 0;

          // Prepare data for bar chart
          names.push(evt.title);
          volunteersCountArray.push(eventVolunteers);
        });

        setTotalVolunteers(overallVolunteers);
        setTotalDonations(overallDonations);
        setTreesPlanted(overallTrees);

        setEventNames(names);
        setVolunteersPerEvent(volunteersCountArray);

        // For pie chart example, if you have categories, adapt accordingly.
        setDonationCategories(['Total Donations']);
        setDonationAmounts([overallDonations]);
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

  // Pie chart configuration (Donation Distribution)
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
    <div className="p-6">
      <h2 className="text-3xl font-bold mb-4 text-gray-800">User Dashboard</h2>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-6">
        {/* Total Events Card */}
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-gray-500 text-sm uppercase">Events Organized</h3>
          <p className="text-2xl font-semibold text-gray-800">{totalEvents}</p>
        </div>

        {/* Total Volunteers Card */}
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-gray-500 text-sm uppercase">Volunteers</h3>
          <p className="text-2xl font-semibold text-gray-800">{totalVolunteers}</p>
        </div>

        {/* Donations Received Card */}
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-gray-500 text-sm uppercase">Donations Received</h3>
          <p className="text-2xl font-semibold text-gray-800">${totalDonations}</p>
        </div>

        {/* Trees Planted Card */}
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-gray-500 text-sm uppercase">Trees Planted</h3>
          <p className="text-2xl font-semibold text-gray-800">{treesPlanted}</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            Volunteers per Event
          </h3>
          <div className="h-64">
            <Bar data={barData} options={barOptions} />
          </div>
        </div>

        {/* Pie Chart */}
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            Donation Distribution
          </h3>
          <div className="h-64">
            <Pie data={pieData} options={pieOptions} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
