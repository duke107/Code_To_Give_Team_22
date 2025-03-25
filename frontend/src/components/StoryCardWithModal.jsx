import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

const StoryCardWithModal = ({ event }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [createdByUser, setCreatedByUser] = useState(null);
  const [volunteeringUsers, setVolunteeringUsers] = useState([]);
  const [registeredUsers, setRegisteredUsers] = useState([]);

  useEffect(() => {
    if (isModalOpen) {
      fetchUserDetails(event.createdBy, setCreatedByUser);
      fetchUserList(event.volunteeringPositions, setVolunteeringUsers);
      fetchUserList(event.registeredVolunteers, setRegisteredUsers);
    }
  }, [isModalOpen, event]);

  const fetchUserDetails = async (userId, setUserState) => {
    if (!userId) return;
    try {
      const response = await axios.get(`http://localhost:3000/api/v1/admin/user/${userId}`);
      setUserState(response.data.name || "Unknown User");
    } catch (error) {
      console.error("Error fetching user:", error);
      setUserState("Unknown User");
    }
  };

  const fetchUserList = async (userIds, setUsersState) => {
    if (!userIds || userIds.length === 0) {
      setUsersState([]);
      return;
    }
    try {
      const response = await axios.get("http://localhost:3000/api/v1/admin/users", { userIds });
      setUsersState(response.data || []);
    } catch (error) {
      console.error("Error fetching users:", error);
      setUsersState([]);
    }
  };

  return (
    <>
      
      <div className="bg-white rounded-lg shadow-md p-4">
        <img
          src={event.image || "https://via.placeholder.com/300"}
          alt={event.title}
          className="w-full h-48 object-cover rounded"
        />
        <h2 className="text-xl font-semibold mt-2">{event.title}</h2>
        <p className="text-gray-600">
          {`${event.eventLocation} | ${new Date(event.eventStartDate).toLocaleDateString()} - ${new Date(event.eventEndDate).toLocaleDateString()}`}
        </p>
        <button
          onClick={() => setIsModalOpen(true)}
          className="mt-3 bg-blue-600 text-white px-4 py-2 rounded transition hover:bg-blue-700"
        >
          Read More
        </button>
      </div> 

      <AnimatePresence>
        {isModalOpen && (
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
              <img
                src={event.image || "https://via.placeholder.com/300"}
                alt={event.title}
                className="w-full h-48 object-cover rounded"
              />
              <h2 className="text-2xl font-semibold mt-4">{event.title}</h2>
              <p className="text-gray-600 mt-2"><strong>Location:</strong> {event.eventLocation}</p>
              <p className="text-gray-600"><strong>Start Date:</strong> {new Date(event.eventStartDate).toLocaleDateString()}</p>
              <p className="text-gray-600"><strong>End Date:</strong> {new Date(event.eventEndDate).toLocaleDateString()}</p>
              <p className="text-gray-600 mt-2"><strong>Details:</strong> {typeof event.description === "string" ? event.description : JSON.stringify(event.description)}</p>
              <p className="text-gray-600 mt-2"><strong>Created By:</strong> {createdByUser || "Unknown"}</p>
              <p className="text-gray-600 mt-2"><strong>Volunteering Positions:</strong> {volunteeringUsers.length > 0 ? volunteeringUsers.map((user) => user.name).join(", ") : "N/A"}</p>
              <p className="text-gray-600 mt-2"><strong>Registered Volunteers:</strong> {registeredUsers.length > 0 ? registeredUsers.map((user) => user.name).join(", ") : "None"}</p>
              <div className="flex justify-end mt-4">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="bg-red-500 text-white px-4 py-2 rounded transition hover:bg-red-600"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default StoryCardWithModal;
