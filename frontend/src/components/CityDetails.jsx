import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import UserCard from "./UserCard";
import UserDetailsModal from "./UserDetailsModal";

const CityDetails = () => {
  const { city } = useParams();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [organizers, setOrganizers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    if (!city) return;

    const fetchCityDetails = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/api/v1/admin/city-details/${city}`);

        if (response.data) {
          setUsers(response.data.users);
          setOrganizers(response.data.organizers);
        }
      } catch (error) {
        console.error("Error fetching city details:", error);
      }
    };

    fetchCityDetails();
  }, [city]);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4 text-center">Details for {city}</h2>

      {/* Users Section */}
      <div className="mb-6">
        <h3 className="text-lg font-bold mb-4">Users in {city}</h3>
        <div className="grid grid-cols-3 gap-4">
          {users.length > 0 ? (
            users.map((user) => (
              <UserCard key={user._id} user={user} onShowDetails={() => setSelectedUser(user)} />
            ))
          ) : (
            <p className="col-span-3 text-gray-500">No users found.</p>
          )}
        </div>
      </div>

      {/* Event Organizers Section */}
      <div className="mb-6">
        <h3 className="text-lg font-bold mb-4">Event Organizers</h3>
        <div className="grid grid-cols-3 gap-4">
          {organizers.length > 0 ? (
            organizers.map((organizer) => (
              <UserCard key={organizer._id} user={organizer} onShowDetails={() => setSelectedUser(organizer)} />
            ))
          ) : (
            <p className="col-span-3 text-gray-500">No event organizers found.</p>
          )}
        </div>
      </div>

      {/* Back Button */}
      <button className="mt-4 bg-red-500 text-white px-4 py-2 rounded" onClick={() => navigate(-1)}>
        Back
      </button>

      {/* User Details Popup */}
      {selectedUser && <UserDetailsModal user={selectedUser} onClose={() => setSelectedUser(null)} />}
    </div>
  );
};

export default CityDetails;
