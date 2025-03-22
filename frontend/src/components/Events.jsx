import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

function Events() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);

  const {
    loading,
    error,
    message,
    user,
    isAuthenticated
  } = useSelector(state => state.auth);
  console.log(user)
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch(
          `http://localhost:3000/api/v1/events/getEvents?createdBy=${user._id}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
          }
        );

        if (res.ok) {
          const data = await res.json();
          setEvents(data);
        } else {
          console.error("Error:", res.status, res.statusText);
        }
      } catch (error) {
        console.error("Error fetching events:", error);
      }
    };
    

    fetchEvents();
  }, [user]);

  const handleAddEvent = () => {
    navigate('/create');
  };

  const handleViewEvent = (slug) => {
    navigate(`/event/${slug}`);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-end mb-6">
        <button
          onClick={handleAddEvent}
          className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded shadow transition-colors"
        >
          Add Event
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event) => (
          <div
            key={event._id}
            className="bg-gray-100 p-6 rounded-lg shadow-md"
          >
            <h2 className="text-xl font-semibold mb-2">{event.title}</h2>
            
            {/* Render the HTML content as formatted text */}
            <div
              className="text-gray-600 mb-4"
              dangerouslySetInnerHTML={{ __html: event.content }}
            />
            
            {event.image && (
              <img
                src={event.image}
                alt={event.title}
                className="w-full h-48 object-cover mb-4 rounded"
              />
            )}

            <button
              onClick={() => handleViewEvent(event.slug)}
              className="bg-gray-800 hover:bg-gray-900 text-white py-2 px-4 rounded transition-colors"
            >
              View Event Details
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Events;
