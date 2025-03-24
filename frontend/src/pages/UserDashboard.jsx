import React from "react";
import { Pie } from "react-chartjs-2";
import { Chart, ArcElement, Tooltip, Legend } from "chart.js";

const events = [
  {
    name: "Beach Cleanup",
    date: "March 15, 2025",
    tasks: [
      { name: "Collect Plastic Waste", completed: true },
      { name: "Sort Recyclables", completed: false },
      { name: "Distribute Gloves", completed: true },
    ],
  },
  {
    name: "Food Drive",
    date: "April 10, 2025",
    tasks: [
      { name: "Pack Food Kits", completed: true },
      { name: "Distribute Food", completed: true },
      { name: "Collect Donations", completed: false },
    ],
  },
];

Chart.register(ArcElement, Tooltip, Legend);

const VolunteerDashboard = () => {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold text-center mb-4">Volunteer Dashboard</h2>

      {events.length === 0 ? (
        <p className="text-center text-gray-500">No events participated yet.</p>
      ) : (
        events.map((event, index) => {
          const completedTasks = event.tasks.filter(task => task.completed).length;
          const totalTasks = event.tasks.length;
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
            <div key={index} className="bg-white shadow-lg rounded-lg p-4 mb-6">
              <h3 className="text-lg font-semibold">{event.name}</h3>
              <p className="text-gray-600">{event.date}</p>

              <div className="flex flex-col md:flex-row items-center gap-4 mt-4">
                {/* Task List */}
                <div className="flex-1">
                  <h4 className="font-semibold mb-2">Tasks:</h4>
                  <ul className="list-disc pl-5">
                    {event.tasks.map((task, i) => (
                      <li key={i} className={`text-sm ${task.completed ? "text-green-600" : "text-red-500"}`}>
                        {task.name} {task.completed ? "✔️" : "❌"}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Pie Chart */}
                <div className="w-40 h-40">
                  <Pie data={chartData} />
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

export default VolunteerDashboard;
