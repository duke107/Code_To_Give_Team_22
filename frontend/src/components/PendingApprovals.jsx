import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import StoryCardWithModal from "./StoryCardWithModal"; // Using the new component

const PendingApprovals = () => {
  const [pendingEvents, setPendingEvents] = useState([]);
  const token = useSelector((state) => state.admin.token);

  const onApprove = async (eventId) => {
    try {
      const response = await axios.post(
        `http://localhost:3000/api/v1/admin/approve/${eventId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(response.data.message);
      setPendingEvents((prevEvents) =>
        prevEvents.filter((event) => event._id !== eventId)
      );
    } catch (error) {
      console.error("Error approving event", error);
    }
  };

  const onReject = async (eventId) => {
    try {
      console.log("Rejecting event with ID:", eventId); // Debugging
  
      const response = await axios.delete(
        `http://localhost:3000/api/v1/admin/reject/${eventId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      // console.log(response.data);
      toast.error(response.data.message);
  
      // Remove event from pending list
      setPendingEvents((prevEvents) =>
        prevEvents.filter((event) => event._id !== eventId)
      );
    } catch (error) {
      console.error("Error rejecting event:", error);
    }
  };
  
  

  useEffect(() => {
    const fetchPendingEvents = async () => {
      try {
        const response = await axios.get(
          "http://localhost:3000/api/v1/admin/pending-events",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log(response.data);
        setPendingEvents(response.data.events);
      } catch (error) {
        console.error("Error fetching pending events", error);
      }
    };
    if (token) fetchPendingEvents();
  }, [token]);

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h2 className="text-3xl font-bold text-gray-800 border-b pb-3 mb-6 tracking-wide">
        Pending Approvals
      </h2>

      {pendingEvents.length === 0 ? (
        <p className="text-gray-500 text-lg text-center mt-4">
          No pending events.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {pendingEvents.map((event) => (
            <div key={event._id} className="relative">
              <StoryCardWithModal
                event={{
                  id: event._id,
                  title: event.title,
                  description: typeof event.content === "string" ? event.content : JSON.stringify(event.content), // Ensure it's a string
                  image: event.image || "https://via.placeholder.com/300",
                  eventLocation: event.eventLocation,
                  eventStartDate: event.eventStartDate,
                  eventEndDate: event.eventEndDate,
                  volunteeringPositions: event.volunteeringPositions,
                  registeredVolunteers: event.registeredVolunteers,
                  createdBy: event.createdBy,
                }}
              />
              {/* Approval & Rejection Buttons */}
              <div className="absolute top-3 right-3 flex space-x-2">
                <button
                  className="bg-green-500 text-white px-3 py-1 rounded-md transition-all duration-200 hover:bg-green-600 shadow-md"
                  onClick={() => onApprove(event._id)}
                >
                  ✔
                </button>
                <button
                  className="bg-red-500 text-white px-3 py-1 rounded-md transition-all duration-200 hover:bg-red-600 shadow-md"
                  onClick={() => onReject(event._id)}
                >
                  X
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PendingApprovals;
