import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';

function Event() {
  const { slug } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [registering, setRegistering] = useState(false);
  const [message, setMessage] = useState(null);
  const [showModal, setShowModal] = useState(false); // Modal visibility state
  const [selectedPositionId, setSelectedPositionId] = useState(null); // Selected position id
  const [isRegistered, setIsRegistered] = useState(false); // Track registration status
  const state = useSelector((state) => state.auth);

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        const res = await fetch(`http://localhost:3000/api/v1/events/${slug}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include'
        });
        
        if (!res.ok) {
          throw new Error(`Error ${res.status}: ${res.statusText}`);
        }

        const data = await res.json();
        setEvent(data);

        // Optionally, check if the user is already registered by scanning through registered volunteers
        if (data.registeredVolunteers && state.user) {
          const registered = data.registeredVolunteers.some(
            (volunteer) => volunteer._id.toString() === state.user._id.toString()
          );
          setIsRegistered(registered);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEventDetails();
  }, [slug, state.user]);

  // Opens the modal
  const openModal = () => {
    setMessage(null);
    setSelectedPositionId(null);
    setShowModal(true);
  };

  // Closes the modal
  const closeModal = () => {
    setShowModal(false);
  };

  // Handles the confirm button click in the modal
  const handleConfirm = async () => {
    if (!event || !selectedPositionId) {
      setMessage({ type: 'error', text: 'Please select a volunteering position.' });
      return;
    }
    setRegistering(true);
    setMessage(null);

    try {
      const res = await fetch(`http://localhost:3000/api/v1/events/${slug}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ id: state.user._id, positionId: selectedPositionId }),
      });

      const data = await res.json();
      if (res.status === 409) {
        setMessage({ type: 'info', text: data.message || 'Already registered' });
      } else if (!res.ok) {
        throw new Error(data.message || `Error ${res.status}`);
      } else {
        setMessage({ type: 'success', text: 'Successfully registered for the event!' });
        setIsRegistered(true); // Mark user as registered
        closeModal();
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setRegistering(false);
    }
  };

  if (loading) return <p className="text-center text-gray-500">Loading event details...</p>;
  if (error) return <p className="text-center text-red-500">Error: {error}</p>;

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-6 relative">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">{event.title}</h1>

      {event.image && (
        <img src={event.image} alt={event.title} className="w-full h-60 object-cover mb-4 rounded-lg" />
      )}

      <div className="text-gray-700 mb-4" dangerouslySetInnerHTML={{ __html: event.content }} />

      <div className="bg-gray-100 p-4 rounded-lg mb-4">
        <p className="text-lg font-semibold">📍 Location: {event.eventLocation}</p>
        <p className="text-gray-600">📅 Start: {new Date(event.eventStartDate).toLocaleDateString()}</p>
        <p className="text-gray-600">📅 End: {new Date(event.eventEndDate).toLocaleDateString()}</p>
      </div>

      {event.volunteeringPositions?.length > 0 && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">🙌 Volunteering Positions</h2>
          <ul className="list-disc list-inside text-gray-700">
            {event.volunteeringPositions.map((position) => (
              <li key={position._id}>
                <span className="font-semibold">{position.title}</span> - {position.slots} slots available
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className="text-gray-500 mt-4 text-sm">Created by: {event.createdBy?.name || "Unknown"}</p>

      {/* If the user is already registered, display a success message; otherwise show the register button */}
      {isRegistered ? (
        <p className="text-center text-green-600 mt-6 font-bold">
          You have successfully registered for this event as a volunteer.
        </p>
      ) : (
        <button
          className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition disabled:bg-gray-400"
          onClick={openModal}
          disabled={registering}
        >
          {registering ? "Processing..." : "Register for Event"}
        </button>
      )}

      {/* Registration Message */}
      {message && (
        <p className={`mt-3 text-center ${
          message.type === 'success' ? 'text-green-600' :
          message.type === 'info' ? 'text-yellow-600' : 'text-red-600'
        }`}>
          {message.text}
        </p>
      )}

      {/* Modal for selecting volunteering position */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-11/12 max-w-md">
            <h2 className="text-xl font-bold mb-4">Choose a Volunteering Position</h2>
            <ul className="mb-4">
              {event.volunteeringPositions.map((position) => (
                <li key={position._id} className="mb-2">
                  <button
                    onClick={() => setSelectedPositionId(position._id)}
                    className={`w-full text-left py-2 px-4 rounded border 
                      ${selectedPositionId === position._id ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
                    disabled={position.slots <= 0 || registering}
                  >
                    {position.title} {position.slots <= 0 && '(No slots available)'}
                  </button>
                </li>
              ))}
            </ul>
            <div className="flex gap-4">
              <button
                onClick={handleConfirm}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg"
                disabled={registering}
              >
                {registering ? "Confirming..." : "Confirm"}
              </button>
              <button
                onClick={closeModal}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg"
                disabled={registering}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Event;
