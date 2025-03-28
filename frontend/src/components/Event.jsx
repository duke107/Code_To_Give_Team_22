import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast, ToastContainer } from "react-toastify";
import { Pie } from "react-chartjs-2";
import { Chart, ArcElement, Tooltip, Legend } from "chart.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { app } from "../firebase";
import "react-toastify/dist/ReactToastify.css";
import ShareButtons from "./ShareButtons";
import { useRef } from "react";
import SpeechToText from "./SpeechToText";

import { motion } from "framer-motion";
Chart.register(ArcElement, Tooltip, Legend);

const Event = () => {
  const { slug } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [registering, setRegistering] = useState(false);
  const [message, setMessage] = useState(null);
  const [showModal, setShowModal] = useState(false); // Registration modal
  const [selectedPositionId, setSelectedPositionId] = useState(null); // For registration
  const [isRegistered, setIsRegistered] = useState(false);

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
  const [testimonialContent, setTestimonialContent] = useState("");
  const [registeredPositions, setRegisteredPositions] = useState([]);

  // Task Completion Proof states
  const [showProofModal, setShowProofModal] = useState(false);
  const [currentTask, setCurrentTask] = useState(null);
  const [proofMessage, setProofMessage] = useState("");
  const [proofFiles, setProofFiles] = useState([]);
  const [proofUploadLoading, setProofUploadLoading] = useState(false);

  // Task Update states
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updateTitle, setUpdateTitle] = useState("");
  const [updateContent, setUpdateContent] = useState("");
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateTask, setUpdateTask] = useState(null);

  const textAreaRef = useRef();
  const state = useSelector((state) => state.auth);


  // Helper: Check if event has ended
  const hasEventEnded = (event) => {
    return new Date(event.eventEndDate) < Date.now();
  };

  // Fetch event details including tasks and volunteering positions
  const fetchEventDetails = async () => {
    try {
      const res = await fetch(`http://localhost:3000/api/v1/events/${slug}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      if (!res.ok) {
        throw new Error(`Error ${res.status}: ${res.statusText}`);
      }
      const data = await res.json();
      setEvent(data);

      // Check if current user is registered
      if (data.registeredVolunteers && state.user) {
        const registered = data.registeredVolunteers.some(
          (volunteer) =>
            volunteer._id.toString() === state.user?._id?.toString()
        );
        setIsRegistered(registered);
      }

      // For positions: find which positions the current user is registered for
      let positions = [];
      data.volunteeringPositions?.forEach((position) => {
        position.registeredUsers?.forEach((volunteer) => {
          if (volunteer._id.toString() === state.user?._id?.toString()) {
            positions.push(position);
          }
        });
      });
      setRegisteredPositions(positions);
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEventDetails();
    // eslint-disable-next-line
  }, [slug, state.user]);

  // Registration modal handlers
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
      toast.error("Please select a volunteering position.");
      return;
    }
    setRegistering(true);
    setMessage(null);
    try {
      const res = await fetch(`http://localhost:3000/api/v1/events/${slug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          id: state.user?._id,
          positionId: selectedPositionId,
        }),
      });
      const data = await res.json();
      if (res.status === 409) {
        toast.info(data.message || "Already registered");
      } else if (!res.ok) {
        throw new Error(data.message || `Error ${res.status}`);
      } else {
        toast.success("Successfully registered for the event!");
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
      userId: state.user?._id,
    };

    try {
      const res = await fetch(
        "http://localhost:3000/api/v1/events/submitFeedback",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(feedbackPayload),
        }
      );
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Error submitting feedback");
      }
      await res.json();
      toast.success("Thank you for your feedback!");
      closeFeedbackModal();
    } catch (err) {
      toast.error(`Error submitting feedback: ${err.message}`);
    }
  };

  // Testimonial Modal handlers
  const openTestimonialModal = () => {
    // Prefill name from user, if available
    setTestimonialContent("");
    setShowTestimonialModal(true);
  };

  const closeTestimonialModal = () => {
    setShowTestimonialModal(false);
  };

  const handleTestimonialSubmit = async () => {
    if (!testimonialContent) {
      toast.error("You cannot submit an empty testimonial.");
      return;
    }

    const wordCount = testimonialContent.split(/\s+/).filter(Boolean).length;
    if (wordCount < 60) {
      toast.error("Your testimonial must be at least 60 words long.");
      return;
    }

    const testimonialPayload = {
      name: state.user.name,
      eventId: event._id,
      eventTitle: event.title,
      volunteeringPosition: registeredPositions[0]?.title || "",
      testimonial: testimonialContent,
      userId: state.user?._id,
    };
    try {
      const res = await fetch(
        "http://localhost:3000/api/v1/events/submitTestimonial",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(testimonialPayload),
        }
      );
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Error submitting testimonial");
      }
      await res.json();
      toast.success("Thank you for sharing your experience!");
      closeTestimonialModal();
    } catch (err) {
      toast.error(`Error submitting testimonial: ${err.message}`);
    }
  };

  // Task Completion Proof Modal handlers
  const openProofModal = (task) => {
    setCurrentTask(task);
    setProofMessage("");
    setProofFiles([]);
    setShowProofModal(true);
  };

  const closeProofModal = () => {
    setShowProofModal(false);
    setCurrentTask(null);
  };

  const handleProofFilesChange = (e) => {
    setProofFiles(Array.from(e.target.files));
  };

  const handleSubmitProof = async () => {
    if (!currentTask) return;
    if (proofFiles.length === 0) {
      toast.error("Please upload at least one image as proof.");
      return;
    }
    setProofUploadLoading(true);
    try {
      const storage = getStorage(app, "gs://mern-blog-b327f.appspot.com");
      const uploadedProofURLs = [];
      for (const file of proofFiles) {
        const sanitizedFileName =
          new Date().getTime() +
          "-" +
          file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
        const storageRef = ref(storage, sanitizedFileName);
        let metadata = { contentType: file.type };
        const snapshot = await uploadBytes(storageRef, file, metadata);
        const downloadURL = await getDownloadURL(snapshot.ref);
        uploadedProofURLs.push(downloadURL);
      }
      const payload = {
        message: proofMessage,
        proofImages: uploadedProofURLs,
      };
      const res = await fetch(
        `http://localhost:3000/api/v1/events/proof/${currentTask._id}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || `Error ${res.status}`);
      }
      toast.success("Task proof submitted successfully! Waiting for approval.");
      closeProofModal();
      fetchEventDetails();
    } catch (err) {
      toast.error(`Error submitting task proof: ${err.message}`);
    } finally {
      setProofUploadLoading(false);
    }
  };

  // Task Update Modal handlers
  const openUpdateModal = (task) => {
    setUpdateTask(task);
    setUpdateTitle("");
    setUpdateContent("");
    setShowUpdateModal(true);
  };

  const closeUpdateModal = () => {
    setShowUpdateModal(false);
    setUpdateTask(null);
  };

  const handleSubmitTaskUpdate = async () => {
    if (!updateTask || !updateTitle || !updateContent) {
      toast.error("Please fill in both title and content.");
      return;
    }
    setUpdateLoading(true);
    try {
      const payload = { title: updateTitle, content: updateContent };
      const res = await fetch(
        `http://localhost:3000/api/v1/events/taskUpdate/${updateTask._id}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || `Error ${res.status}`);
      }
      toast.success("Task update sent successfully!");
      closeUpdateModal();
      fetchEventDetails();
    } catch (err) {
      toast.error(`Error submitting task update: ${err.message}`);
    } finally {
      setUpdateLoading(false);
    }
  };

  if (loading)
    return (
      <p className="text-center text-gray-500">Loading event details...</p>
    );
  if (error) return <p className="text-center text-red-500">Error: {error}</p>;
  if (!event)
    return (
      <p className="text-center text-gray-500">No event data available.</p>
    );

  // Extract tasks assigned to the current user from event.volunteeringPositions
  let userTasks = [];
  event.volunteeringPositions?.forEach((position) => {
    position.registeredUsers?.forEach((volunteer) => {
      if (
        volunteer._id.toString() === state.user?._id?.toString() &&
        volunteer.tasks
      ) {
        // Merge tasks from all positions
        userTasks = userTasks.concat(volunteer.tasks);
      }
    });
  });

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-2xl mt-5 shadow-lg p-8 relative border border-gray-200">
      <div className="flex justify-between">
      <h1 className="text-4xl text-center font-extrabold text-gray-900 mb-6">
        {event.title}
      </h1>
      <ShareButtons event={event} />
      </div>
      {event.image && (
        <img src={event.image} alt={event.title} className="w-full h-64 object-contain rounded-xl mb-5 shadow" />
      )}
      <div
        className="text-gray-700 mb-6 leading-relaxed"
        dangerouslySetInnerHTML={{ __html: event.content }}
      />
      <div className="bg-gray-50 p-5 rounded-xl border border-gray-200 mb-6">
        <p className="text-lg font-semibold text-gray-800">
          📍 {event.eventLocation}
        </p>
        <p className="text-gray-600">
          🏷 <strong>Category:</strong> {event.category}
        </p>
        <p className="text-gray-600">
          📅 <strong>Start:</strong>{" "}
          {new Date(event.eventStartDate).toLocaleDateString()}
        </p>
        <p className="text-gray-600">
          📅 <strong>End:</strong>{" "}
          {new Date(event.eventEndDate).toLocaleDateString()}
        </p>
      </div>

      {/* List all volunteering positions */}
      {event.volunteeringPositions?.length > 0 && (
        <div className="mt-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-3">
            Volunteering Positions
          </h2>
          <ul className="space-y-3 text-gray-700">
            {event.volunteeringPositions.map((position) => (
              <li key={position._id} className="p-3 bg-gray-100 rounded-lg">
                <span className="font-semibold">{position.title}</span> -{" "}
                {position.slots} slots available
                {/* If position has a WhatsApp link, show it for everyone or just for those who are registered? 
                    Typically, you'd show it only if user is in that position, but here it's just a general list. 
                    We'll not display it to all. We'll show it in "Your Registered Positions" section below. */}
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className="text-gray-500 mt-6 text-sm">
        Created by:{" "}
        <span className="font-medium">
          {event.createdBy?.name || "Unknown"}
        </span>
      </p>

      {/* Donate Button */} 
      <Link
        to={`/donate?eventId=${event._id}`}
        className="mt-2 inline-block bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-700"
      >
        Donate to this Event
      </Link>

      {/* Registration or "Registered" Status */}
      {isRegistered ? (
        <p className="text-center text-green-600 mt-6 font-bold">
          ✅ You are registered for this event as a volunteer.
        </p>
      ) : (
        <button
          className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all shadow-md hover:shadow-lg disabled:bg-gray-400"
          onClick={openModal}
          disabled={registering}
        >
          {registering ? "Processing..." : "Register for Event"}
        </button>
      )}

      {/* If user is registered, show tasks, feedback/testimonial buttons, etc. */}
      {isRegistered && (
        <>
          {/* "Your Registered Positions" - show link to WhatsApp group if available */}
          {registeredPositions.length > 0 && (
            <div className="mt-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">
                Your Registered Positions
              </h2>
              <ul className="space-y-3 text-gray-700">
                {registeredPositions.map((pos) => (
                  <li
                    key={pos._id}
                    className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border"
                  >
                    <span className="font-semibold">{pos.title}</span>
                    {pos.whatsappGroupLink ? (
                      <a
                        href={pos.whatsappGroupLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-green-600 hover:bg-green-700 text-white py-1 px-3 rounded-lg text-xs"
                      >
                        Join WhatsApp Group
                      </a>
                    ) : (
                      <span className="text-gray-500 text-xs">
                        No WhatsApp link available
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Assigned Tasks */}
          <div className="mt-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">
              Your Assigned Tasks
            </h2>
            {userTasks.length > 0 ? (
              <ul className="space-y-3 text-gray-700">
                {userTasks.map((task, idx) => (
                  <li
                    key={idx}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-gray-50 p-3 rounded-lg border space-y-2 sm:space-y-0 sm:space-x-4"
                  >
                    <div>
                      <span className="font-semibold">Task:</span>{" "}
                      {task.description} –{" "}
                      <span className="italic">
                        {task.status === "completed"
                          ? "Task Completed"
                          : task.proofSubmitted
                          ? "Waiting for Approval"
                          : "Pending"}
                      </span>
                    </div>
                    {task.status === "pending" && (
                      <div className="flex gap-2">
                        {!task.proofSubmitted ? (
                          <button
                            onClick={() => openProofModal(task)}
                            className="bg-blue-600 hover:bg-blue-700 text-white py-1 px-3 rounded-lg text-xs"
                          >
                            Send Task Completion Proof
                          </button>
                        ) : (
                          <button
                            disabled
                            className="bg-gray-400 text-white py-1 px-3 rounded-lg text-xs cursor-not-allowed"
                          >
                            Waiting for Approval
                          </button>
                        )}
                        <button
                          onClick={() => openUpdateModal(task)}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white py-1 px-3 rounded-lg text-xs"
                        >
                          Send Task Updates
                        </button>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 text-sm">No tasks assigned yet.</p>
            )}
          </div>

          {/* Feedback / Testimonial Buttons */}
          {hasEventEnded(event) && <button
            onClick={openFeedbackModal}
            className="w-full mt-6 bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-xl transition-all shadow-md hover:shadow-lg"
          >
            Give Feedback
          </button>
          }
          {hasEventEnded(event) && <button
            onClick={openTestimonialModal}
            className="w-full mt-4 bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 rounded-xl transition-all shadow-md hover:shadow-lg"
          >
            Leave a Testimonial
          </button>
          } 
        </>
      )}

      {/* Registration Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 w-11/12 max-w-md">
            <h2 className="text-xl font-bold mb-4">
              Choose a Volunteering Position
            </h2>
            <ul className="mb-4 space-y-3">
              {event.volunteeringPositions.map((position) => (
                <li key={position._id}>
                  <button
                    onClick={() => setSelectedPositionId(position._id)}
                    className={`w-full text-left py-2 px-4 rounded-lg border 
                      ${
                        selectedPositionId === position._id
                          ? "bg-blue-500 text-white"
                          : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                      }`}
                    disabled={position.slots <= 0 || registering}
                  >
                    {position.title}{" "}
                    {position.slots <= 0 && "(No slots available)"}
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

      {/* Task Completion Proof Modal */}
      {showProofModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 w-11/12 max-w-md">
            <h2 className="text-xl font-bold mb-4">Submit Task Completion Proof</h2>
            <p className="mb-2">
              <span className="font-semibold">Task:</span> {currentTask?.description}
            </p>
            <div className="mb-4">
              <label className="block text-gray-700 font-semibold mb-1">
                Completion Message
              </label>
              <div className="relative">
                <textarea
                  ref={textAreaRef}
                value={proofMessage}
                onChange={(e) => setProofMessage(e.target.value)}
                className="w-full border rounded p-2 min-h-[120px]"
                rows="3"
                placeholder="Enter a message regarding your task completion..."
                /><SpeechToText textAreaRef={textAreaRef} setText={setProofMessage} left="10px" bottom="10px"/>
                </div>
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 font-semibold mb-1">
                Upload Proof Images
              </label>
              <input
                type="file"
                multiple
                onChange={handleProofFilesChange}
                className="w-full"
              />
            </div>
            <div className="flex gap-4">
              <button
                onClick={handleSubmitProof}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg"
                disabled={proofUploadLoading}
              >
                {proofUploadLoading ? "Submitting..." : "Submit Proof"}
              </button>
              <button
                onClick={closeProofModal}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg"
                disabled={proofUploadLoading}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Task Update Modal */}
      {showUpdateModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 w-11/12 max-w-md">
            <h2 className="text-xl font-bold mb-4">Send Task Update</h2>
            <div className="mb-4">
              <label className="block text-gray-700 font-semibold mb-1">
                Title
              </label>
              <input
                type="text"
                value={updateTitle}
                onChange={(e) => setUpdateTitle(e.target.value)}
                className="w-full border rounded p-2"
                placeholder="Enter update title"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 font-semibold mb-1">
                Content
              </label>
              <textarea
                value={updateContent}
                onChange={(e) => setUpdateContent(e.target.value)}
                className="w-full border rounded p-2"
                rows="4"
                placeholder="Enter update content"
              ></textarea>
            </div>
            <div className="flex gap-4">
              <button
                onClick={handleSubmitTaskUpdate}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg"
                disabled={updateLoading}
              >
                {updateLoading ? "Submitting..." : "Submit Update"}
              </button>
              <button
                onClick={closeUpdateModal}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg"
                disabled={updateLoading}
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
                max="10"
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
                <div className="relative">
                  <textarea
                    ref={textAreaRef}
                    value={enjoyedFeedback}
                    onChange={(e) => setEnjoyedFeedback(e.target.value)}
                    className="w-full border rounded p-2 min-h-[120px]"
                    rows="3"
                  />
                  <SpeechToText textAreaRef={textAreaRef} setText={setEnjoyedFeedback} left="10px" bottom="10px"/>
                </div>
              </div>
            )}

            {enjoyed === "no" && (
              <div className="mb-4">
                <label className="block text-gray-700 font-semibold mb-1">
                  What went wrong?
                </label>
                <div className="relative">
                  <textarea
                    ref={textAreaRef}
                    value={notEnjoyedFeedback}
                    onChange={(e) => setNotEnjoyedFeedback(e.target.value)}
                    className="w-full border rounded p-2 min-h-[120px]"
                    rows="3"
                  />
                  <SpeechToText textAreaRef={textAreaRef} setText={setNotEnjoyedFeedback} left="10px" bottom="10px"/>
                </div>
              </div>
            )}

            <div className="mb-4">
              <label className="block text-gray-700 font-semibold mb-1">
                Suggest any improvements or changes
              </label>
              <div className="relative">
                <textarea
                  ref={textAreaRef}
                  value={improvementSuggestions}
                  onChange={(e) => setImprovementSuggestions(e.target.value)}
                  className="w-full border rounded p-2 min-h-[120px]"
                  rows="2"
                />
                <SpeechToText textAreaRef={textAreaRef} setText={setImprovementSuggestions} left="10px" bottom="10px"/>
              </div>
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
                value={state.user?.name || ""}
                className="w-full border rounded p-2 bg-gray-100"
                disabled
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
              <input
                type="text"
                value={registeredPositions[0]?.title || ""}
                className="w-full border rounded p-2 bg-gray-100"
                disabled
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 font-semibold mb-1">
                Testimonial
              </label>
              <div className="relative">
              <textarea
                ref={textAreaRef}
                value={testimonialContent}
                onChange={(e) => setTestimonialContent(e.target.value)}
                className="w-full border rounded p-2 min-h-[120px]"
                rows="4"
                placeholder="Share your experience..."
              />
                <SpeechToText textAreaRef={textAreaRef} setText={setTestimonialContent} left="10px" bottom="10px"/>
              </div>
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

      <ToastContainer />
    </div>
  );
};

export default Event;
