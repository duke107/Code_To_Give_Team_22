import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import UserCard from "./UserCard";
import UserDetailsModal from "./UserDetailsModal"; 
import StoryCardWithModal from "./StoryCardWithModal";

const CityDetails = () => {
  const { city } = useParams();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [organizers, setOrganizers] = useState([]);
  const [pastEvents, setPastEvents] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [activeSection, setActiveSection] = useState("users"); // Track which section is active

  useEffect(() => {
    if (!city) return;

    const fetchCityDetails = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/api/v1/admin/city-details/${city}`);

        if (response.data) {
          setUsers(response.data.users);
          setOrganizers(response.data.organizers);
          setPastEvents(response.data.pastEvents || []);
          setUpcomingEvents(response.data.upcomingEvents || []);
        }
      } catch (error) {
        console.error("Error fetching city details:", error);
      }
    };

    fetchCityDetails();
  }, [city]);

  return (
    <div className="p-4">
        <div className="relative flex items-center justify-center mb-4 min-h-[50px]">
          {/* Back Button (Aligned Left) */}
          <button 
            className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-red-500 text-white px-4 py-2 rounded" 
            onClick={() => navigate(-1)}
          >
            Back
          </button>

          {/* Centered Heading */}
          <h2 className="text-2xl font-bold">Details for {city}</h2>
        </div>
      {/* Toggle Buttons */}
      <div className="flex justify-center space-x-4 mb-6">
        <button
          className={`px-4 py-2 rounded ${activeSection === "users" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
          onClick={() => setActiveSection("users")}
        >
          Users
        </button>
        <button
          className={`px-4 py-2 rounded ${activeSection === "organizers" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
          onClick={() => setActiveSection("organizers")}
        >
          Event Organizers
        </button>
        <button
          className={`px-4 py-2 rounded ${activeSection === "pastEvents" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
          onClick={() => setActiveSection("pastEvents")}
        >
          Past Events
        </button>
        <button
          className={`px-4 py-2 rounded ${activeSection === "upcomingEvents" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
          onClick={() => setActiveSection("upcomingEvents")}
        >
          Upcoming Events
        </button>
      </div>

      {/* Conditionally Render Sections */}
      {activeSection === "users" && (
        <div className="grid grid-cols-3 gap-4">
          {users.length > 0 ? (
            users.map((user) => (
              <UserCard key={user._id} user={user} onShowDetails={() => setSelectedUser(user)} />
            ))
          ) : (
            <p className="col-span-3 text-gray-500">No users found.</p>
          )}
        </div>
      )}

      {activeSection === "organizers" && (
        <div className="grid grid-cols-3 gap-4">
          {organizers.length > 0 ? (
            organizers.map((organizer) => (
              <UserCard key={organizer._id} user={organizer} onShowDetails={() => setSelectedUser(organizer)} />
            ))
          ) : (
            <p className="col-span-3 text-gray-500">No event organizers found.</p>
          )}
        </div>
      )}

      {activeSection === "pastEvents" && (
        <div className="grid grid-cols-3 gap-4">
          {pastEvents.length > 0 ? (
            pastEvents.map((event, index) => <StoryCardWithModal key={index} event={event} />)
          ) : (
            <p className="col-span-3 text-gray-500">No past events found.</p>
          )}
        </div>
      )}

      {activeSection === "upcomingEvents" && (
        <div className="grid grid-cols-3 gap-4">
          {upcomingEvents.length > 0 ? (
            upcomingEvents.map((event, index) => <StoryCardWithModal key={index} event={event} />)
          ) : (
            <p className="col-span-3 text-gray-500">No upcoming events found.</p>
          )}
        </div>
      )}


      {/* User Details Popup */}
      {selectedUser && <UserDetailsModal user={selectedUser} onClose={() => setSelectedUser(null)} />}
    </div>
  );
};

export default CityDetails;
