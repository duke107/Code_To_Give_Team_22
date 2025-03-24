import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";

const PendingApprovals = () => {
  const [pendingEvents, setPendingEvents] = useState([]);
  const [expandedEvent, setExpandedEvent] = useState(null);
  const token = useSelector((state) => state.admin.token);

  const toggleDetails = (eventId) => {
    setExpandedEvent(expandedEvent === eventId ? null : eventId);
  };

  const onApprove = async (eventId) => {
    try {
      const response = await axios.post(
        `http://localhost:3000/api/v1/admin/approve/${eventId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(response.data.message);
      setPendingEvents(pendingEvents.filter((event) => event._id !== eventId));
    } catch (error) {
      console.error("Error approving event", error);
    }
  };

  const onReject = async (eventId) => {
    // console.log("this is eventId", eventId);
    try {
      const response = await axios.post(
        `http://localhost:3000/api/v1/admin/reject/${eventId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.error(response.data.message);
      setPendingEvents(pendingEvents.filter((event) => event._id !== eventId));
    } catch (error) {
      console.error("Error rejecting event", error);
    }
  };

  useEffect(() => {
    const fetchPendingEvents = async () => {
      try {
        const response = await axios.get(
          "http://localhost:3000/api/v1/admin/pending-events",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setPendingEvents(response.data.events);
      } catch (error) {
        console.error("Error fetching pending events", error);
      }
    };
    if (token) fetchPendingEvents();
  }, [token]);

  return (
    <div className="p-8 bg-gray-50 shadow-lg rounded-lg mx-auto max-w-4xl mt-8 transition-all duration-300">
      <h2 className="text-3xl font-bold text-gray-800 border-b pb-3 tracking-wide">
        Pending Approvals
      </h2>

      {pendingEvents.length === 0 ? (
        <p className="text-gray-500 text-lg text-center mt-4">
          No pending events.
        </p>
      ) : (
        <ul className="space-y-4 mt-4">
          {pendingEvents.map((event) => (
            <motion.li
              key={event._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="bg-white p-6 rounded-lg shadow-md border border-gray-200 transition-all duration-300 hover:shadow-lg"
            >
              {/* Event Title and Buttons */}
              <div className="flex justify-between items-center">
                <span className="text-2xl font-semibold text-gray-900 leading-snug">
                  {event.title}
                </span>
                <div className="space-x-2">
                  <button
                    className="bg-teal-500 text-white px-4 py-1 rounded-md transition-all duration-200 hover:bg-teal-600 hover:shadow-md"
                    onClick={() => toggleDetails(event._id)}
                  >
                    {expandedEvent === event._id ? "Hide" : "Details"}
                  </button>
                  <button
                    className="bg-green-500 text-white px-4 py-1 rounded-md transition-all duration-200 hover:bg-green-600 hover:shadow-md"
                    onClick={() => onApprove(event._id)}
                  >
                    Approve
                  </button>
                  <button
                    className="bg-red-500 text-white px-4 py-1 rounded-md transition-all duration-200 hover:bg-red-600 hover:shadow-md"
                    onClick={() => onReject(event._id)}
                  >
                    Reject
                  </button>
                </div>
              </div>

              {/* Event Details (Dropdown Animation) */}
              <AnimatePresence>
                {expandedEvent === event._id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mt-4 bg-gray-100 p-4 rounded-lg border-l-4 border-teal-500 shadow-sm"
                  >
                    <p className="text-gray-700">
                      <strong>Start Date:</strong>{" "}
                      {new Date(event.eventStartDate).toLocaleString()}
                    </p>
                    <p className="text-gray-700">
                      <strong>End Date:</strong>{" "}
                      {new Date(event.eventEndDate).toLocaleString()}
                    </p>
                    <p className="text-gray-700">
                      <strong>Location:</strong> {event.eventLocation}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default PendingApprovals;
