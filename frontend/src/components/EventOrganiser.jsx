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

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

function EventOrganiser() {
  const { slug } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for task assignment modal
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedVolunteer, setSelectedVolunteer] = useState(null);
  const [taskInputs, setTaskInputs] = useState(['']); // Array of task description strings

  // State for feedback dropdown
  const [feedbackVisible, setFeedbackVisible] = useState(false);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [feedbackError, setFeedbackError] = useState(null);
  const [feedbacks, setFeedbacks] = useState([]);

  // New state for visual display summary
  const [showVisualDisplay, setShowVisualDisplay] = useState(false);

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

  // Toggle the feedback dropdown panel
  const toggleFeedback = () => {
    if (!feedbackVisible) {
      fetchFeedbacks();
    }
    if (feedbackVisible) {
      setShowVisualDisplay(false);
    }
    setFeedbackVisible(!feedbackVisible);
  };

  // Handler to toggle the visual display of feedback summary
  const toggleVisualDisplay = () => {
    setShowVisualDisplay(!showVisualDisplay);
  };

  // Function to download the feedback summary as a PDF, splitting into multiple pages if needed.
  const handleDownloadPDF = async () => {
    if (pdfRef.current) {
      const canvas = await html2canvas(pdfRef.current, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      // Calculate the scaled image height in the PDF
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      // Add the first page
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;

      // While there is still content left to display, add a new page and draw the remaining portion
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
      }

      pdf.save('feedback-summary.pdf');
    }
  };

  // Compute summary details based on feedbacks
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

  // Prepare data for Bar Chart (Positive vs Negative Reviews)
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

  // Prepare data for Pie Chart (Rating Distribution)
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

  // Opens the task assignment modal for a specific volunteer
  const openTaskModal = (volunteer) => {
    setSelectedVolunteer(volunteer);
    setTaskInputs(['']); // Start with one empty task field
    setShowTaskModal(true);
  };

  const closeTaskModal = () => {
    setShowTaskModal(false);
    setSelectedVolunteer(null);
  };

  // Handler to update a task input field
  const handleTaskInputChange = (index, value) => {
    const newTasks = [...taskInputs];
    newTasks[index] = value;
    setTaskInputs(newTasks);
  };

  // Adds a new empty task input field
  const addTaskField = () => {
    setTaskInputs([...taskInputs, '']);
  };

  // When "Assign Tasks" is clicked - call the backend assignTask endpoint
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
      
      // Re-fetch event details to get updated tasks from the backend
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

  if (loading) return <p className="text-center text-gray-500">Loading event details...</p>;
  if (error) return <p className="text-center text-red-500">Error: {error}</p>;
  if (!event) return <p className="text-center text-gray-500">No event data available.</p>;

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

      {/* Feedback Dropdown Button */}
      <div className="absolute top-6 right-6">
        <button
          onClick={toggleFeedback}
          className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded"
        >
          {feedbackVisible ? 'Hide Feedback' : 'View Feedback'}
        </button>
        {feedbackVisible && (
          <div className="mt-2 w-80 bg-white border border-gray-200 rounded shadow-lg p-4">
            {feedbackLoading ? (
              <p className="text-gray-500">Loading feedback...</p>
            ) : feedbackError ? (
              <p className="text-red-500">Error: {feedbackError}</p>
            ) : (
              <>
                {feedbacks.length > 0 ? (
                  <>
                    <ul className="space-y-3">
                      {feedbacks.map((fb) => (
                        <li key={fb._id} className="border-b pb-2">
                          <p className="text-sm font-semibold">Rating: {fb.rating} / 10</p>
                          <p className="text-sm">Enjoyed: {fb.enjoyed ? 'Yes' : 'No'}</p>
                          {fb.comments && (
                            <p className="text-sm text-gray-700">Comments: {fb.comments}</p>
                          )}
                          {fb.suggestions && (
                            <p className="text-sm text-gray-700">Suggestions: {fb.suggestions}</p>
                          )}
                          <p className="text-xs text-gray-500">
                            {new Date(fb.createdAt).toLocaleDateString()}
                          </p>
                        </li>
                      ))}
                    </ul>
                    <button
                      onClick={toggleVisualDisplay}
                      className="mt-4 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded"
                    >
                      {showVisualDisplay ? 'Hide Visual Summary' : 'Show Visual Summary'}
                    </button>
                  </>
                ) : (
                  <p className="text-gray-500">No feedback available for this event.</p>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {showVisualDisplay && feedbacks.length > 0 && (
        <div ref={pdfRef} className="mt-4 bg-gray-50 border border-gray-200 rounded p-4">
          <h3 className="text-lg font-bold mb-2">Feedback Summary</h3>
          {summary ? (
            <div className="mb-4">
              <p>Total Reviews: {summary.total}</p>
              <p>Average Rating: {summary.averageRating} / 10</p>
              <p>Positive Reviews: {summary.positiveCount}</p>
              <p>Negative Reviews: {summary.negativeCount}</p>
            </div>
          ) : (
            <p>No summary available.</p>
          )}

          {/* Bar Chart: Positive vs Negative */}
          <div className="mb-6">
            <h4 className="font-semibold mb-2">Review Breakdown</h4>
            <div style={{ height: '150px' }}>
              <Bar data={barData} options={{ responsive: true, maintainAspectRatio: false }} />
            </div>
          </div>

          {/* Pie Chart: Rating Distribution */}
          <div className="mb-6">
            <h4 className="font-semibold mb-2">Rating Distribution</h4>
            <div style={{ height: '150px' }}>
              <Pie data={pieData} options={{ responsive: true, maintainAspectRatio: false }} />
            </div>
          </div>

          {/* Visual display of each feedback */}
          <div className="grid grid-cols-1 gap-4">
            {feedbacks.map((fb) => (
              <div key={fb._id} className="p-4 border rounded bg-white shadow-sm">
                <p className="font-semibold">Rating: {fb.rating} / 10</p>
                <p>Enjoyed: {fb.enjoyed ? 'Yes' : 'No'}</p>
                {fb.comments && <p className="mt-1">Comments: {fb.comments}</p>}
                {fb.suggestions && <p className="mt-1">Suggestions: {fb.suggestions}</p>}
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(fb.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
          {/* Download as PDF Button */}
          <button
            onClick={handleDownloadPDF}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
          >
            Download as PDF
          </button>
        </div>
      )}

      {event.volunteeringPositions?.length > 0 && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">🙌 Volunteering Positions</h2>
          {event.volunteeringPositions.map((position) => (
            <div key={position._id} className="mb-4 p-4 border rounded">
              <p className="font-semibold">{position.title}</p>
              <p className="text-sm text-gray-600 mb-2">Slots available: {position.slots}</p>
              {position.registeredUsers && position.registeredUsers.length > 0 ? (
                <div>
                  <p className="font-medium">Registered Users:</p>
                  <ul className="list-disc list-inside text-gray-700">
                    {position.registeredUsers.map((volunteer, idx) => (
                      <li key={idx} className="mb-2">
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
                      </li>
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

      {/* Task Assignment Modal */}
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
    </div>
  );
}

export default EventOrganiser;
