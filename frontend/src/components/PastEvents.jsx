import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";

const PastEvents = () => {
  const [pastEvents, setPastEvents] = useState([]);
  const [expandedEvents, setExpandedEvents] = useState(new Set());
  const token = useSelector((state) => state.admin.token);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  useEffect(() => {
    const fetchPastEvents = async () => {
      try {
        const response = await axios.get(
          "http://localhost:3000/api/v1/admin/past-events",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setPastEvents(response.data.events);
      } catch (error) {
        console.error("Error fetching past events", error);
      }
    };
    if (token) fetchPastEvents();
  }, [token]);

  const toggleDetails = (eventId) => {
    setExpandedEvents((prevExpanded) => {
      const newExpanded = new Set(prevExpanded);
      if (newExpanded.has(eventId)) {
        newExpanded.delete(eventId);
      } else {
        newExpanded.add(eventId);
      }
      return newExpanded;
    });
  };

  return (
    <div className="p-8 bg-gray-50 shadow-lg rounded-lg mx-auto max-w-4xl mt-8">
      <h2 className="text-3xl font-bold text-gray-800 border-b pb-3 tracking-wide">
        Past Events
      </h2>

      {pastEvents.length === 0 ? (
        <p className="text-gray-500 text-lg text-center mt-4">
          No past events found.
        </p>
      ) : (
        <ul className="space-y-4 mt-4">
          {pastEvents.map((event) => (
            <li
              key={event._id}
              className="bg-white p-6 rounded-lg shadow-md border border-gray-200 transition-all duration-300 hover:shadow-lg"
            >
              {/* Event Title, Status, and Button */}
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-2xl font-semibold text-gray-900 leading-snug">
                    {event.title}
                  </span>
                  <span
                    className={`ml-3 px-3 py-1 text-sm font-medium rounded-full ${
                      event.isApproved ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                    }`}
                  >
                    {event.isApproved ? "Approved ✅" : "Rejected ❌"}
                  </span>
                </div>

                <button
                  className="bg-blue-500 text-white px-4 py-1 rounded-md transition-all duration-200 hover:bg-blue-600 hover:shadow-md"
                  onClick={() => toggleDetails(event._id)}
                >
                  {expandedEvents.has(event._id) ? "Hide Details" : "View Details"}
                </button>
              </div>

              {/* Event Details (Smooth Expand/Collapse Animation) */}
              <AnimatePresence>
                {expandedEvents.has(event._id) && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="mt-4 bg-gray-100 p-4 rounded-lg border-l-4 border-blue-500 shadow-sm overflow-hidden"
                  >
                    <p className="text-gray-700">
                      <strong>Location:</strong> {event.eventLocation}
                    </p>
                    <p className="text-gray-700">
                      <strong>Start:</strong> {formatDate(event.eventStartDate)}
                    </p>
                    <p className="text-gray-700">
                      <strong>End:</strong> {formatDate(event.eventEndDate)}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default PastEvents;
