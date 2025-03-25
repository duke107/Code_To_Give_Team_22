import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import UserCard from "./UserCard";
import UserDetailsModal from "./UserDetailsModal";
import { AnimatePresence, motion } from "framer-motion";

const CityDetails = () => {
  const { city } = useParams();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [organizers, setOrganizers] = useState([]);
  const [pastEvents, setPastEvents] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [activeSection, setActiveSection] = useState("users"); // Default section: Users
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    if (!city) return;

    const fetchCityDetails = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/api/v1/admin/city-details/${city}`);
        if (response.data) {
          setUsers(response.data.users);
          setOrganizers(response.data.organizers);
          setPastEvents(response.data.pastEvents);
          setUpcomingEvents(response.data.upcomingEvents);
        }
      } catch (error) {
        console.error("Error fetching city details:", error);
      }
    };

    fetchCityDetails();
  }, [city]);

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold mb-6 text-center">Details for {city}</h2>

      {/* Navigation Buttons */}
      <div className="flex justify-center space-x-4 mb-6">
        <button
          className={`px-4 py-2 rounded-lg ${activeSection === "users" ? "bg-blue-600 text-white" : "bg-gray-300"}`}
          onClick={() => setActiveSection("users")}
        >
          Users
        </button>
        <button
          className={`px-4 py-2 rounded-lg ${activeSection === "organizers" ? "bg-blue-600 text-white" : "bg-gray-300"}`}
          onClick={() => setActiveSection("organizers")}
        >
          Event Organizers
        </button>
        <button
          className={`px-4 py-2 rounded-lg ${activeSection === "upcomingEvents" ? "bg-blue-600 text-white" : "bg-gray-300"}`}
          onClick={() => setActiveSection("upcomingEvents")}
        >
          Upcoming Events
        </button>
        <button
          className={`px-4 py-2 rounded-lg ${activeSection === "pastEvents" ? "bg-blue-600 text-white" : "bg-gray-300"}`}
          onClick={() => setActiveSection("pastEvents")}
        >
          Past Events
        </button>
      </div>

      {/* Display Users */}
      {activeSection === "users" && (
        <div className="mb-8">
          <h3 className="text-xl font-bold mb-4">Users in {city}</h3>
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
      )}

      {/* Display Event Organizers */}
      {activeSection === "organizers" && (
        <div className="mb-8">
          <h3 className="text-xl font-bold mb-4">Event Organizers</h3>
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
      )}

      {/* Display Upcoming Events */}
      {activeSection === "upcomingEvents" && (
  <div className="mb-8">
    <h3 className="text-xl font-bold mb-4">Upcoming Events</h3>
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {upcomingEvents.length > 0 ? (
        upcomingEvents.map((event) => (
          <div key={event._id} className="p-4 border rounded-lg shadow">
            <h4 className="font-semibold">{event.title}</h4>
            <p className="text-gray-600">{formatDate(event.eventStartDate)}</p>
            <button
              className="mt-2 bg-blue-500 text-white px-4 py-2 rounded transition hover:bg-blue-600"
              onClick={() => setSelectedEvent(event)}
            >
              Show Details
            </button>
          </div>
        ))
      ) : (
        <p className="col-span-3 text-gray-500">No upcoming events found.</p>
      )}
    </div>
  </div>
)}

{/* Display Past Events */}
{activeSection === "pastEvents" && (
  <div className="mb-12">
    <h3 className="text-xl font-bold mb-4">Past Events</h3>
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {pastEvents.length > 0 ? (
        pastEvents.map((event) => (
          <div key={event._id} className="p-4 border rounded-lg shadow">
            <h4 className="font-semibold">{event.title}</h4>
            <p className="text-gray-600">{formatDate(event.eventStartDate)}</p>
            <button
              className="mt-2 bg-blue-500 text-white px-4 py-2 rounded transition hover:bg-blue-600"
              onClick={() => setSelectedEvent(event)}
            >
              Show Details
            </button>
          </div>
        ))
      ) : (
        <p className="col-span-3 text-gray-500">No past events found.</p>
      )}
    </div>
  </div>
)}

{/* Event Details Modal */}
<AnimatePresence>
  {selectedEvent && (
    <motion.div
      className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full max-h-[90vh] overflow-y-auto relative"
        initial={{ y: 50 }}
        animate={{ y: 0 }}
        exit={{ y: 50 }}
        transition={{ duration: 0.3 }}
      >
        <img src={selectedEvent.image || "/default-event.jpg"} alt={selectedEvent.title} className="w-full h-48 object-cover rounded" />
        <h2 className="text-2xl font-semibold mt-4">{selectedEvent.title}</h2>
        <p className="text-gray-600 mt-2"><strong>Location:</strong> {selectedEvent.eventLocation}</p>
        <p className="text-gray-600"><strong>Start Date:</strong> {formatDate(selectedEvent.eventStartDate)}</p>
        <p className="text-gray-600"><strong>End Date:</strong> {formatDate(selectedEvent.eventEndDate)}</p>
        <p className="text-gray-600 mt-2"><strong>Details:</strong> {selectedEvent.description}</p>
        <p className="text-gray-600 mt-2"><strong>Created By:</strong> {selectedEvent.createdByUser || "Unknown"}</p>

        <div className="flex justify-end mt-4">
          <button onClick={() => setSelectedEvent(null)} className="bg-red-500 text-white px-4 py-2 rounded transition hover:bg-red-600">
            Close
          </button>
        </div>
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>
</div>
)};

export default CityDetails;
