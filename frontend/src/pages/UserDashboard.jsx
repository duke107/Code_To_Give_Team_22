import React, { useEffect, useState } from "react";
import { Pie } from "react-chartjs-2";
import { Chart, ArcElement, Tooltip, Legend } from "chart.js";
import { useSelector } from "react-redux";

Chart.register(ArcElement, Tooltip, Legend);

const Dashboard = () => {
  const [events, setEvents] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [error, setError] = useState(null);

  // Get logged-in user from redux state
  const { user } = useSelector((state) => state.auth);

  // Fetch all events from the backend
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch("http://localhost:3000/api/v1/events/getEventsUser", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });
        if (!res.ok) {
          throw new Error("Failed to fetch events");
        }
        const data = await res.json();
        setEvents(data.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoadingEvents(false);
      }
    };
    fetchEvents();
  }, []);

  // Fetch all tasks from the backend
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await fetch("http://localhost:3000/api/v1/events/getTasksUser", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });
        if (!res.ok) {
          throw new Error("Failed to fetch tasks");
        }
        const data = await res.json();
        setTasks(data.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoadingTasks(false);
      }
    };
    fetchTasks();
  }, []);

  if (loadingEvents || loadingTasks) {
    return <p className="text-center">Loading dashboard data...</p>;
  }

  if (error) {
    return <p className="text-center text-red-500">Error: {error}</p>;
  }

  // Get the array of registered event IDs for the current user.
  // We assume user.events is an array of objects { eventId, ... }
  const registeredEventIds = user.events?.map((e) =>
    e.eventId.toString()
  ) || [];

  // Filter events to only those the current user is registered in.
  const registeredEvents = events.filter((event) =>
    registeredEventIds.includes(event._id.toString())
  );

  if (registeredEvents.length === 0) {
    return (
      <p className="text-center text-gray-500">
        You are not registered in any events yet.
      </p>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h2 className="text-3xl font-bold text-center mb-6">Volunteer Dashboard</h2>
      {registeredEvents.map((event) => {
        // Filter tasks that belong to this event.
        // Optionally, you can further filter tasks assigned to the current user.
        const eventTasks = tasks.filter(
          (task) =>
            task.event._id.toString() === event._id.toString() &&
            task.assignedTo._id.toString() === user._id.toString()
        );
        const completedTasks = eventTasks.filter(
          (task) => task.status === "completed"
        ).length;
        const totalTasks = eventTasks.length;
        const pendingTasks = totalTasks - completedTasks;

        // Data for Pie Chart
        const chartData = {
          labels: ["Completed", "Pending"],
          datasets: [
            {
              data: [completedTasks, pendingTasks],
              backgroundColor: ["#4CAF50", "#FF5733"],
            },
          ],
        };

        return (
          <div key={event._id} className="bg-white shadow-lg rounded-lg p-6 mb-6">
            <h3 className="text-2xl font-semibold mb-2">{event.title}</h3>
            <p className="text-gray-600 mb-4">
              {new Date(event.eventStartDate).toLocaleDateString()} -{" "}
              {new Date(event.eventEndDate).toLocaleDateString()}
            </p>

            <div className="flex flex-col md:flex-row gap-6 items-center">
              {/* Task List */}
              <div className="flex-1">
                <h4 className="font-semibold text-xl mb-3">Your Tasks:</h4>
                {totalTasks === 0 ? (
                  <p className="text-gray-500">No tasks assigned for this event.</p>
                ) : (
                  <ul className="list-disc pl-5">
                    {eventTasks.map((task) => (
                      <li
                        key={task._id}
                        className={`text-lg ${
                          task.status === "completed"
                            ? "text-green-600"
                            : "text-red-500"
                        }`}
                      >
                        {task.description}{" "}
                        {task.status === "completed" ? "✔️" : "❌"}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Pie Chart and Summary */}
              <div className="flex flex-col items-center">
                <div className="w-48 h-48 mb-4">
                  <Pie data={chartData} />
                </div>
                <div className="text-center">
                  <p className="text-lg">
                    Completed: <span className="font-bold">{completedTasks}</span>
                  </p>
                  <p className="text-lg">
                    Pending: <span className="font-bold">{pendingTasks}</span>
                  </p>
                  <p className="text-lg">
                    Total: <span className="font-bold">{totalTasks}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Dashboard;
