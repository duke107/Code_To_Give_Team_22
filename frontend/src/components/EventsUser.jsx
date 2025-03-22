import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

function EventsUser() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [showAll, setShowAll] = useState(false); // Flag to determine which API to call
  const { user } = useSelector(state => state.auth);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        // If showAll is true, fetch all events. Otherwise, fetch by user's location.
        const url = showAll
          ? `http://localhost:3000/api/v1/events/getEvents`
          : `http://localhost:3000/api/v1/events/getEvents?location=${user.location}`;

        const res = await fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });

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

    if (user && user.location) {
      fetchEvents();
    }
  }, [user, showAll]);

  const handleViewEvent = (slug) => {
    navigate(`/event/${slug}`);
  };

  const handleViewAllEvents = () => {
    // Set flag to true so that useEffect fetches all events.
    setShowAll(true);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {events.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <div key={event._id} className="bg-gray-100 p-6 rounded-lg shadow-md">
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
      ) : (
        // If no events are found for the user's location and we are not showing all events
        !showAll && (
          <div className="text-center">
            <p className="text-lg mb-4">
              No events occurring near your location for now. Want to check out our events at other locations?
            </p>
            <button
              onClick={handleViewAllEvents}
              className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded shadow transition-colors"
            >
              View All Events
            </button>
          </div>
        )
      )}
    </div>
  );
}

export default EventsUser;
