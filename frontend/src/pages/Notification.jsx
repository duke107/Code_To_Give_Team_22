import React from 'react';
import { FaCheck, FaTrashAlt, FaBell, FaRegBell } from 'react-icons/fa';

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
          {notifications.length} {notifications.length === 1 ? 'notification' : 'notifications'}
        </div>
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
              className={`p-4 rounded-lg border ${
                notif.isRead ? 'bg-white border-gray-200' : 'bg-blue-50 border-blue-100'
              } flex items-center justify-between transition-all duration-300 hover:shadow-md`}
            >
              <div className="flex items-start space-x-3">
                <div className={`mt-1 flex-shrink-0 ${notif.isRead ? 'text-gray-400' : 'text-blue-500'}`}>
                  <FaBell size={16} />
                </div>
                <div>
                  <p className={`text-gray-800 ${!notif.isRead ? 'font-medium' : ''}`}>
                    {notif.message}
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
              <div className="flex space-x-2">
                {!notif.isRead && (
                  <button
                    onClick={() => markAsRead(notif._id)}
                    title="Mark as Read"
                    className="p-2 rounded-full text-blue-600 hover:bg-blue-100 transition-colors"
                  >
                    <FaCheck size={16} />
                  </button>
                )}
                <button
                  onClick={() => deleteNotification(notif._id)}
                  title="Delete Notification"
                  className="p-2 rounded-full text-red-500 hover:bg-red-50 transition-colors"
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