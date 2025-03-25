import React from "react";

const UserCard = ({ user, onShowDetails }) => (
  <div className="flex items-center bg-gray-100 p-4 rounded shadow-md">
    {/* Avatar */}
    <img
      src={user.avatar || "https://via.placeholder.com/50"}
      alt={user.name}
      className="w-12 h-12 rounded-full object-cover"
    />

    {/* User Info */}
    <div className="ml-4 flex-1">
      <h3 className="text-lg font-semibold">{user.name}</h3>
      <p className="text-sm text-gray-600">{user.role}</p>
    </div>

    {/* Show Details Button */}
    <button
      className="bg-blue-500 text-white px-4 py-2 rounded"
      onClick={() => onShowDetails(user)}
    >
      Show Details
    </button>
  </div>
);

export default UserCard;
