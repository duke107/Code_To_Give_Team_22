import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import LocationPicker from './LocationPicker';

function EventsUser() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [showAll, setShowAll] = useState(false); // Flag to determine which API to call for default fetching
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchMode, setSearchMode] = useState(false); // Determines if search results are active
  const [searchParams, setSearchParams] = useState({
    title: '',
    category: '',
    location: '',
    startDate: '',
    endDate: '',
    status: '',
    dateRange: '',
    sortBy: '',
  });

  const eventCategories = [
    "Education & Skill Development",
    "Sports & Cultural Events",
    "Health & Well-being",
    "Women Empowerment",
    "Environmental Sustainability",
    "Social Inclusion & Awareness"
  ];

  const { user } = useSelector(state => state.auth);

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split("T")[0];

  // 1. As soon as we have user info, default the search location to user.location
  useEffect(() => {
    if (user?.location) {
      setSearchParams(prev => ({ ...prev, location: user.location }));
    }
  }, [user]);

  // 2. Default fetch: local events or all events based on showAll flag,
  // only if we're not in search mode
  useEffect(() => {
    const fetchEvents = async () => {
      try {
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

    if (user && user.location && !searchMode) {
      fetchEvents();
    }
  }, [user, showAll, searchMode]);

  // 3. Handle searching events
  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    try {
      let queryParams = [];

      if (searchParams.title) {
        queryParams.push(`title=${encodeURIComponent(searchParams.title)}`);
      }
      if (searchParams.category) {
        queryParams.push(`category=${encodeURIComponent(searchParams.category)}`);
      }
      if (searchParams.location) {
        queryParams.push(`location=${encodeURIComponent(searchParams.location)}`);
      }
      if (searchParams.startDate) {
        queryParams.push(`startDate=${encodeURIComponent(searchParams.startDate)}`);
      }
      if (searchParams.endDate) {
        queryParams.push(`endDate=${encodeURIComponent(searchParams.endDate)}`);
      }
      if (searchParams.status) {
        queryParams.push(`status=${encodeURIComponent(searchParams.status)}`);
      }
      if (searchParams.dateRange) {
        queryParams.push(`dateRange=${encodeURIComponent(searchParams.dateRange)}`);
      }
      if (searchParams.sortBy) {
        queryParams.push(`sortBy=${encodeURIComponent(searchParams.sortBy)}`);
      }

      const queryString = queryParams.length ? `?${queryParams.join('&')}` : '';
      const url = `http://localhost:3000/api/v1/events/search${queryString}`;

      const res = await fetch(url, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (res.ok) {
        const data = await res.json();
        setEvents(data);
        setSearchMode(true);
      } else {
        console.error("Error:", res.status, res.statusText);
      }
    } catch (error) {
      console.error("Error fetching search results:", error);
    } finally {
      setShowSearchModal(false);
    }
  };

  const handleViewEvent = (slug) => {
    navigate(`/event/${slug}`);
  };

  // Clear search results and return to default view
  const handleClearSearch = () => {
    setSearchMode(false);
    setSearchParams({
      title: '',
      category: '',
      location: user?.location || '', // reset to user's location
      startDate: '',
      endDate: '',
      status: '',
      dateRange: '',
      sortBy: '',
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header with Toggle and Search Buttons */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Events {searchMode ? " - Search Results" : (showAll ? " - All Locations" : " - Near You")}
        </h1>
        <div className="flex gap-4">
          <button
            onClick={() => setShowSearchModal(true)}
            className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg shadow-md transition-colors"
          >
            Search Events
          </button>
          <button
            onClick={() => {
              setShowAll(prev => !prev);
              // Clear search mode if toggling default view
              setSearchMode(false);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg shadow-md transition-colors"
          >
            {showAll ? "Show Local Events" : "Show All Events"}
          </button>
          {searchMode && (
            <button
              onClick={handleClearSearch}
              className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg shadow-md transition-colors"
            >
              Clear Search
            </button>
          )}
        </div>
      </div>

      {/* Search Modal */}
      {showSearchModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h2 className="text-2xl font-bold mb-4">Search Events</h2>
            <form onSubmit={handleSearchSubmit} className="space-y-4">
              
              {/* Title Filter */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                  Title
                </label>
                <input
                  type="text"
                  id="title"
                  value={searchParams.title}
                  onChange={(e) => setSearchParams({ ...searchParams, title: e.target.value })}
                  className="mt-1 block w-full border-gray-300 bg-gray-200 rounded-md shadow-sm"
                />
              </div>

              {/* Category Filter */}
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                  Event Category
                </label>
                <select
                  id="category"
                  value={searchParams.category}
                  onChange={(e) => setSearchParams({...searchParams, category: e.target.value})}
                  className="w-full p-3 border rounded text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Categories</option>
                  {eventCategories.map((category, index) => (
                    <option key={index} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              {/* Location Filter */}
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                  Location
                </label>
                <LocationPicker
                  eventLocation={searchParams.location}
                  setEventLocation={(value) => setSearchParams({ ...searchParams, location: value })}
                />
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <select
                  value={searchParams.status}
                  onChange={(e) => setSearchParams({ ...searchParams, status: e.target.value })}
                  className="mt-1 block w-full border-gray-300 bg-gray-200  rounded-md shadow-sm"
                >
                  <option value="">All</option>
                  <option value="upcoming">Upcoming</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              {/* Quick Date Range Filters */}
              <div>
                <label htmlFor="dateRange" className="block text-sm font-medium text-gray-700">
                  Date Range
                </label>
                <select
                  id="dateRange"
                  value={searchParams.dateRange}
                  onChange={(e) => setSearchParams({ ...searchParams, dateRange: e.target.value })}
                  className="mt-1 block w-full border-gray-300 bg-gray-200 rounded-md shadow-sm"
                >
                  <option value="">All Dates</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="custom">Custom Range</option>
                </select>
              </div>

              {/* Show Start/End Date inputs only if "Custom Range" is selected */}
              {searchParams.dateRange === "custom" && (
                <>
                  <div>
                    <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
                      Start Date
                    </label>
                    <input
                      type="date"
                      id="startDate"
                      value={searchParams.startDate}
                      onChange={(e) => setSearchParams({ ...searchParams, startDate: e.target.value })}
                      min={today}
                      className="mt-1 block w-full border-gray-300 bg-gray-200 rounded-md shadow-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
                      End Date
                    </label>
                    <input
                      type="date"
                      id="endDate"
                      value={searchParams.endDate}
                      onChange={(e) => setSearchParams({ ...searchParams, endDate: e.target.value })}
                      min={searchParams.startDate || today}
                      className="mt-1 block w-full border-gray-300 bg-gray-200 rounded-md shadow-sm"
                    />
                  </div>
                </>
              )}

              {/* Sorting */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Sort By</label>
                <select
                  value={searchParams.sortBy}
                  onChange={(e) => setSearchParams({ ...searchParams, sortBy: e.target.value })}
                  className="mt-1 block w-full border-gray-300 bg-gray-200 rounded-md shadow-sm"
                >
                  <option value="">Default</option>
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                </select>
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setShowSearchModal(false)}
                  className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg"
                >
                  Search
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Events Grid */}
      {events.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {events.map((event) => (
            <div
              key={event._id}
              className="bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl border border-gray-100 flex flex-col"
            >
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
              <div className="p-6 flex-grow">
                <h2 className="text-xl font-bold text-gray-900 mb-3">
                  {event.title}
                </h2>
                <div className="text-gray-600 mb-4 line-clamp-3">
                  <div
                    dangerouslySetInnerHTML={{ __html: event.content }}
                  />
                </div>
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
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-16 w-16 mx-auto text-gray-400"
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
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            {searchMode ? "No events found for your search." : "No events found"}
          </h3>
          <p className="mt-2 text-gray-500">
            {searchMode
              ? "Try adjusting your search criteria."
              : showAll
              ? "No events available at the moment."
              : "Want to explore events in other locations?"}
          </p>
          {!searchMode && !showAll && (
            <button
              onClick={() => setShowAll(true)}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Show All Events
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default EventsUser;
