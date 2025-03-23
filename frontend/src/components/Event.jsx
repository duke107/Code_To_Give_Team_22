import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';

function Event() {
  const { slug } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [registering, setRegistering] = useState(false);
  const [message, setMessage] = useState(null);
  const [showModal, setShowModal] = useState(false); // For registration modal
  const [selectedPositionId, setSelectedPositionId] = useState(null); // For registration
  const [isRegistered, setIsRegistered] = useState(false);
  const state = useSelector((state) => state.auth);

  // Feedback states
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [rating, setRating] = useState(5);
  const [enjoyed, setEnjoyed] = useState(null); // "yes" or "no"
  const [enjoyedFeedback, setEnjoyedFeedback] = useState("");
  const [notEnjoyedFeedback, setNotEnjoyedFeedback] = useState("");
  const [improvementSuggestions, setImprovementSuggestions] = useState("");
  const [feedbacks, setFeedbacks] = useState([]);

  // Testimonial states
  const [showTestimonialModal, setShowTestimonialModal] = useState(false);
  const [testimonialName, setTestimonialName] = useState('');
  const [testimonialPosition, setTestimonialPosition] = useState(''); // volunteering position
  const [testimonialContent, setTestimonialContent] = useState('');

  // Fetch event details including tasks (populated via backend)
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

      // Check if current user is registered
      if (data.registeredVolunteers && state.user) {
        const registered = data.registeredVolunteers.some(
          (volunteer) => volunteer._id.toString() === state.user._id.toString()
        );
        setIsRegistered(registered);
      }
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEventDetails();
  }, [slug, state.user]);

  // Update task status (toggle pending/completed)
  const handleUpdateTaskStatus = async (taskId, currentStatus) => {
    const newStatus = currentStatus === 'pending' ? 'completed' : 'pending';
    try {
      const res = await fetch(`http://localhost:3000/api/v1/events/updateTask/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || `Error ${res.status}`);
      }
      toast.success("Task status updated successfully");
      // Re-fetch event details to update tasks
      fetchEventDetails();
    } catch (err) {
      toast.error(`Error updating task status: ${err.message}`);
    }
  };

  // Registration logic for non-registered users
  const openModal = () => {
    setMessage(null);
    setSelectedPositionId(null);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const handleConfirm = async () => {
    if (!event || !selectedPositionId) {
      toast.error('Please select a volunteering position.');
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
        toast.info(data.message || 'Already registered');
      } else if (!res.ok) {
        throw new Error(data.message || `Error ${res.status}`);
      } else {
        toast.success('Successfully registered for the event!');
        setIsRegistered(true);
        closeModal();
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setRegistering(false);
      fetchEventDetails();
    }
  };

  // Feedback Modal handlers
  const openFeedbackModal = () => {
    setRating(5);
    setEnjoyed(null);
    setEnjoyedFeedback("");
    setNotEnjoyedFeedback("");
    setImprovementSuggestions("");
    setShowFeedbackModal(true);
  };

  const closeFeedbackModal = () => {
    setShowFeedbackModal(false);
  };

  const handleFeedbackSubmit = async () => {
    const feedbackPayload = {
      rating,
      enjoyed,
      comments: enjoyed === "yes" ? enjoyedFeedback : notEnjoyedFeedback,
      suggestions: improvementSuggestions,
      eventId: event._id,
      userId: state.user._id,
    };

    try {
      const res = await fetch('http://localhost:3000/api/v1/events/submitFeedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(feedbackPayload),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Error submitting feedback');
      }
      await res.json();
      toast.success("Thank you for your feedback!");
      closeFeedbackModal();
    } catch (err) {
      toast.error(`Error submitting feedback: ${err.message}`);
    }
  };

  //to fetch list of all feedbacks in this event:
  useEffect(() => {
    if (event) {
      const fetchFeedbacks = async () => {
        try {
          const res = await fetch(`http://localhost:3000/api/v1/events/feedbacks?eventId=${event._id}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
          });
          const data = await res.json();
          setFeedbacks(data.data);
        } catch (error) {
          console.error("Error fetching feedbacks:", error);
        }
      };
      fetchFeedbacks();
    }
  }, [event]);
  

  // Testimonial Modal handlers
  const openTestimonialModal = () => {
    // Pre-fill the name field if available from auth state
    setTestimonialName(state.user ? state.user.name : '');
    setTestimonialPosition('');
    setTestimonialContent('');
    setShowTestimonialModal(true);
  };

  const closeTestimonialModal = () => {
    setShowTestimonialModal(false);
  };

  const handleTestimonialSubmit = async () => {
    if (!testimonialName || !testimonialContent || !testimonialPosition) {
      toast.error('Please fill in all testimonial fields.');
      return;
    }
    const testimonialPayload = {
      name: testimonialName,
      eventId: event._id,
      eventTitle: event.title, // optional, if you need to store it
      volunteeringPosition: testimonialPosition,
      testimonial: testimonialContent,
      userId: state.user._id,
    };
    try {
      const res = await fetch('http://localhost:3000/api/v1/events/submitTestimonial', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(testimonialPayload),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Error submitting testimonial');
      }
      await res.json();
      toast.success("Thank you for sharing your experience!");
      closeTestimonialModal();
    } catch (err) {
      toast.error(`Error submitting testimonial: ${err.message}`);
    }
  };

  if (loading) return <p className="text-center text-gray-500">Loading event details...</p>;
  if (error) return <p className="text-center text-red-500">Error: {error}</p>;
  if (!event) return <p className="text-center text-gray-500">No event data available.</p>;

  // Extract tasks assigned to the current user from event.volunteeringPositions
  let userTasks = [];
  event.volunteeringPositions?.forEach((position) => {
    position.registeredUsers?.forEach((volunteer) => {
      if (volunteer._id.toString() === state.user._id.toString()) {
        userTasks = volunteer.tasks || [];
      }
    });
  });

  // Extract volunteering positions that the current user registered for (for testimonial dropdown)
  let registeredPositions = [];
  event.volunteeringPositions?.forEach((position) => {
    position.registeredUsers?.forEach((volunteer) => {
      if (volunteer._id.toString() === state.user._id.toString()) {
        registeredPositions.push(position);
      }
    });
  });

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
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Volunteering Positions</h2>
          <ul className="list-disc list-inside text-gray-700">
            {event.volunteeringPositions.map((position) => (
              <li key={position._id}>
                <span className="font-semibold">{position.title}</span> - {position.slots} slots available
              </li>
            ))}
          </ul>
        </div>
      )}
      <p className="text-gray-500 mt-4 text-sm">
        Created by: {event.createdBy?.name || "Unknown"}
      </p>
      
      {/* Registration Button / Message */}
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

      {/* Display User's Assigned Tasks if Registered */}
      {isRegistered && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Your Assigned Tasks</h2>
          {userTasks.length > 0 ? (
            <ul className="list-disc list-inside text-gray-700">
              {userTasks.map((task, idx) => (
                <li key={idx} className="mb-2 flex items-center gap-2">
                  <span>
                    <span className="font-semibold">Task:</span> {task.description} –{' '}
                    <span className="italic">{task.status}</span>
                  </span>
                  <button
                    onClick={() => handleUpdateTaskStatus(task._id, task.status)}
                    className="bg-orange-600 hover:bg-orange-700 text-white py-1 px-2 rounded text-xs"
                  >
                    {task.status === 'pending' ? 'Mark Completed' : 'Mark Pending'}
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 text-sm">No tasks assigned yet.</p>
          )}
        </div>
      )}

      {/* Give Feedback Button */}
      {/* <button
        onClick={openFeedbackModal}
        className="w-full mt-6 bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg transition"
      >
        Give Feedback
      </button> */}

      {/* show all feedbacks to the creator */}
      {/* {state.user && state.user._id === event.createdBy && (
      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-2">Feedbacks</h2>
        {feedbacks.length > 0 ? (
          feedbacks.map((fb) => (
            <div key={fb._id} className="border p-3 rounded mb-2">
              <p className="text-gray-700 font-semibold">Rating: {fb.rating}</p>
              <p className="text-gray-700">{fb.comment}</p>
            </div>
          ))
        ) : (
          <p className="text-gray-600">No feedback yet.</p>
        )}
      </div>
      )} */}
      

      Give Feedback Button - Visible only if registered
      {isRegistered && (
        <button
          onClick={openFeedbackModal}
          className="w-full mt-6 bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg transition"
        >
          Give Feedback
        </button>
      )}

      {/* Testimonial Button - Visible only if registered */}
      {isRegistered && (
        <button
          onClick={openTestimonialModal}
          className="w-full mt-6 bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded-lg transition"
        >
          Want to share your experience? Leave a testimonial
        </button>
      )}

      {/* Registration Modal */}
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

      {/* Feedback Modal */}
      {showFeedbackModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-11/12 max-w-md">
            <h2 className="text-xl font-bold mb-4">Give Feedback</h2>
            <div className="mb-4">
              <label className="block text-gray-700 font-semibold mb-1">
                Rate the event: {rating}
              </label>
              <input
                type="range"
                min="0"
                max="5"
                value={rating}
                onChange={(e) => setRating(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="mb-4">
              <p className="text-gray-700 font-semibold mb-1">
                Did you enjoy volunteering with us?
              </p>
              <div className="flex items-center gap-4">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="enjoyed"
                    value="yes"
                    checked={enjoyed === "yes"}
                    onChange={() => setEnjoyed("yes")}
                    className="form-radio"
                  />
                  <span className="ml-2">Yes</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="enjoyed"
                    value="no"
                    checked={enjoyed === "no"}
                    onChange={() => setEnjoyed("no")}
                    className="form-radio"
                  />
                  <span className="ml-2">No</span>
                </label>
              </div>
            </div>
            {enjoyed === "yes" && (
              <div className="mb-4">
                <label className="block text-gray-700 font-semibold mb-1">
                  What did you enjoy/like most in the event?
                </label>
                <textarea
                  value={enjoyedFeedback}
                  onChange={(e) => setEnjoyedFeedback(e.target.value)}
                  className="w-full border rounded p-2"
                  rows="3"
                ></textarea>
              </div>
            )}
            {enjoyed === "no" && (
              <div className="mb-4">
                <label className="block text-gray-700 font-semibold mb-1">
                  What went wrong?
                </label>
                <textarea
                  value={notEnjoyedFeedback}
                  onChange={(e) => setNotEnjoyedFeedback(e.target.value)}
                  className="w-full border rounded p-2"
                  rows="3"
                ></textarea>
              </div>
            )}
            <div className="mb-4">
              <label className="block text-gray-700 font-semibold mb-1">
                Suggest any improvements or changes
              </label>
              <textarea
                value={improvementSuggestions}
                onChange={(e) => setImprovementSuggestions(e.target.value)}
                className="w-full border rounded p-2"
                rows="2"
              ></textarea>
            </div>
            <div className="flex gap-4">
              <button
                onClick={handleFeedbackSubmit}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg"
              >
                Submit Feedback
              </button>
              <button
                onClick={closeFeedbackModal}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Testimonial Modal */}
      {showTestimonialModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-11/12 max-w-md">
            <h2 className="text-xl font-bold mb-4">Leave a Testimonial</h2>
            <div className="mb-4">
              <label className="block text-gray-700 font-semibold mb-1">
                Your Name
              </label>
              <input
                type="text"
                value={testimonialName}
                onChange={(e) => setTestimonialName(e.target.value)}
                className="w-full border rounded p-2"
                placeholder="Enter your name"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 font-semibold mb-1">
                Event
              </label>
              <input
                type="text"
                value={event.title}
                className="w-full border rounded p-2 bg-gray-100"
                disabled
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 font-semibold mb-1">
                Volunteering Position
              </label>
              <select
                value={testimonialPosition}
                onChange={(e) => setTestimonialPosition(e.target.value)}
                className="w-full border rounded p-2"
              >
                <option value="">Select a position</option>
                {registeredPositions.map((position) => (
                  <option key={position._id} value={position.title}>
                    {position.title}
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 font-semibold mb-1">
                Testimonial
              </label>
              <textarea
                value={testimonialContent}
                onChange={(e) => setTestimonialContent(e.target.value)}
                className="w-full border rounded p-2"
                rows="4"
                placeholder="Share your experience..."
              ></textarea>
            </div>
            <div className="flex gap-4">
              <button
                onClick={handleTestimonialSubmit}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg"
              >
                Submit
              </button>
              <button
                onClick={closeTestimonialModal}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg"
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
