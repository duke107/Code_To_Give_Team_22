import React from 'react';
import { FaCheck, FaTrashAlt, FaBell, FaRegBell } from 'react-icons/fa';
import { useNavigate } from "react-router-dom"

const Notification = ({ notifications, fetchNotifications }) => {
  const navigate = useNavigate()
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

  const markAllAsRead = async () => {
    try {
      await Promise.all(
        notifications.filter((notif) => !notif.isRead).map((notif) => markAsRead(notif._id))
      );
      fetchNotifications();
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  const deleteAllNotifications = async () => {
    try {
      await Promise.all(notifications.map((notif) => deleteNotification(notif._id)));
      fetchNotifications();
    } catch (error) {
      console.error("Error deleting all notifications:", error);
    }
  };

  const handleViewEvent = (slug) => {
    console.log(`/event/${slug}`);
    navigate(`/event/${slug}`);
  };

  // Calculate how long ago the notification was created
  const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    
    return Math.floor(seconds) + " seconds ago";
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-xl shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <FaBell className="text-blue-600 mr-3" size={24} />
          <h1 className="text-2xl font-bold text-gray-800">Notifications</h1>
        </div>
        <div className="text-sm text-gray-500">
          {notifications.length} {notifications.length === 1 ? "notification" : "notifications"}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3 mb-4">
        <button
          onClick={markAllAsRead}
          className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-all"
        >
          Mark All as Read
        </button>
        <button
          onClick={deleteAllNotifications}
          className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-all"
        >
          Delete All
        </button>
      </div>
  
      {notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 bg-gray-50 rounded-lg">
          <FaRegBell className="text-gray-400 mb-3" size={40} />
          <p className="text-lg font-medium text-gray-500">No notifications yet</p>
          <p className="text-sm text-gray-400 mt-1">You're all caught up!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notif) => (
            <div
              key={notif._id}
              onClick={() => handleViewEvent(notif.eventSlug)}
              className={`p-4 rounded-lg border cursor-pointer flex justify-between items-center transition-all duration-300
                ${
                  notif.isRead
                    ? "bg-white border-gray-200 hover:bg-gray-100"
                    : "bg-blue-50 border-blue-200 hover:bg-blue-100"
                }`}
            >
              {/* Left Side - Bell Icon & Message */}
              <div className="flex items-start space-x-3 w-full">
                <div className={`mt-1 flex-shrink-0 ${notif.isRead ? "text-gray-400" : "text-blue-500"}`}>
                  <FaBell size={16} />
                </div>
                <div className="w-full">
                <p className={`text-gray-800 ${!notif.isRead ? "font-medium" : ""} overflow-hidden text-ellipsis`}>
                  {notif.message.length > 200 ? notif.message.slice(0, 200) + "..." : notif.message}
                </p>
                  <div className="flex items-center mt-1 text-xs">
                    <span className="text-gray-500">{timeAgo(notif.createdAt)}</span>
                    <span className="mx-2 text-gray-300">•</span>
                    <span className="text-gray-500 hover:text-gray-700 cursor-help" title={new Date(notif.createdAt).toLocaleString()}>
                      Full timestamp
                    </span>
                  </div>
                </div>
              </div>
  
              {/* Right Side - Fixed Buttons */}
              <div className="flex space-x-2 flex-shrink-0">
                {!notif.isRead && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      markAsRead(notif._id);
                    }}
                    title="Mark as Read"
                    className="p-2 rounded-full text-blue-600 hover:bg-blue-200 transition-colors"
                  >
                    <FaCheck size={16} />
                  </button>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteNotification(notif._id);
                  }}
                  title="Delete Notification"
                  className="p-2 rounded-full text-red-500 hover:bg-red-100 transition-colors"
                >
                  <FaTrashAlt size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
  
  
};

export default Notification;