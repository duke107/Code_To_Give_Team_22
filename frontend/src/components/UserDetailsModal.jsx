import React, { useEffect, useState } from "react";
import axios from "axios";

const UserDetailsModal = ({ user, onClose }) => {
  const [eventDetails, setEventDetails] = useState([]);
  const [warningMessage, setWarningMessage] = useState("");
  const [showWarnForm, setShowWarnForm] = useState(false);

  useEffect(() => {
    // If user is an organiser and has events, fetch them
    if (user?.role === "Event Organiser" && user.events.length > 0) {
      fetchEventDetails();
    }
  }, [user]);

  const fetchEventDetails = async () => {
    try {
      const eventIds = user.events.map((event) => event.eventId);
      const response = await axios.post("http://localhost:3000/api/v1/admin/getEvents", { eventIds });

      if (response.data) {
        setEventDetails(response.data.events);
      }
    } catch (error) {
      console.error("Error fetching event details:", error);
    }
  };

  const handleWarnSubmit = async () => {
    if (!user) return;
    try {
      await axios.post("http://localhost:3000/api/v1/admin/warn-organizer", {
        userId: user._id,
        message: warningMessage,
      });

      alert("Warning sent successfully!");
      setShowWarnForm(false);
      setWarningMessage("");
    } catch (error) {
      console.error("Error sending warning:", error);
      alert("Failed to send warning.");
    }
  };

  const handleRemoveOrganizer = async () => {
    if (!user || !window.confirm("Are you sure you want to remove this organizer?")) return;

    try {
      await axios.delete(`http://localhost:3000/api/v1/admin/remove-organizer/${user._id}`);

      alert("Organizer removed successfully!");
      onClose(); // Close the modal after removal
    } catch (error) {
      console.error("Error removing organizer:", error);
      alert("Failed to remove organizer.");
    }
  };

  // New: handle promoting a user to event organiser
  const handlePromoteToOrganiser = async () => {
    if (!user || !window.confirm("Promote this user to Event Organiser?")) return;

    try {
      // Adjust endpoint to match your backend
      await axios.post("http://localhost:3000/api/v1/admin/promote-organiser", {
        userId: user._id,
      });

      alert("User promoted to Event Organiser successfully!");
      onClose(); // Close the modal, or you can refetch user details if needed
    } catch (error) {
      console.error("Error promoting user:", error);
      alert("Failed to promote user.");
    }
  };

  if (!user) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-[500px] max-h-[80vh] overflow-y-auto relative">
        {/* Close Modal Button (top-right corner) */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-gray-300 hover:bg-gray-400 rounded-full p-2"
        >
          ✖
        </button>

        <h2 className="text-xl font-bold mb-4">{`${user.role}`} Details</h2>

        {/* Avatar & Name */}
        <div className="flex items-center space-x-4 mb-4">
          <img
            src={user.avatar || "https://via.placeholder.com/80"}
            alt="User Avatar"
            className="w-16 h-16 rounded-full object-cover"
          />
          <h3 className="text-lg font-semibold">{user.name}</h3>
        </div>

        {/* Basic Details */}
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Role:</strong> {user.role}</p>
        <p><strong>Location:</strong> {user.location || "N/A"}</p>
        <p><strong>Account Verified:</strong> {user.accountVerified ? "✅ Yes" : "❌ No"}</p>

        {/* Availability */}
        <h3 className="mt-4 text-lg font-bold">Availability</h3>
        <p><strong>Weekdays:</strong> {user.availability?.weekdays ? "✅ Available" : "❌ Not Available"}</p>
        <p><strong>Weekends:</strong> {user.availability?.weekends ? "✅ Available" : "❌ Not Available"}</p>

        {/* If the user is an event organiser, show organiser-specific details */}
        {user.role === "Event Organiser" ? (
          <>
            <h3 className="mt-4 text-lg font-bold">Event Organiser Details</h3>
            <p><strong>Ratings:</strong> {user.rating || "No ratings available"}</p>
            <p><strong>Feedback:</strong> {user.feedback || "No feedback available"}</p>

            {/* Organized Events */}
            <h3 className="mt-4 text-lg font-bold">Organized Events</h3>
            {eventDetails.length > 0 ? (
              <ul className="list-disc ml-6">
                {eventDetails.map((event) => (
                  <li key={event._id}>
                    <p><strong>{event.title}</strong></p>
                    <p>📅 <strong>Date:</strong> {new Date(event.eventStartDate).toLocaleDateString()}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p>Loading event details...</p>
            )}

            {/* Actions for Event Organiser */}
            <div className="mt-4 flex gap-4">
              <button
                className="bg-yellow-500 text-white px-4 py-2 rounded"
                onClick={() => setShowWarnForm(true)}
              >
                Warn
              </button>
              <button
                className="bg-red-500 text-white px-4 py-2 rounded"
                onClick={handleRemoveOrganizer}
              >
                Remove
              </button>
            </div>

            {/* Warn Form */}
            {showWarnForm && (
              <div className="mt-4 border p-4 rounded bg-gray-100">
                <h3 className="text-lg font-bold mb-2">Send Warning</h3>
                <textarea
                  className="w-full p-2 border rounded"
                  rows="3"
                  placeholder="Enter warning message..."
                  value={warningMessage}
                  onChange={(e) => setWarningMessage(e.target.value)}
                />
                <div className="mt-2 flex justify-between">
                  <button
                    className="bg-blue-500 text-white px-4 py-2 rounded"
                    onClick={handleWarnSubmit}
                  >
                    Send Warning
                  </button>
                  <button
                    className="bg-gray-500 text-white px-4 py-2 rounded"
                    onClick={() => setShowWarnForm(false)}
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          // If user is just "User," allow promoting them to "Event Organiser"
          user.role === "User" && (
            <div className="mt-4">
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded"
                onClick={handlePromoteToOrganiser}
              >
                Promote to Event Organiser
              </button>
            </div>
          )
        )}

        {/* Close Button (bottom) */}
        <button
          className="mt-4 bg-gray-500 text-white px-4 py-2 rounded w-full"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default UserDetailsModal;
