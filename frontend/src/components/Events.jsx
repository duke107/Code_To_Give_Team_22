import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";


function Events() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [approvedEvents, setApprovedEvents] = useState([]);
  const [notApprovedEvents, setNotApprovedEvents] = useState([]);
  const [showNotApproved, setShowNotApproved] = useState(false);

  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    const fetchEvents = async () => {
      if (!user?._id) return;

      setIsLoading(true);
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

          setApprovedEvents(data.filter((event) => event.isApproved));
          setNotApprovedEvents(data.filter((event) => !event.isApproved));
        } else {
          console.error("Error:", res.status, res.statusText);
        }
      } catch (error) {
        console.error("Error fetching events:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, [user]);

  const handleAddEvent = () => {
    navigate("/create");
  };

  const handleViewEvent = (slug) => {
    navigate(`/event/${slug}`);
  };

  const truncateHTML = (html, maxLength = 100) => {
    const stripHTML = html?.replace(/<[^>]+>/g, "");
    if (stripHTML?.length <= maxLength) return html;
    return stripHTML?.substring(0, maxLength) + "...";
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Events</h1>
        <button
          onClick={handleAddEvent}
          className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-lg shadow transition-colors duration-200 flex items-center gap-2"
        >
          Add New Event
        </button>
      </div>
  
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          {events.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="mt-4 text-lg font-medium text-gray-900">No events found</h3>
              <p className="mt-2 text-gray-500">Get started by creating your first event.</p>
              <button
                onClick={handleAddEvent}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Create Event
              </button>
            </div>
          ) : (
            <>
              {[{ title: "Approved Events", events: approvedEvents, textColor: "text-green-700" },
              { title: "Not Approved Events", events: notApprovedEvents, textColor: "text-red-700" }].map((section) => (
                <div key={section.title}>
                  <h2 className={`text-2xl font-semibold ${section.textColor} mb-4`}>{section.title}</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
                  {section.events.map((event) => (
  <motion.div
    key={event._id}
    className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 hover:shadow-2xl transition-all duration-300 group flex flex-col"
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
  >
    <div className="bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl border border-gray-100 flex flex-col">
    {event.image ? (
                <div className="h-48 overflow-hidden">
                  <img
                    src={event.image}
                    alt={event.title}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                  />
                </div>
              ) : (
                <div className="h-32 bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-12 w-12"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
              )}
    </div>

    <div className="p-6 flex-grow text-center">
      <h2 className="text-2xl font-semibold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors duration-300">
        {event.title}
      </h2>
      <div
        className="text-gray-600 text-base leading-relaxed mb-4 line-clamp-3"
        dangerouslySetInnerHTML={{ __html: event.content }}
      />
    </div>

    <div className="px-6 pb-6 pt-2">
      <button
        onClick={() => handleViewEvent(event.slug)}
       className="w-full bg-gray-800 hover:bg-gray-900 text-white py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
          <path
            fillRule="evenodd"
            d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
            clipRule="evenodd"
          />
        </svg>
        View Details
      </button>
    </div>
  </motion.div>
))}

                  </div>
                </div>
              ))}
            </div>
  
            {/* Show/Hide Not Approved Events Button */}
            <div className="text-center mt-6">
              <button
                onClick={() => setShowNotApproved(!showNotApproved)}
                className="text-blue-600 font-semibold hover:underline flex items-center justify-center gap-2"
              >
                {showNotApproved ? "Hide Not Approved Events" : "Show Not Approved Events"}
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={showNotApproved ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
                </svg>
              </button>
            </div>
          </div>
  
          {/* Not Approved Events (Collapsible Section) */}
          {showNotApproved && (
            <div className="mt-8">
              {/* <h2 className="text-2xl font-semibold text-red-700 mb-4">Not Approved Events</h2> */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {notApprovedEvents.map((event) => (
                  <div
                    key={event._id}
                    className="bg-gray-200 rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl border border-gray-100 flex flex-col"
                  >
                    <div className="h-48 overflow-hidden">
                      {event.image ? (
                        <img
                          src={event.image}
                          alt={event.title}
                          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                        />
                      ) : (
                        <div className="h-32 bg-red-500 flex items-center justify-center text-white">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="p-6">
                      <h2 className="text-xl font-bold text-gray-900 mb-3">{event.title}</h2>
                      <p className="text-gray-600">{truncateHTML(event.content)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
  
}

export default Events;
