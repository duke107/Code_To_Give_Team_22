import React, { useEffect, useState } from "react";
import axios from "axios";

const CityDataModal = ({ city, closeModal }) => {
  const [users, setUsers] = useState([]);
  const [pastEvents, setPastEvents] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!city) return;

    const fetchCityData = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/api/v1/admin/city-details/${city}`);
        console.log(response.data);
        setUsers(response.data.users);
        setPastEvents(response.data.pastEvents);
        setUpcomingEvents(response.data.upcomingEvents);
      } catch (error) {
        console.error("Error fetching city data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCityData();
  }, [city]);

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-lg w-3/4 max-h-[80vh] overflow-y-auto relative">
        <button onClick={closeModal} className="absolute top-3 right-4 text-gray-600">✖</button>
        <h2 className="text-xl font-bold mb-4 text-center">City: {city}</h2>

        {loading ? (
          <p className="text-center">Loading...</p>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            {/* Left Side - Users List */}
            <div className="col-span-1 bg-gray-100 p-4 rounded-lg shadow-md overflow-y-auto">
              <h3 className="text-lg font-semibold mb-2">Users in {city}</h3>
              {users.length === 0 ? (
                <p>No users found.</p>
              ) : (
                <ul className="space-y-2">
                  {users.map((user) => (
                    <li key={user._id} className="p-2 border rounded-lg shadow flex items-center">
                      <img src={user.avatar?.url || "/default-avatar.png"} alt="avatar" className="w-10 h-10 rounded-full mr-3" />
                      <div>
                        <p className="font-semibold">{user.name}</p>
                        <p className="text-sm text-gray-500">{user.role}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Right Side - Events */}
            <div className="col-span-2 space-y-6">
              {/* Upcoming Events */}
              <div className="bg-blue-100 p-4 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold mb-2">Upcoming Events</h3>
                {upcomingEvents.length === 0 ? (
                  <p>No upcoming events.</p>
                ) : (
                  <ul className="space-y-2">
                    {upcomingEvents.map((event) => (
                      <li key={event._id} className="p-2 border rounded-lg shadow">
                        <h4 className="font-bold">{event.title}</h4>
                        <p className="text-sm">{event.description}</p>
                        <p className="text-sm text-gray-600">Starts: {new Date(event.startDate).toLocaleDateString()}</p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Past Events */}
              <div className="bg-gray-200 p-4 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold mb-2">Past Events</h3>
                {pastEvents.length === 0 ? (
                  <p>No past events.</p>
                ) : (
                  <ul className="space-y-2">
                    {pastEvents.map((event) => (
                      <li key={event._id} className="p-2 border rounded-lg shadow">
                        <h4 className="font-bold">{event.title}</h4>
                        <p className="text-sm">{event.description}</p>
                        <p className="text-sm text-gray-600">Ended: {new Date(event.endDate).toLocaleDateString()}</p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CityDataModal;
