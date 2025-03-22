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
        console.log(data);
        setEvent(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEventDetails();
  }, [slug]);

  const handleRegister = async () => {
    if (!event) return;
    setRegistering(true);
    setMessage(null);
    console.log(state.user._id);
    try {
      const res = await fetch(`http://localhost:3000/api/v1/events/${slug}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ id: state.user._id }), // Sending ID in the body
      });

      const data = await res.json();
      if (res.status === 409) {
        setMessage({ type: 'info', text: 'Already registered' });
        return;        
      }
      if (!res.ok) {
        throw new Error(data.message || `Error ${res.status}`);
      }
      else setMessage({ type: 'success', text: 'Successfully registered for the event!' });
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setRegistering(false);
    }
  };

  if (loading) return <p className="text-center text-gray-500">Loading event details...</p>;
  if (error) return <p className="text-center text-red-500">Error: {error}</p>;

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-6">
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
            {event.volunteeringPositions.map((position, index) => (
              <li key={index}>
                <span className="font-semibold">{position.title}</span> - {position.slots}
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className="text-gray-500 mt-4 text-sm">Created by: {event.createdBy?.name || "Unknown"}</p>

      {/* Register Button */}
      <button
        className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition disabled:bg-gray-400"
        onClick={handleRegister}
        disabled={registering}
      >
        {registering ? "Registering..." : "Register for Event"}
      </button>

      {/* Show Registration Message */}
      {message && (
        <p className={`mt-3 text-center ${
          message.type === 'success' 
            ? 'text-green-600' 
            : (message.type === 'info' 
            ? 'text-yellow-600' 
            : 'text-red-600')
        }`}>
          {message.text}
        </p>
      )}
    </div>
  );
}

export default Event;
