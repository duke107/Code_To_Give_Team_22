import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
// Import Firebase Storage functions
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { app } from '../firebase';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useSelector } from 'react-redux';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

function EventOrganiser() {
  const { slug } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

   const {
          user
      } = useSelector(state => state.auth);

  // Loader states for file and images upload
  const [fileUploadLoading, setFileUploadLoading] = useState(false);
  const [imagesUploadLoading, setImagesUploadLoading] = useState(false);

  // State for task assignment modal
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedVolunteer, setSelectedVolunteer] = useState(null);
  const [taskInputs, setTaskInputs] = useState(['']);

  // State for feedback dropdown
  const [feedbackVisible, setFeedbackVisible] = useState(false);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [feedbackError, setFeedbackError] = useState(null);
  const [feedbacks, setFeedbacks] = useState([]);

  // State for visual display summary
  const [showVisualDisplay, setShowVisualDisplay] = useState(false);

  // State for event summary form modal
  const [showSummaryForm, setShowSummaryForm] = useState(false);
  const [summaryData, setSummaryData] = useState({
    eventName: '',
    location: '',
    startDate: '',
    endDate: '',
    positionsAllocated: 0,
    totalPositions: 0,
    volunteersRegistered: 0,
    organizerFeel: '',
    organizerEnjoyment: '',
    fileUrl: '', // for a single file (if needed)
    eventImages: [], // to hold multiple image URLs
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedImages, setSelectedImages] = useState([]); // for multiple images

  // Ref for PDF content
  const pdfRef = useRef();

  // Fetch event details including volunteer tasks from the backend
  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        const res = await fetch(`http://localhost:3000/api/v1/events/${slug}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        });

        if (!res.ok) {
          throw new Error(`Error ${res.status}: ${res.statusText}`);
        }

        const data = await res.json();
        setEvent(data);
        // Pre-fill summary form data
        setSummaryData({
          eventName: data.title || '',
          location: data.eventLocation || '',
          startDate: data.eventStartDate ? new Date(data.eventStartDate).toISOString().split('T')[0] : '',
          endDate: data.eventEndDate ? new Date(data.eventEndDate).toISOString().split('T')[0] : '',
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
          organizerFeel: '',
          organizerEnjoyment: '',
          fileUrl: '',
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

  // Function to fetch feedback for the event
  const fetchFeedbacks = async () => {
    setFeedbackLoading(true);
    setFeedbackError(null);
    try {
      const res = await fetch(`http://localhost:3000/api/v1/events/feedbacks?eventId=${event._id}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
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

  // Toggle feedback dropdown
  const toggleFeedback = () => {
    if (!feedbackVisible) {
      fetchFeedbacks();
    }
    if (feedbackVisible) {
      setShowVisualDisplay(false);
    }
    setFeedbackVisible(!feedbackVisible);
  };

  // Toggle visual summary display
  const toggleVisualDisplay = () => {
    setShowVisualDisplay(!showVisualDisplay);
  };

  // Function to download feedback summary as PDF
  const handleDownloadPDF = async () => {
    if (pdfRef.current) {
      const canvas = await html2canvas(pdfRef.current, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
      }
      pdf.save('feedback-summary.pdf');
    }
  };

  // Compute feedback summary details
  const getFeedbackSummary = () => {
    if (!feedbacks || feedbacks.length === 0) return null;
    const total = feedbacks.length;
    const averageRating = (
      feedbacks.reduce((acc, cur) => acc + Number(cur.rating), 0) / total
    ).toFixed(1);
    const positiveCount = feedbacks.filter((fb) => fb.enjoyed).length;
    const negativeCount = total - positiveCount;
    return { total, averageRating, positiveCount, negativeCount };
  };

  const summary = getFeedbackSummary();
  const barData = {
    labels: ['Positive', 'Negative'],
    datasets: [
      {
        label: 'Review Count',
        data: summary ? [summary.positiveCount, summary.negativeCount] : [0, 0],
        backgroundColor: ['#36d399', '#f87272'],
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
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#9966FF',
          '#FF9F40',
          '#E7E9ED',
          '#7CB342',
          '#D81B60',
          '#8E24AA',
        ],
      },
    ],
  };

  // Task assignment modal functions
  const openTaskModal = (volunteer) => {
    setSelectedVolunteer(volunteer);
    setTaskInputs(['']);
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
    setTaskInputs([...taskInputs, '']);
  };

  const handleAssignTasks = async () => {
    if (!selectedVolunteer) return;
    const tasksToAssign = taskInputs
      .map((desc) => ({ description: desc.trim(), status: 'pending' }))
      .filter((task) => task.description !== '');
    if (tasksToAssign.length === 0) {
      alert('Please enter at least one task.');
      return;
    }
    try {
      const res = await fetch('http://localhost:3000/api/v1/events/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
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
      // Re-fetch event details
      const updatedRes = await fetch(`http://localhost:3000/api/v1/events/${slug}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      if (updatedRes.ok) {
        const updatedData = await updatedRes.json();
        setEvent(updatedData);
      }
      closeTaskModal();
    } catch (err) {
      alert(`Error assigning tasks: ${err.message}`);
    }
  };

  const handleSummaryChange = (e) => {
    const { name, value } = e.target;
    setSummaryData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  // File upload function with loader and toast
  const handleUploadFile = async () => {
    if (!selectedFile) {
      toast.error("Please select a file");
      return;
    }
    setFileUploadLoading(true);
    try {
      const storage = getStorage(app, "gs://mern-blog-b327f.appspot.com");
      const sanitizedFileName =
        new Date().getTime() + "-" + selectedFile.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const storageRef = ref(storage, sanitizedFileName);
      let metadata = { contentType: selectedFile.type };
      if (!metadata.contentType && /\.pdf$/i.test(selectedFile.name)) {
        metadata.contentType = 'application/pdf';
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

  // Multiple images upload function with loader and toast
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
          new Date().getTime() + "-" + image.name.replace(/[^a-zA-Z0-9.-]/g, '_');
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
    // Assume organiserId is stored in local storage (adjust based on your auth flow)
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
      organiserId, // Send the organiser's ID along with the summary
    };
    
    try {
      const res = await fetch('http://localhost:3000/api/v1/events/summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || `Error ${res.status}`);
      }
      toast.success('Event summary submitted successfully!');
      setShowSummaryForm(false);
    } catch (err) {
      toast.error(`Error submitting summary: ${err.message}`);
    }
  };

  if (loading) return <p className="text-center text-gray-500">Loading event details...</p>;
  if (error) return <p className="text-center text-red-500">Error: {error}</p>;
  if (!event) return <p className="text-center text-gray-500">No event data available.</p>;

  return (
    <div className="max-w-3xl mt-5 mx-auto bg-white rounded-2xl shadow-lg p-6 relative">
      <h1 className="text-3xl font-bold text-gray-900 mb-5">{event.title}</h1>
  
      {event.image && (
        <img
          src={event.image}
          alt={event.title}
          className="w-full h-64 object-cover rounded-xl mb-5 shadow"
        />
      )}
  
      <div className="text-gray-700 mb-5 leading-relaxed" dangerouslySetInnerHTML={{ __html: event.content }} />
  
      <div className="bg-gray-100 p-5 rounded-xl mb-5 shadow-sm">
        <p className="text-lg font-semibold">📍 Location: {event.eventLocation}</p>
        <p className="text-gray-600">📅 Start: {new Date(event.eventStartDate).toLocaleDateString()}</p>
        <p className="text-gray-600">📅 End: {new Date(event.eventEndDate).toLocaleDateString()}</p>
      </div>
  
      {/* Buttons for Feedback & Visual Summary */}
      <div className="absolute top-6 right-6 flex space-x-2">
        <button
          onClick={toggleFeedback}
          className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-lg transition duration-200 shadow-md"
        >
          View Feedback
        </button>
        <button
          onClick={toggleVisualDisplay}
          className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition duration-200 shadow-md"
        >
          View Visual Summary
        </button>
      </div>
  
      {/* Feedback Modal */}
      {feedbackVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-lg w-full relative">
            <button
              onClick={toggleFeedback}
              className="absolute top-4 right-4 bg-gray-300 hover:bg-gray-400 rounded-full p-2"
            >
              ✖
            </button>
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
                    <p>🎉 Enjoyed: {fb.enjoyed ? 'Yes' : 'No'}</p>
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-lg w-full relative">
            <button
              onClick={toggleVisualDisplay}
              className="absolute top-4 right-4 bg-gray-300 hover:bg-gray-400 rounded-full p-2"
            >
              ✖
            </button>
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
  
            {/* Charts */}
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
  
            {/* Download Button */}
            <button
              onClick={handleDownloadPDF}
              className="mt-5 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition duration-200"
            >
              ⬇️ Download as PDF
            </button>
          </div>
        </div>
      )}

      {event.volunteeringPositions?.length > 0 && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">🙌 Volunteering Positions</h2>
          {event.volunteeringPositions.map((position) => (
            <div key={position._id} className="mb-4 p-4 border rounded">
              <p className="font-semibold">{position.title}</p>
              <p className="text-sm text-gray-600 mb-2">Slots available: {position.slots}</p>
              <p className="text-sm text-gray-700 mb-2">
                Positions Allocated: {position.registeredUsers?.length || 0}
              </p>
              {position.registeredUsers && position.registeredUsers.length > 0 ? (
                <div>
                  <p className="font-medium">Registered Users:</p>
                  <ul className="list-disc list-inside text-gray-700">
                    {position.registeredUsers.map((volunteer, idx) => (
                      <ul key={idx} className="mb-2">
                        <div className="flex flex-col gap-1">
                          <span>
                            {volunteer.name} ({volunteer.email})
                          </span>
                          {volunteer.tasks && volunteer.tasks.length > 0 ? (
                            <ul className="mt-1 ml-4 text-sm text-gray-800">
                              {volunteer.tasks.map((task, taskIdx) => (
                                <li key={taskIdx}>
                                  <span className="font-semibold">Task:</span> {task.description} –{' '}
                                  <span className="italic">{task.status}</span>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-gray-500 text-sm">No tasks assigned.</p>
                          )}
                          <button
                            className="self-start bg-purple-600 hover:bg-purple-700 text-white py-1 px-2 rounded text-xs"
                            onClick={() => openTaskModal(volunteer)}
                          >
                            Assign Task
                          </button>
                        </div>
                      </ul>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No registrations for this position yet.</p>
              )}
            </div>
          ))}
        </div>
      )}

      <p className="text-gray-500 mt-4 text-sm">
        Created by: {event.createdBy?.name || "Unknown"}
      </p>

      <div className="mt-6">
        <button
          onClick={() => setShowSummaryForm(true)}
          className="bg-yellow-600 hover:bg-yellow-700 text-white py-2 px-4 rounded"
        >
          Submit Event Summary
        </button>
      </div>

      {showTaskModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-11/12 max-w-md">
            <h2 className="text-xl font-bold mb-4">
              Assign Tasks for {selectedVolunteer && selectedVolunteer.name}
            </h2>
            {taskInputs.map((task, index) => (
              <input
                key={index}
                type="text"
                value={task}
                onChange={(e) => handleTaskInputChange(index, e.target.value)}
                placeholder="Enter task description"
                className="w-full mb-2 p-2 border rounded"
              />
            ))}
            <button
              onClick={addTaskField}
              className="bg-blue-600 hover:bg-blue-700 text-white py-1 px-2 rounded text-sm mb-4"
            >
              Add Another Task
            </button>
            <div className="flex gap-4">
              <button
                onClick={handleAssignTasks}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg"
              >
                Assign Tasks
              </button>
              <button
                onClick={closeTaskModal}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

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
                <input
                  type="text"
                  name="eventName"
                  value={summaryData.eventName}
                  onChange={handleSummaryChange}
                  className="mt-1 block w-full p-2 border rounded"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Location</label>
                <input
                  type="text"
                  name="location"
                  value={summaryData.location}
                  onChange={handleSummaryChange}
                  className="mt-1 block w-full p-2 border rounded"
                  required
                />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700">Start Date</label>
                  <input
                    type="date"
                    name="startDate"
                    value={summaryData.startDate}
                    onChange={handleSummaryChange}
                    className="mt-1 block w-full p-2 border rounded"
                    required
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700">End Date</label>
                  <input
                    type="date"
                    name="endDate"
                    value={summaryData.endDate}
                    onChange={handleSummaryChange}
                    className="mt-1 block w-full p-2 border rounded"
                    required
                  />
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700">Positions Allocated</label>
                  <input
                    type="number"
                    name="positionsAllocated"
                    value={summaryData.positionsAllocated}
                    onChange={handleSummaryChange}
                    className="mt-1 block w-full p-2 border rounded"
                    required
                    readOnly
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700">Total Positions</label>
                  <input
                    type="number"
                    name="totalPositions"
                    value={summaryData.totalPositions}
                    onChange={handleSummaryChange}
                    className="mt-1 block w-full p-2 border rounded"
                    required
                    readOnly
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Volunteers Registered</label>
                <input
                  type="number"
                  name="volunteersRegistered"
                  value={summaryData.volunteersRegistered}
                  onChange={handleSummaryChange}
                  className="mt-1 block w-full p-2 border rounded"
                  required
                  readOnly
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Upload File (Optional)</label>
                <div className="flex items-center gap-2 mt-1">
                  <input type="file" onChange={handleFileChange} className="block w-full" />
                  <button
                    type="button"
                    onClick={handleUploadFile}
                    className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
                    disabled={fileUploadLoading}
                  >
                    {fileUploadLoading ? 'Uploading...' : 'Add File'}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Upload Event Images (Optional)</label>
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="file"
                    multiple
                    onChange={handleImagesChange}
                    className="block w-full"
                  />
                  <button
                    type="button"
                    onClick={handleUploadImages}
                    className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
                    disabled={imagesUploadLoading}
                  >
                    {imagesUploadLoading ? 'Uploading...' : 'Add Images'}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">How was the feel of the event?</label>
                <textarea
                  name="organizerFeel"
                  value={summaryData.organizerFeel}
                  onChange={handleSummaryChange}
                  className="mt-1 block w-full p-2 border rounded"
                  rows="3"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Did you enjoy organising the event?</label>
                <textarea
                  name="organizerEnjoyment"
                  value={summaryData.organizerEnjoyment}
                  onChange={handleSummaryChange}
                  className="mt-1 block w-full p-2 border rounded"
                  rows="3"
                  required
                />
              </div>
              <div className="flex gap-4">
                <button
                  type="submit"
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded"
                >
                  Submit
                </button>
                <button
                  type="button"
                  onClick={() => setShowSummaryForm(false)}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded"
                >
                  Cancel
                </button>
              </div>
            </form>
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
