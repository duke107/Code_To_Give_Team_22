import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

function EventOrganiser() {
  const { slug } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for task assignment modal
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedVolunteer, setSelectedVolunteer] = useState(null);
  const [taskInputs, setTaskInputs] = useState(['']); // Array of task description strings

  // Fetch event details including volunteer tasks from the backend
  useEffect(() => {
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
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEventDetails();
  }, [slug]);

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

    // Filter out any empty tasks and map to objects with description and a default status "pending"
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
        credentials: 'include'
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
    <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-6">
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
                          {/* Display tasks that come from the backend */}
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
                          {/* Assign Task Button */}
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
