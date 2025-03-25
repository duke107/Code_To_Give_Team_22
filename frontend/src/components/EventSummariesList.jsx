import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function EventSummariesList() {
  const [summaries, setSummaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSummaries = async () => {
      try {
        // Adjust your backend endpoint as needed
        const res = await fetch("http://localhost:3000/api/v1/admin/eventSummaries", {
            method: "GET",
          credentials: "include",
        });
        if (!res.ok) {
          throw new Error(`Error ${res.status}: ${res.statusText}`);
        }
        const data = await res.json();
        setSummaries(data); // assume data is an array of event summaries
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchSummaries();
  }, []);

  if (loading) return <p className="p-4 text-center text-gray-500">Loading...</p>;
  if (error) return <p className="p-4 text-center text-red-500">Error: {error}</p>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">All Event Summaries</h2>
      {summaries.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {summaries.map((summary) => (
            <div key={summary._id} className="border rounded shadow p-4 bg-white">
              <h3 className="text-xl font-semibold mb-2">{summary.eventName}</h3>
              <p className="text-gray-600">
                <strong>Location:</strong> {summary.location}
              </p>
              <p className="text-gray-600">
                <strong>Start Date:</strong>{" "}
                {new Date(summary.startDate).toLocaleDateString()}
              </p>
              <p className="text-gray-600">
                <strong>End Date:</strong>{" "}
                {new Date(summary.endDate).toLocaleDateString()}
              </p>
              <p className="text-gray-600">
                <strong>Volunteers:</strong> {summary.volunteersRegistered} / {summary.totalPositions}
              </p>
              <div className="mt-4">
                {/* Link to detail page, pass summary._id */}
                <Link
                  to={`/admin/event-summaries/${summary._id}`}
                  className="inline-block bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
                >
                  View Full Summary
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500">No event summaries found.</p>
      )}
    </div>
  );
}

export default EventSummariesList;
