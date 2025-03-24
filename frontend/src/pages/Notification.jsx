import React from 'react';
import { FaCheck, FaTrashAlt } from 'react-icons/fa';

const Notification = ({ notifications, fetchNotifications }) => {
  const markAsRead = async (notificationId) => {
    try {
      await fetch(`http://localhost:3000/api/v1/notification/${notificationId}/read`, {
        method: "PATCH",
        credentials: "include",
      });
      fetchNotifications();
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await fetch(`http://localhost:3000/api/v1/notification/${notificationId}`, {
        method: "DELETE",
        credentials: "include",
      });
      fetchNotifications();
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Notifications</h1>
      {notifications.map((notif) => (
        <div key={notif._id} className="border-b py-2 flex items-center justify-between">
          <div>
            <p className="text-gray-800">{notif.message}</p>
            <small className="text-gray-500">{new Date(notif.createdAt).toLocaleString()}</small>
          </div>
          <div className="flex space-x-2">
            {!notif.isRead && (
              <button
                onClick={() => markAsRead(notif._id)}
                title="Mark as Read"
                className="text-green-600 hover:text-green-800"
              >
                <FaCheck size={18} />
              </button>
            )}
            <button
              onClick={() => deleteNotification(notif._id)}
              title="Delete Notification"
              className="text-red-600 hover:text-red-800"
            >
              <FaTrashAlt size={18} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Notification;
