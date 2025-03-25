import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";

const PastEvents = () => {
  const [pastEvents, setPastEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
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

  return (
    <div className="p-8 bg-gray-50 shadow-lg rounded-lg mx-auto max-w-6xl mt-8">
      <h2 className="text-3xl font-bold text-gray-800 border-b pb-3 tracking-wide">
        Past Events
      </h2>

      {pastEvents.length === 0 ? (
        <p className="text-gray-500 text-lg text-center mt-4">
          No past events found.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {pastEvents.map((event) => (
            <motion.div
              key={event._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="bg-white p-6 rounded-lg shadow-md border border-gray-200 transition-all duration-300 hover:shadow-lg"
            >
              <img
                src={event.image || "/default-event.jpg"} // Placeholder image
                alt={event.title}
                className="w-full h-40 object-cover rounded-md"
              />
              <div className="mt-4">
                <h3 className="text-xl font-semibold text-gray-900">
                  {event.title}
                </h3>
                <span
                  className={`inline-block mt-2 px-3 py-1 text-sm font-medium rounded-full ${
                    event.isApproved
                      ? "bg-green-100 text-green-600"
                      : "bg-red-100 text-red-600"
                  }`}
                >
                  {event.isApproved ? "Approved ✅" : "Rejected ❌"}
                </span>
              </div>

              <button
                className="mt-3 bg-blue-500 text-white px-4 py-1 rounded-md transition-all duration-200 hover:bg-blue-600 hover:shadow-md"
                onClick={() => setSelectedEvent(event)}
              >
                View Details
              </button>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal for Event Details */}
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
              {/* Event Image */}
              <img
                src={selectedEvent.image || "/default-event.jpg"}
                alt={selectedEvent.title}
                className="w-full h-48 object-cover rounded"
              />

              <h2 className="text-2xl font-semibold mt-4">{selectedEvent.title}</h2>
              <p className="text-gray-600 mt-2">
                <strong>Location:</strong> {selectedEvent.eventLocation}
              </p>
              <p className="text-gray-600">
                <strong>Start Date:</strong> {formatDate(selectedEvent.eventStartDate)}
              </p>
              <p className="text-gray-600">
                <strong>End Date:</strong> {formatDate(selectedEvent.eventEndDate)}
              </p>
              <p className="text-gray-600 mt-2">
                <strong>Details:</strong>{" "}
                {typeof selectedEvent.description === "string"
                  ? selectedEvent.description
                  : JSON.stringify(selectedEvent.description)}
              </p>
              <p className="text-gray-600 mt-2">
                <strong>Created By:</strong> {selectedEvent.createdByUser || "Unknown"}
              </p>

              <div className="flex justify-end mt-4">
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="bg-red-500 text-white px-4 py-2 rounded transition hover:bg-red-600"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PastEvents;
