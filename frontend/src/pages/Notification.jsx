import React, { useEffect, useState } from "react";
import { FaCheck, FaTrash } from "react-icons/fa";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);

  const fetchNotifications = async () => {
    try {
      const res = await fetch("http://localhost:3000/api/v1/notification", {
        credentials: "include",
      });
      const data = await res.json();
      setNotifications(data.data);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);
  const unreadCount = notifications.filter((noti) => !noti.isRead).length;

  const markAsRead = async (notificationId) => {
    try {
      const res = await fetch(`http://localhost:3000/api/v1/notification/${notificationId}/read`, {
        method: "PATCH",
        credentials: "include",
      });
      if (res.ok) {
        setNotifications((prev) =>
          prev.map((notif) =>
            notif._id === notificationId ? { ...notif, isRead: true } : notif
          )
        );
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      const res = await fetch(`http://localhost:3000/api/v1/notification/${notificationId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        setNotifications((prev) => prev.filter((notif) => notif._id !== notificationId));
      }
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
              <FaTrash size={18} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Notifications;
