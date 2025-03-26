import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import StoryCardWithModal from "./StoryCardWithModal";

const PendingApprovals = () => {
  const [pendingEvents, setPendingEvents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const token = useSelector((state) => state.admin.token);

  // Function to approve an event
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

  // Function to handle reject button click
  const handleRejectClick = (eventId) => {
    if (window.confirm("Are you sure you want to reject this event?")) {
      setSelectedEventId(eventId);
      setShowModal(true);
    }
  };

  // Function to reject an event
  const onReject = async () => {
    if (!rejectionReason.trim()) {
      toast.error("Rejection reason is required!");
      return;
    }

    try {
      const response = await axios.post(
        `http://localhost:3000/api/v1/admin/reject/${selectedEventId}`,
        { reason: rejectionReason }, // Send reason in request body
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.error(response.data.message);
      setPendingEvents((prevEvents) =>
        prevEvents.filter((event) => event._id !== selectedEventId)
      );
      setShowModal(false);
      setRejectionReason("");
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
                  description: typeof event.content === "string" ? event.content : JSON.stringify(event.content),
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
                  onClick={() => handleRejectClick(event._id)}
                >
                  X
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Rejection Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-96">
            <h2 className="text-xl font-semibold mb-4 text-center">Reject Event</h2>
            <textarea
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500"
              placeholder="Enter rejection reason..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
            ></textarea>
            <div className="flex justify-end mt-4">
              <button
                className="bg-gray-400 text-white px-4 py-2 rounded-md mr-2 hover:bg-gray-500"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button
                className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
                onClick={onReject}
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PendingApprovals;
