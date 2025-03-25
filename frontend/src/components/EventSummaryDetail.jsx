import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import RenderGeneratedSummary from "./RenderGeneratedSummary"; // Adjust path

function EventSummaryDetail() {
  const { id } = useParams(); // summary ID
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Carousel index for images
  const [currentIndex, setCurrentIndex] = useState(0);

  // States for Volunteer Feedback
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [feedbackError, setFeedbackError] = useState(null);
  const [feedbacks, setFeedbacks] = useState([]);

  // States for Analysis (AI) Modal
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisError, setAnalysisError] = useState(null);
  const [analysisData, setAnalysisData] = useState(null);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        // Adjust your backend endpoint as needed
        const res = await fetch(`http://localhost:3000/api/v1/admin/eventSummaries/${id}`, {
          credentials: "include",
        });
        if (!res.ok) {
          throw new Error(`Error ${res.status}: ${res.statusText}`);
        }
        const data = await res.json();
        setSummary(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, [id]);

  // Handle fetching volunteer feedback
  const handleOpenFeedback = async () => {
    if (!summary?._id) return;
    setShowFeedbackModal(true);
    setFeedbackLoading(true);
    setFeedbackError(null);

    try {
      // Example: GET /api/v1/admin/getFeedbacksForEvent?eventId=<summary.eventId>
      // Adjust to match your actual route
      const url = `http://localhost:3000/api/v1/admin/getFeedbacksForEvent?eventId=${summary.eventId}`;
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) {
        throw new Error(`Error ${res.status}: ${res.statusText}`);
      }
      const data = await res.json();
      setFeedbacks(data);
    } catch (err) {
      setFeedbackError(err.message);
    } finally {
      setFeedbackLoading(false);
    }
  };

  // Close feedback modal
  const handleCloseFeedback = () => {
    setShowFeedbackModal(false);
    setFeedbacks([]);
    setFeedbackError(null);
  };

  // Handle generating volunteer feedback analysis (AI)
  const handleGenerateAnalysis = async () => {
    if (!summary?.eventId) return;
    setShowAnalysisModal(true);
    setAnalysisLoading(true);
    setAnalysisError(null);
    setAnalysisData(null);

    try {
      // Example: GET /api/v1/admin/analyze/:eventId
      // Adjust to match your actual route
      const url = `http://localhost:3000/api/v1/admin/analyze/${summary.eventId}`;
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) {
        throw new Error(`Error ${res.status}: ${res.statusText}`);
      }
      const data = await res.json();
      setAnalysisData(data);
    } catch (err) {
      setAnalysisError(err.message);
      toast.error(`Error generating analysis: ${err.message}`);
    } finally {
      setAnalysisLoading(false);
    }
  };

  // Close analysis modal
  const handleCloseAnalysis = () => {
    setShowAnalysisModal(false);
    setAnalysisError(null);
    setAnalysisData(null);
  };

  // Simple carousel logic
  const handlePrev = () => {
    setCurrentIndex((prev) =>
      prev === 0 ? summary.eventImages.length - 1 : prev - 1
    );
  };

  const handleNext = () => {
    setCurrentIndex((prev) =>
      prev === summary.eventImages.length - 1 ? 0 : prev + 1
    );
  };

  if (loading) return <p className="p-4 text-center text-gray-500">Loading summary...</p>;
  if (error) return <p className="p-4 text-center text-red-500">Error: {error}</p>;
  if (!summary) return <p className="p-4 text-center text-gray-500">No summary found.</p>;

  const {
    eventName,
    location,
    startDate,
    endDate,
    positionsAllocated,
    totalPositions,
    volunteersRegistered,
    organizerFeel,
    organizerEnjoyment,
    fileUrl,
    eventImages = [],
    eventId,
  } = summary;

  return (
    <div className="p-6 max-w-3xl mx-auto bg-white rounded shadow text-center">
      {/* Back to Summaries link */}
      <Link to="/admin/event-summaries" className="text-blue-600 hover:underline inline-block mb-4">
        &larr; Back to Summaries
      </Link>

      {/* Title */}
      <h2 className="text-3xl font-bold mb-4 flex items-center justify-center gap-2">
        <span role="img" aria-label="sparkles">✨</span>
        {eventName}
        <span role="img" aria-label="sparkles">✨</span>
      </h2>

      {/* Event Details */}
      <div className="space-y-2">
        <p className="text-gray-700">
          <strong>📍 Location:</strong> {location}
        </p>
        <p className="text-gray-700">
          <strong>📅 Start Date:</strong>{" "}
          {new Date(startDate).toLocaleDateString()}
        </p>
        <p className="text-gray-700">
          <strong>📅 End Date:</strong>{" "}
          {new Date(endDate).toLocaleDateString()}
        </p>
        <p className="text-gray-700">
          <strong>👥 Volunteers Registered:</strong>{" "}
          {volunteersRegistered} / {totalPositions}
        </p>
        <p className="text-gray-700">
          <strong>💼 Positions Allocated:</strong> {positionsAllocated}
        </p>
      </div>

      {/* Buttons for volunteer feedback & analysis */}
      <div className="mt-6 flex flex-col sm:flex-row justify-center gap-4">
        <button
          onClick={handleOpenFeedback}
          className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition"
        >
          View Volunteer Feedback
        </button>
        <button
          onClick={handleGenerateAnalysis}
          className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded transition"
        >
          Generate Volunteer Feedback Analysis
        </button>
      </div>

      {/* Organizer's Feel & Enjoyment */}
      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-2 flex items-center justify-center gap-1">
          <span role="img" aria-label="person">🧑‍💼</span> Organizer’s Feel
        </h3>
        <p className="text-gray-800 italic mx-auto max-w-xl">
          {organizerFeel}
        </p>
      </div>

      <div className="mt-6">
        <h3 className="text-xl font-semibold mb-2 flex items-center justify-center gap-1">
          <span role="img" aria-label="smiley">😊</span> Organizer’s Enjoyment
        </h3>
        <p className="text-gray-800 italic mx-auto max-w-xl">
          {organizerEnjoyment}
        </p>
      </div>

      {/* File Attachment */}
      {fileUrl && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-2 flex items-center justify-center gap-1">
            <span role="img" aria-label="paperclip">📎</span> File Attachment
          </h3>
          {/* If it's an image, show as <img>. If PDF, use <embed> or <iframe> */}
          <img
            src={fileUrl}
            alt="Attachment"
            className="w-48 h-auto border rounded mx-auto cursor-pointer"
            onClick={() => window.open(fileUrl, "_blank")} // Open in new tab
          />
        </div>
      )}

      {/* Carousel for images */}
      {eventImages.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-2 flex items-center justify-center gap-1">
            <span role="img" aria-label="pictures">🖼️</span> Event Images
          </h3>
          <div className="relative w-full max-w-md mx-auto">
            <div className="h-64 border rounded overflow-hidden flex items-center justify-center bg-gray-100">
              {/* Show current image */}
              <img
                src={eventImages[currentIndex]}
                alt={`EventImage-${currentIndex}`}
                className="object-contain max-h-full max-w-full cursor-pointer"
                onClick={() => window.open(eventImages[currentIndex], "_blank")}
              />
            </div>
            {/* Carousel controls */}
            {eventImages.length > 1 && (
              <>
                <button
                  onClick={() =>
                    setCurrentIndex((prev) =>
                      prev === 0 ? eventImages.length - 1 : prev - 1
                    )
                  }
                  className="absolute top-1/2 left-2 transform -translate-y-1/2 bg-white bg-opacity-70 px-3 py-1 rounded"
                >
                  Prev
                </button>
                <button
                  onClick={() =>
                    setCurrentIndex((prev) =>
                      prev === eventImages.length - 1 ? 0 : prev + 1
                    )
                  }
                  className="absolute top-1/2 right-2 transform -translate-y-1/2 bg-white bg-opacity-70 px-3 py-1 rounded"
                >
                  Next
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Volunteer Feedback Modal */}
      {showFeedbackModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-xl p-6 relative">
            <button
              onClick={handleCloseFeedback}
              className="absolute top-4 right-4 bg-gray-300 hover:bg-gray-400 rounded-full p-2"
            >
              ✖
            </button>
            <h3 className="text-xl font-bold mb-4 text-center">Volunteer Feedback</h3>
            {feedbackLoading ? (
              <p className="text-center text-gray-500">Loading feedback...</p>
            ) : feedbackError ? (
              <p className="text-center text-red-500">Error: {feedbackError}</p>
            ) : feedbacks.length > 0 ? (
              <div className="space-y-4 max-h-80 overflow-y-auto">
                {feedbacks.map((fb) => (
                  <div key={fb._id} className="border rounded p-4 bg-gray-50">
                    <p>
                      <strong>Rating:</strong> {fb.rating}/10
                    </p>
                    <p>
                      <strong>Enjoyed?</strong> {fb.enjoyed ? "Yes" : "No"}
                    </p>
                    {fb.comments && <p><strong>Comments:</strong> {fb.comments}</p>}
                    {fb.suggestions && <p><strong>Suggestions:</strong> {fb.suggestions}</p>}
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(fb.createdAt).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500">No feedback found for this event.</p>
            )}
          </div>
        </div>
      )}

      {/* Analysis Modal */}
      {showAnalysisModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-xl p-6 relative">
            <button
              onClick={handleCloseAnalysis}
              className="absolute top-4 right-4 bg-gray-300 hover:bg-gray-400 rounded-full p-2"
            >
              ✖
            </button>
            <h3 className="text-xl font-bold mb-4 text-center">
              Volunteer Feedback Analysis
            </h3>
            {analysisLoading ? (
              <p className="text-center text-gray-500">Generating analysis...</p>
            ) : analysisError ? (
              <p className="text-center text-red-500">Error: {analysisError}</p>
            ) : analysisData ? (
              <RenderGeneratedSummary summary={analysisData} />
            ) : (
              <p className="text-center text-gray-500">No analysis available.</p>
            )}
          </div>
        </div>
      )}

      <ToastContainer />
    </div>
  );
}

export default EventSummaryDetail;
