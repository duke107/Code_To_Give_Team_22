import React, { useState } from 'react';

function ChangeDetails() {
  // Local state for user details
  const [location, setLocation] = useState('');
  const [weekdays, setWeekdays] = useState(false);
  const [weekends, setWeekends] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);

  // State to control password modal visibility
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  const handleApplyChanges = () => {
    // TODO: Implement your update logic here (location, availability, avatar, etc.)
    console.log('Location:', location);
    console.log('Availability - Weekdays:', weekdays, 'Weekends:', weekends);
    console.log('Avatar File:', avatarFile);
    alert('Changes applied! (Implement actual update logic here)');
  };

  const handleChangePassword = () => {
    // TODO: Implement your change password logic here
    console.log('Current:', currentPassword);
    console.log('New:', newPassword);
    console.log('Confirm:', confirmNewPassword);

    // Example check
    if (newPassword !== confirmNewPassword) {
      alert('New password and confirm password do not match!');
      return;
    }

    alert('Password changed! (Implement actual password update logic here)');
    // Close the modal after successful update
    setShowPasswordModal(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center">
      <h2 className="text-2xl font-semibold mb-4">Change Details</h2>

      {/* User Avatar */}
      <div className="relative mb-6">
        {/* Circle placeholder if no avatarFile selected */}
        <div className="h-32 w-32 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden">
          {avatarFile ? (
            <img
              src={URL.createObjectURL(avatarFile)}
              alt="avatar"
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-gray-500">No Avatar</span>
          )}
        </div>
      </div>

      {/* Upload/Change Avatar Button */}
      <label className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded cursor-pointer mb-6">
        Upload New Avatar
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              setAvatarFile(e.target.files[0]);
            }
          }}
        />
      </label>

      {/* Location Field */}
      <div className="w-full max-w-md mb-4">
        <label className="block mb-1 font-medium text-gray-700">Location</label>
        <input
          type="text"
          placeholder="Enter your location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Availability */}
      <div className="w-full max-w-md mb-6">
        <label className="block mb-1 font-medium text-gray-700">Availability</label>
        <div className="flex items-center gap-4 mt-2">
          <label className="flex items-center gap-1">
            <input
              type="checkbox"
              checked={weekdays}
              onChange={() => setWeekdays(!weekdays)}
              className="h-4 w-4"
            />
            <span>Weekdays</span>
          </label>
          <label className="flex items-center gap-1">
            <input
              type="checkbox"
              checked={weekends}
              onChange={() => setWeekends(!weekends)}
              className="h-4 w-4"
            />
            <span>Weekends</span>
          </label>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex flex-col items-center gap-4 w-full max-w-md">
        <button
          onClick={handleApplyChanges}
          className="bg-green-600 hover:bg-green-700 text-white py-2 px-6 rounded w-full"
        >
          Apply Changes
        </button>
        <button
          onClick={() => setShowPasswordModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded w-full"
        >
          Change Password
        </button>
      </div>

      {/* Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          {/* Modal Content */}
          <div className="bg-white rounded-lg p-6 w-full max-w-sm">
            <h3 className="text-xl font-semibold mb-4">Change Password</h3>
            <div className="mb-3">
              <label className="block mb-1 font-medium text-gray-700">
                Current Password
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter current password"
              />
            </div>
            <div className="mb-3">
              <label className="block mb-1 font-medium text-gray-700">
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter new password"
              />
            </div>
            <div className="mb-6">
              <label className="block mb-1 font-medium text-gray-700">
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Confirm new password"
              />
            </div>

            {/* Modal Buttons */}
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowPasswordModal(false)}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-4 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleChangePassword}
                className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
              >
                Update Password
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ChangeDetails;
