import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast, ToastContainer } from "react-toastify";
import html2canvas from "html2canvas";
import { Bar, Pie } from "react-chartjs-2";
import { Chart, ArcElement, Tooltip, Legend } from "chart.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { app } from "../firebase";
import "react-toastify/dist/ReactToastify.css";
import RenderGeneratedSummary from "./RenderGeneratedSummary";

Chart.register(ArcElement, Tooltip, Legend);

function EventOrganiser() {
  const { slug } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useSelector((state) => state.auth);

  // Loader states for file and images upload
  const [fileUploadLoading, setFileUploadLoading] = useState(false);
  const [imagesUploadLoading, setImagesUploadLoading] = useState(false);

  // State for task assignment modal
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedVolunteer, setSelectedVolunteer] = useState(null);
  const [taskInputs, setTaskInputs] = useState([""]);

  // State for feedback and visual summary
  const [feedbackVisible, setFeedbackVisible] = useState(false);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [feedbackError, setFeedbackError] = useState(null);
  const [feedbacks, setFeedbacks] = useState([]);
  const [showVisualDisplay, setShowVisualDisplay] = useState(false);

  // State for event summary form modal
  const [showSummaryForm, setShowSummaryForm] = useState(false);
  const [summaryData, setSummaryData] = useState({
    eventName: "",
    location: "",
    startDate: "",
    endDate: "",
    positionsAllocated: 0,
    totalPositions: 0,
    volunteersRegistered: 0,
    organizerFeel: "",
    organizerEnjoyment: "",
    fileUrl: "",
    eventImages: [],
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedImages, setSelectedImages] = useState([]);
  const pdfRef = useRef();

  // Review proof modal state
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewTask, setReviewTask] = useState(null);

  // Task updates modal state
  const [showTaskUpdatesModal, setShowTaskUpdatesModal] = useState(false);
  const [taskUpdates, setTaskUpdates] = useState([]);
  const [taskUpdatesLoading, setTaskUpdatesLoading] = useState(false);
  const [taskUpdatesError, setTaskUpdatesError] = useState(null);

  // New: Generated Feedback Summary states
  const [generatedSummary, setGeneratedSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState(null);
  const [showGeneratedSummaryModal, setShowGeneratedSummaryModal] = useState(false);

  // For collapsible panels: positions & volunteers
  const [expandedPositions, setExpandedPositions] = useState({});
  const [expandedVolunteers, setExpandedVolunteers] = useState({});

  // Fetch event details
  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        const res = await fetch(`http://localhost:3000/api/v1/events/${slug}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });
        if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
        const data = await res.json();
        console.log(data);
        setEvent(data);
        setSummaryData({
          eventName: data.title || "",
          location: data.eventLocation || "",
          startDate: data.eventStartDate
            ? new Date(data.eventStartDate).toISOString().split("T")[0]
            : "",
          endDate: data.eventEndDate
            ? new Date(data.eventEndDate).toISOString().split("T")[0]
            : "",
          positionsAllocated:
            data.volunteeringPositions?.reduce(
              (acc, pos) => acc + (pos.registeredUsers?.length || 0),
              0
            ) ?? 0,
          totalPositions:
            data.volunteeringPositions?.reduce(
              (acc, pos) => acc + (pos.slots || 0),
              0
            ) ?? 0,
          volunteersRegistered:
            data.volunteeringPositions?.flatMap((pos) => pos.registeredUsers).length ?? 0,
          organizerFeel: "",
          organizerEnjoyment: "",
          fileUrl: "",
          eventImages: [],
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchEventDetails();
  }, [slug]);

  // Feedback functions
  const fetchFeedbacks = async () => {
    setFeedbackLoading(true);
    setFeedbackError(null);
    try {
      const res = await fetch(`http://localhost:3000/api/v1/events/feedbacks?eventId=${event._id}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
      const data = await res.json();
      setFeedbacks(data);
    } catch (err) {
      setFeedbackError(err.message);
    } finally {
      setFeedbackLoading(false);
    }
  };

  const toggleFeedback = () => {
    if (!feedbackVisible) fetchFeedbacks();
    if (feedbackVisible) setShowVisualDisplay(false);
    setFeedbackVisible(!feedbackVisible);
  };

  const toggleVisualDisplay = () => {
    setShowVisualDisplay(!showVisualDisplay);
  };

  const handleDownloadVisual = async () => {
    if (pdfRef.current) {
      try {
        const canvas = await html2canvas(pdfRef.current, { scale: 2 });
        const imgData = canvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.href = imgData;
        link.download = "visual-summary.png";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (error) {
        console.error("Error downloading image:", error);
        toast.error(`Error downloading image: ${error.message}`);
      }
    }
  };

  const getFeedbackSummary = () => {
    if (!feedbacks || feedbacks.length === 0) return null;
    const total = feedbacks.length;
    const averageRating = (feedbacks.reduce((acc, cur) => acc + Number(cur.rating), 0) / total).toFixed(1);
    const positiveCount = feedbacks.filter((fb) => fb.enjoyed).length;
    const negativeCount = total - positiveCount;
    return { total, averageRating, positiveCount, negativeCount };
  };

  const summary = getFeedbackSummary();
  const barData = {
    labels: ["Positive", "Negative"],
    datasets: [
      {
        label: "Review Count",
        data: summary ? [summary.positiveCount, summary.negativeCount] : [0, 0],
        backgroundColor: ["#36d399", "#f87272"],
      },
    ],
  };

  const ratingCounts = {};
  feedbacks.forEach((fb) => {
    ratingCounts[fb.rating] = (ratingCounts[fb.rating] || 0) + 1;
  });
  const ratingLabels = Object.keys(ratingCounts).sort((a, b) => a - b);
  const pieData = {
    labels: ratingLabels,
    datasets: [
      {
        data: ratingLabels.map((r) => ratingCounts[r]),
        backgroundColor: [
          "#FF6384",
          "#36A2EB",
          "#FFCE56",
          "#4BC0C0",
          "#9966FF",
          "#FF9F40",
          "#E7E9ED",
          "#7CB342",
          "#D81B60",
          "#8E24AA",
        ],
      },
    ],
  };

  // Task assignment modal functions
  const openTaskModal = (volunteer) => {
    setSelectedVolunteer(volunteer);
    setTaskInputs([""]);
    setShowTaskModal(true);
  };
  const closeTaskModal = () => {
    setShowTaskModal(false);
    setSelectedVolunteer(null);
  };
  const handleTaskInputChange = (index, value) => {
    const newTasks = [...taskInputs];
    newTasks[index] = value;
    setTaskInputs(newTasks);
  };
  const addTaskField = () => {
    setTaskInputs([...taskInputs, ""]);
  };
  const [assignLoading, setAssignLoading] = useState(false);
  const handleAssignTasks = async () => {
    if (!selectedVolunteer) return;
    const tasksToAssign = taskInputs
      .map((desc) => ({ description: desc.trim(), status: "pending" }))
      .filter((task) => task.description !== "");
    if (tasksToAssign.length === 0) {
      alert("Please enter at least one task.");
      return;
    }
    setAssignLoading(true);
    try {
      const res = await fetch("http://localhost:3000/api/v1/events/assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          volunteerId: selectedVolunteer._id,
          eventId: event._id,
          tasks: tasksToAssign,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || `Error ${res.status}`);
      }
      toast.success("Task assigned successfully!");
      const updatedRes = await fetch(`http://localhost:3000/api/v1/events/${slug}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      if (updatedRes.ok) {
        const updatedData = await updatedRes.json();
        setEvent(updatedData);
      }
      closeTaskModal();
    } catch (err) {
      alert(`Error assigning tasks: ${err.message}`);
    } finally {
      setAssignLoading(false);
    }
  };

  const handleSummaryChange = (e) => {
    const { name, value } = e.target;
    setSummaryData((prev) => ({ ...prev, [name]: value }));
  };
  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };
  const handleUploadFile = async () => {
    if (!selectedFile) {
      toast.error("Please select a file");
      return;
    }
    setFileUploadLoading(true);
    try {
      const storage = getStorage(app, "gs://mern-blog-b327f.appspot.com");
      const sanitizedFileName =
        new Date().getTime() + "-" + selectedFile.name.replace(/[^a-zA-Z0-9.-]/g, "_");
      const storageRef = ref(storage, sanitizedFileName);
      let metadata = { contentType: selectedFile.type };
      if (!metadata.contentType && /\.pdf$/i.test(selectedFile.name)) {
        metadata.contentType = "application/pdf";
      }
      const snapshot = await uploadBytes(storageRef, selectedFile, metadata);
      const downloadURL = await getDownloadURL(snapshot.ref);
      setSummaryData((prev) => ({ ...prev, fileUrl: downloadURL }));
      toast.success("File uploaded successfully!");
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error(`Error uploading file: ${error.message}`);
    } finally {
      setFileUploadLoading(false);
    }
  };
  const handleImagesChange = (e) => {
    setSelectedImages(Array.from(e.target.files));
  };
  const handleUploadImages = async () => {
    if (selectedImages.length === 0) {
      toast.error("Please select one or more images");
      return;
    }
    setImagesUploadLoading(true);
    try {
      const storage = getStorage(app, "gs://mern-blog-b327f.appspot.com");
      const uploadedImageURLs = [];
      for (const image of selectedImages) {
        const sanitizedFileName =
          new Date().getTime() + "-" + image.name.replace(/[^a-zA-Z0-9.-]/g, "_");
        const storageRef = ref(storage, sanitizedFileName);
        let metadata = { contentType: image.type };
        const snapshot = await uploadBytes(storageRef, image, metadata);
        const downloadURL = await getDownloadURL(snapshot.ref);
        uploadedImageURLs.push(downloadURL);
      }
      setSummaryData((prev) => ({ ...prev, eventImages: uploadedImageURLs }));
      toast.success("Images uploaded successfully!");
    } catch (error) {
      console.error("Error uploading images:", error);
      toast.error(`Error uploading images: ${error.message}`);
    } finally {
      setImagesUploadLoading(false);
    }
  };

  const handleSubmitSummary = async (e) => {
    e.preventDefault();
    const organiserId = user._id;
    const payload = {
      eventName: summaryData.eventName,
      location: summaryData.location,
      startDate: summaryData.startDate,
      endDate: summaryData.endDate,
      positionsAllocated: summaryData.positionsAllocated,
      totalPositions: summaryData.totalPositions,
      volunteersRegistered: summaryData.volunteersRegistered,
      organizerFeel: summaryData.organizerFeel,
      organizerEnjoyment: summaryData.organizerEnjoyment,
      fileUrl: summaryData.fileUrl,
      eventImages: summaryData.eventImages,
      eventId: event._id,
      organiserId,
    };
    try {
      const res = await fetch("http://localhost:3000/api/v1/events/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || `Error ${res.status}`);
      toast.success("Event summary submitted successfully!");
      setShowSummaryForm(false);
    } catch (err) {
      toast.error(`Error submitting summary: ${err.message}`);
    }
  };

  // Approve/Reject proof functions
  const handleApproveProof = async () => {
    if (!reviewTask) return;
    try {
      const res = await fetch(
        `http://localhost:3000/api/v1/events/proof/approve/${reviewTask._id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || `Error ${res.status}`);
      toast.success("Proof approved! Task marked as completed.");
      setShowReviewModal(false);
      const updatedRes = await fetch(`http://localhost:3000/api/v1/events/${slug}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      if (updatedRes.ok) {
        const updatedData = await updatedRes.json();
        setEvent(updatedData);
      }
    } catch (err) {
      toast.error(`Error approving proof: ${err.message}`);
    }
  };
  const handleRejectProof = async () => {
    if (!reviewTask) return;
    try {
      const res = await fetch(
        `http://localhost:3000/api/v1/events/proof/reject/${reviewTask._id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || `Error ${res.status}`);
      toast.success("Proof rejected. Please ask the volunteer to resubmit.");
      setShowReviewModal(false);
    } catch (err) {
      toast.error(`Error rejecting proof: ${err.message}`);
    }
  };
  const openReviewModal = (task) => {
    setReviewTask(task);
    setShowReviewModal(true);
  };

  // Open Task Updates Modal and fetch updates for a task
  const openTaskUpdatesModal = async (task) => {
    setTaskUpdates([]);
    setTaskUpdatesError(null);
    setTaskUpdatesLoading(true);
    try {
      const res = await fetch(`http://localhost:3000/api/v1/events/taskUpdates/${task._id}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
      const data = await res.json();
      setTaskUpdates(data);
    } catch (err) {
      setTaskUpdatesError(err.message);
    } finally {
      setTaskUpdatesLoading(false);
      setShowTaskUpdatesModal(true);
    }
  };

  // New: Generate Feedback Summary
  const handleGenerateFeedbackSummary = async () => {
    setSummaryLoading(true);
    setSummaryError(null);
    try {
      const res = await fetch(`http://localhost:3000/api/v1/analyze/${event._id}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
      const data = await res.json();
      setGeneratedSummary(data);
      setShowGeneratedSummaryModal(true);
    } catch (err) {
      setSummaryError(err.message);
      toast.error(`Error generating summary: ${err.message}`);
    } finally {
      setSummaryLoading(false);
    }
  };

  // Toggle collapsible panels
  const togglePosition = (positionId) => {
    setExpandedPositions((prev) => ({ ...prev, [positionId]: !prev[positionId] }));
  };
  const toggleVolunteer = (volunteerId) => {
    setExpandedVolunteers((prev) => ({ ...prev, [volunteerId]: !prev[volunteerId] }));
  };

  if (loading)
    return <p className="text-center text-gray-500">Loading event details...</p>;
  if (error)
    return <p className="text-center text-red-500">Error: {error}</p>;
  if (!event)
    return <p className="text-center text-gray-500">No event data available.</p>;

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-2xl mt-5 shadow-lg p-8 relative border border-gray-200">
      <h1 className="text-3xl font-bold text-gray-900 mb-5">{event.title}</h1>
      {event.image && (
        <img src={event.image} alt={event.title} className="w-full h-64 object-cover rounded-xl mb-5 shadow" />
      )}
      <div className="text-gray-700 mb-5 leading-relaxed" dangerouslySetInnerHTML={{ __html: event.content }} />
      <div className="bg-gray-100 p-5 rounded-xl mb-5 shadow-sm">
        <p className="text-lg font-semibold">📍 Location: {event.eventLocation}</p>
        <p className="text-gray-600">📅 Start: {new Date(event.eventStartDate).toLocaleDateString()}</p>
        <p className="text-gray-600">📅 End: {new Date(event.eventEndDate).toLocaleDateString()}</p>
      </div>
      {/* Top Buttons */}
      <div className="absolute top-6 right-6 flex space-x-2">
        <button onClick={toggleFeedback} className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-lg transition duration-200 shadow-md">
          {feedbackVisible ? "Hide Feedback" : "View Feedback"}
        </button>
        <button onClick={toggleVisualDisplay} className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition duration-200 shadow-md">
          View Visual Summary
        </button>
        <button onClick={handleGenerateFeedbackSummary} className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg transition duration-200 shadow-md">
          {summaryLoading ? "Generating..." : "Generate Feedback Summary"}
        </button>
      </div>
      {/* Generated Feedback Summary Modal */}
      {showGeneratedSummaryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          {/* 
      The main container for the modal content: 
      - max-w-xl for a moderate width
      - max-h-[70vh] to limit the vertical size
      - overflow-y-auto to allow scrolling if content is long 
    */}
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-xl max-h-[70vh] overflow-y-auto relative">
            <button
              onClick={() => setShowGeneratedSummaryModal(false)}
              className="absolute top-4 right-4 bg-gray-300 hover:bg-gray-400 rounded-full p-2"
            >
              ✖
            </button>
            <h3 className="text-xl font-bold mb-4">Feedback Summary Report</h3>

            {/* Use your RenderGeneratedSummary component here */}
            <RenderGeneratedSummary summary={generatedSummary} />
          </div>
        </div>
      )}


      {/* Feedback Modal */}
      {feedbackVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-lg w-full relative">
            <button onClick={toggleFeedback} className="absolute top-4 right-4 bg-gray-300 hover:bg-gray-400 rounded-full p-2">✖</button>
            <h3 className="text-xl font-bold mb-4">💬 Event Feedback</h3>
            <div className="max-h-64 overflow-y-auto space-y-4">
              {feedbackLoading ? (
                <p className="text-gray-500">Loading feedback...</p>
              ) : feedbackError ? (
                <p className="text-red-500">Error: {feedbackError}</p>
              ) : feedbacks.length > 0 ? (
                feedbacks.slice(0, 5).map((fb) => (
                  <div key={fb._id} className="p-4 border rounded bg-gray-50 shadow-sm">
                    <p className="font-semibold">⭐ Rating: {fb.rating} / 10</p>
                    <p>🎉 Enjoyed: {fb.enjoyed ? "Yes" : "No"}</p>
                    {fb.comments && <p className="text-sm text-gray-700">💬 {fb.comments}</p>}
                    {fb.suggestions && <p className="text-sm text-gray-700">💡 {fb.suggestions}</p>}
                    <p className="text-xs text-gray-500 mt-1">{new Date(fb.createdAt).toLocaleDateString()}</p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No feedback available for this event.</p>
              )}
            </div>
          </div>
        </div>
      )}
      {/* Visual Summary Modal */}
      {showVisualDisplay && (
        <div ref={pdfRef} className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-lg w-full relative">
            <button onClick={toggleVisualDisplay} className="absolute top-4 right-4 bg-gray-300 hover:bg-gray-400 rounded-full p-2">✖</button>
            <h3 className="text-xl font-bold mb-4">📊 Feedback Summary</h3>
            {summary ? (
              <div className="mb-5">
                <p>Total Reviews: <span className="font-semibold">{summary.total}</span></p>
                <p>Average Rating: <span className="font-semibold">{summary.averageRating} / 10</span></p>
                <p>Positive Reviews: <span className="font-semibold">{summary.positiveCount}</span></p>
                <p>Negative Reviews: <span className="font-semibold">{summary.negativeCount}</span></p>
              </div>
            ) : (
              <p>No summary available.</p>
            )}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2">Review Breakdown</h4>
                <div className="h-40">
                  <Bar data={barData} options={{ responsive: true, maintainAspectRatio: false }} />
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Rating Distribution</h4>
                <div className="h-40">
                  <Pie data={pieData} options={{ responsive: true, maintainAspectRatio: false }} />
                </div>
              </div>
            </div>
            <button onClick={handleDownloadVisual} className="mt-5 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition duration-200">
              ⬇️ Download Visual Summary as Image
            </button>
          </div>
        </div>
      )}
      {/* Collapsible Volunteering Positions */}
      {event.volunteeringPositions?.length > 0 && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">🙌 Volunteering Positions</h2>
          {event.volunteeringPositions.map((position) => (
            <div key={position._id} className="mb-4 border rounded shadow-sm">
              <div className="flex justify-between items-center bg-gray-200 p-3 cursor-pointer" onClick={() => togglePosition(position._id)}>
                <p className="font-semibold">{position.title}</p>
                <span className="text-xl">{expandedPositions[position._id] ? "▲" : "▼"}</span>
              </div>
              {expandedPositions[position._id] && (
                <div className="p-3">
                  <p className="text-sm text-gray-700 mb-2">
                    Slots available: <span className="font-medium">{position.slots}</span>
                  </p>
                  <p className="text-sm text-gray-700 mb-2">
                    Positions Allocated: <span className="font-medium">{position.registeredUsers?.length || 0}</span>
                  </p>
                  {position.registeredUsers && position.registeredUsers.length > 0 ? (
                    <div>
                      <p className="font-medium mb-2">Registered Users:</p>
                      <ul className="space-y-2">
                        {position.registeredUsers.map((volunteer) => (
                          <li key={volunteer._id} className="border rounded p-2">
                            <div className="flex justify-between items-center cursor-pointer" onClick={() => toggleVolunteer(volunteer._id)}>
                              <span className="font-semibold">{volunteer.name} ({volunteer.email})</span>
                              <span className="text-lg">{expandedVolunteers[volunteer._id] ? "▲" : "▼"}</span>
                            </div>
                            {expandedVolunteers[volunteer._id] && (
                              <div className="mt-2 ml-4">
                                {volunteer.tasks && volunteer.tasks.length > 0 ? (
                                  <ul className="space-y-2">
                                    {volunteer.tasks.map((task, idx) => (
                                      <li key={idx} className="border p-2 rounded flex flex-col sm:flex-row sm:items-center sm:justify-between">
                                        <div>
                                          <p className="font-semibold">Task:</p>
                                          <p>{task.description}</p>
                                          <p className="text-sm italic">
                                            {task.status === "completed"
                                              ? "Task Completed"
                                              : task.proofSubmitted
                                                ? "Proof Submitted"
                                                : "Pending"}
                                          </p>
                                        </div>
                                        <div className="flex gap-2 mt-2 sm:mt-0">
                                          {task.proofSubmitted && (
                                            <button onClick={() => openReviewModal(task)} className="bg-blue-600 hover:bg-blue-700 text-white py-1 px-2 rounded text-xs">
                                              {task.status === "completed" ? "View Task Proof" : "Review Task Proof"}
                                            </button>
                                          )}
                                          <button onClick={() => openTaskUpdatesModal(task)} className="bg-gray-600 hover:bg-gray-700 text-white py-1 px-2 rounded text-xs">
                                            View Task Updates
                                          </button>
                                        </div>
                                      </li>
                                    ))}
                                  </ul>
                                ) : (
                                  <p className="text-gray-500 text-sm">No tasks assigned.</p>
                                )}
                              </div>
                            )}
                            {/* Single Assign Task Button per volunteer */}
                            <button onClick={() => openTaskModal(volunteer)} className="mt-2 bg-purple-600 hover:bg-purple-700 text-white py-1 px-2 rounded text-xs">
                              Assign Task
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">No registrations for this position yet.</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      <p className="text-gray-500 mt-4 text-sm">Created by: {event.createdBy?.name || "Unknown"}</p>
      <div className="mt-6">
        {/* If event.isSummaryPublished is true, disable the button and change the text */}
        <button
          onClick={() => setShowSummaryForm(true)}
          disabled={event.isSummaryPublished} // Disables if summary is published
          className={`py-2 px-4 rounded text-white transition-colors ${event.isSummaryPublished
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-yellow-600 hover:bg-yellow-700"
            }`}
        >
          {event.isSummaryPublished ? "Summary Already Published" : "Submit Event Summary"}
        </button>
      </div>
      {/* Task Assignment Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-11/12 max-w-md">
            <h2 className="text-xl font-bold mb-4">Assign Tasks for {selectedVolunteer && selectedVolunteer.name}</h2>
            {taskInputs.map((task, index) => (
              <input key={index} type="text" value={task} onChange={(e) => handleTaskInputChange(index, e.target.value)} placeholder="Enter task description" className="w-full mb-2 p-2 border rounded" />
            ))}
            <button onClick={addTaskField} className="bg-blue-600 hover:bg-blue-700 text-white py-1 px-2 rounded text-sm mb-4">
              Add Another Task
            </button>
            <div className="flex gap-4">
              <button onClick={handleAssignTasks} className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg" disabled={assignLoading}>
                {assignLoading ? "Assigning..." : "Assign Tasks"}
              </button>
              <button onClick={closeTaskModal} className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Event Summary Form Modal */}
      {showSummaryForm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 overflow-auto">
          <div className="bg-white rounded-lg shadow-lg p-6 w-11/12 max-w-lg">
            <h2 className="text-xl font-bold mb-4">Submit Event Summary</h2>
            {event.volunteeringPositions && event.volunteeringPositions.length > 0 && (
              <div className="mb-4">
                <h3 className="text-lg font-semibold mb-2">Volunteering Positions</h3>
                <ul className="list-disc pl-5 text-sm text-gray-700">
                  {event.volunteeringPositions.map((pos) => (
                    <li key={pos._id}>
                      {pos.title}: {pos.registeredUsers?.length || 0} allocated out of {pos.slots} slots
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <form onSubmit={handleSubmitSummary} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Event Name</label>
                <input type="text" name="eventName" value={summaryData.eventName} onChange={handleSummaryChange} className="mt-1 block w-full p-2 border rounded" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Location</label>
                <input type="text" name="location" value={summaryData.location} onChange={handleSummaryChange} className="mt-1 block w-full p-2 border rounded" required />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700">Start Date</label>
                  <input type="date" name="startDate" value={summaryData.startDate} onChange={handleSummaryChange} className="mt-1 block w-full p-2 border rounded" required />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700">End Date</label>
                  <input type="date" name="endDate" value={summaryData.endDate} onChange={handleSummaryChange} className="mt-1 block w-full p-2 border rounded" required />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Volunteers Registered</label>
                <input type="number" name="volunteersRegistered" value={summaryData.volunteersRegistered} onChange={handleSummaryChange} className="mt-1 block w-full p-2 border rounded" required readOnly />
              </div>
              {/* File Upload Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Upload File (Optional)</label>
                <div className="flex items-center gap-2 mt-1">
                  <input type="file" onChange={handleFileChange} className="block w-full" />
                  <button type="button" onClick={handleUploadFile} className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded" disabled={fileUploadLoading}>
                    {fileUploadLoading ? "Uploading..." : "Add File"}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Upload Event Images (Optional)</label>
                <div className="flex items-center gap-2 mt-1">
                  <input type="file" multiple onChange={handleImagesChange} className="block w-full" />
                  <button type="button" onClick={handleUploadImages} className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded" disabled={imagesUploadLoading}>
                    {imagesUploadLoading ? "Uploading..." : "Add Images"}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">How was the feel of the event?</label>
                <textarea name="organizerFeel" value={summaryData.organizerFeel} onChange={handleSummaryChange} className="mt-1 block w-full p-2 border rounded" rows="3" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Did you enjoy organising the event?</label>
                <textarea name="organizerEnjoyment" value={summaryData.organizerEnjoyment} onChange={handleSummaryChange} className="mt-1 block w-full p-2 border rounded" rows="3" required />
              </div>
              <div className="flex gap-4">
                <button type="submit" className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded">
                  Submit
                </button>
                <button type="button" onClick={() => setShowSummaryForm(false)} className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Review Proof Modal */}
      {showReviewModal && reviewTask && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 w-11/12 max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {reviewTask.status === "completed" ? "View Task Proof" : "Review Task Proof"}
            </h2>
            <p className="mb-2">
              <span className="font-semibold">Task:</span> {reviewTask.description}
            </p>
            {reviewTask.proofMessage && (
              <div className="mb-4">
                <p className="font-semibold">Proof Message:</p>
                <p className="border p-2 rounded">{reviewTask.proofMessage}</p>
              </div>
            )}
            {reviewTask.proofImages && reviewTask.proofImages.length > 0 && (
              <div className="mb-4">
                <p className="font-semibold mb-2">Proof Images:</p>
                <div className="flex flex-wrap gap-2">
                  {reviewTask.proofImages.map((img, idx) => (
                    <img key={idx} src={img} alt={`Proof ${idx + 1}`} className="w-20 h-20 object-cover rounded" />
                  ))}
                </div>
              </div>
            )}
            <div className="flex gap-4">
              {reviewTask.status !== "completed" ? (
                <>
                  <button onClick={handleApproveProof} className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg">
                    Approve
                  </button>
                  <button onClick={handleRejectProof} className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg">
                    Reject
                  </button>
                </>
              ) : null}
              <button onClick={() => setShowReviewModal(false)} className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Task Updates Modal */}
      {showTaskUpdatesModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-2xl shadow-lg p-6 w-11/12 max-w-md">
            <h2 className="text-xl font-bold mb-4">Task Updates</h2>
            {taskUpdatesLoading ? (
              <p className="text-gray-500">Loading updates...</p>
            ) : taskUpdatesError ? (
              <p className="text-red-500">Error: {taskUpdatesError}</p>
            ) : taskUpdates.length > 0 ? (
              <ul className="space-y-3">
                {taskUpdates.map((update, idx) => (
                  <li key={idx} className="p-3 border rounded">
                    <p className="font-semibold">{update.title}</p>
                    <p>{update.content}</p>
                    <p className="text-xs text-gray-500">{new Date(update.createdAt).toLocaleDateString()}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No updates found for this task.</p>
            )}
            <button onClick={() => setShowTaskUpdatesModal(false)} className="mt-4 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded">
              Close
            </button>
          </div>
        </div>
      )}
      <ToastContainer />
      <style jsx global>{`
        .goog-te-combo {
          padding: 0.5rem 1rem;
          background-color: #007bff;
          color: #ffffff;
          border: none;
          border-radius: 0.375rem;
          font-size: 0.875rem;
          font-weight: 500;
          width: 100%;
          max-width: 150px;
          cursor: pointer;
          transition: background-color 0.2s ease-in-out;
          -webkit-appearance: none;
          -moz-appearance: none;
          appearance: none;
        }
        .goog-te-combo:hover {
          background-color: #0056b3;
        }
        .goog-te-combo:focus {
          outline: none;
          box-shadow: 0 0 0 2px #ffffff, 0 0 0 4px #007bff;
        }
        .goog-logo-link {
          display: none !important;
        }
        .goog-te-gadget {
          color: transparent !important;
          font-size: 0 !important;
        }
        @media (prefers-color-scheme: dark) {
          .goog-te-combo {
            background-color: #0056b3;
            color: #ffffff;
          }
          .goog-te-combo:hover {
            background-color: #003d82;
          }
          .goog-te-combo:focus {
            box-shadow: 0 0 0 2px #ffffff, 0 0 0 4px #0056b3;
          }
        }
        @media (forced-colors: active) {
          .goog-te-combo {
            border: 2px solid currentColor;
          }
        }
        @media (max-width: 768px) {
          .goog-te-combo {
            max-width: none;
          }
        }
      `}</style>
    </div>
  );
}

export default EventOrganiser;
