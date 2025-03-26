import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

function Events() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [activeFilter, setActiveFilter] = useState("approved");

  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    const fetchEvents = async () => {
      if (!user?._id) return;

      setIsLoading(true);
      try {
        const res = await fetch(
          `http://localhost:3000/api/v1/events/getEvents?createdBy=${user._id}`,
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
          }
        );

        if (res.ok) {
          const data = await res.json();
          setEvents(data);
          filterEvents(activeFilter, data);
        } else {
          console.error("Error:", res.status, res.statusText);
        }
      } catch (error) {
        console.error("Error fetching events:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, [user]);

  const filterEvents = (filter, eventList = events) => {
    const currentDate = new Date();

    let filtered = [];
    switch (filter) {
      case "approved":
        filtered = eventList.filter((event) => event.isApproved);
        break;
      case "notApproved":
        filtered = eventList.filter((event) => !event.isApproved);
        break;
      case "ongoing":
        filtered = eventList.filter(
          (event) =>
            event.isApproved &&
            new Date(event.eventStartDate) <= currentDate &&
            new Date(event.eventEndDate) >= currentDate
        );
        break;
      case "upcoming":
        filtered = eventList.filter(
          (event) =>
            event.isApproved && new Date(event.eventStartDate) > currentDate
        );
        break;
      case "past":
        filtered = eventList.filter(
          (event) =>
            event.isApproved && new Date(event.eventEndDate) < currentDate
        );
        break;
      default:
        filtered = eventList;
    }
    setFilteredEvents(filtered);
  };

  useEffect(() => {
    filterEvents(activeFilter);
  }, [activeFilter, events]);

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
  };

  const handleAddEvent = () => {
    navigate("/create");
  };

  const handleViewEvent = (slug) => {
    navigate(`/event/${slug}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Title & Add Event Button */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">My Events</h1>
        <button
          onClick={handleAddEvent}
          className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-lg shadow transition-colors duration-200"
        >
          Add New Event
        </button>
      </div>

      {/* Filter Buttons */}
      <div className="flex justify-center space-x-4 mb-6">
        {[
          { label: "Approved ", value: "approved" },
          { label: "Pending ", value: "notApproved" },
          { label: "Ongoing ", value: "ongoing" },
          { label: "Upcoming ", value: "upcoming" },
          { label: "Ended", value: "past" },
        ].map(({ label, value }) => (
          <button
            key={value}
            onClick={() => handleFilterChange(value)}
            className={`px-4 py-2 rounded-lg font-medium text-white transition-all duration-200 shadow-md ${
              activeFilter === value ? "bg-blue-700" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          {/* No Events Found */}
          {filteredEvents.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                No events found
              </h3>
              <p className="mt-2 text-gray-500">
                Try selecting a different category or create a new event.
              </p>
              <button
                onClick={handleAddEvent}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Create Event
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
              {filteredEvents.map((event) => (
                <motion.div
                  key={event._id}
                  className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 hover:shadow-2xl transition-all duration-300 group p-6 text-center"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="relative w-32 h-32 mx-auto rounded-full overflow-hidden shadow-lg">
                    {event.image && (
                      <img
                        src={event.image}
                        alt={event.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    )}
                  </div>
                  <div className="mt-4">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors duration-300">
                      {event.title}
                    </h2>
                    <div
                      className="text-gray-600 text-base leading-relaxed mb-4 line-clamp-3"
                      dangerouslySetInnerHTML={{ __html: event.content }}
                    />
                    <p className="px-6 text-gray-600 mb-4">
                      Date:{" "}
                      {new Date(event.eventStartDate).toLocaleDateString()}
                    </p>
                    <button
                      onClick={() => handleViewEvent(event.slug)}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg"
                    >
                      View Details
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Events;
