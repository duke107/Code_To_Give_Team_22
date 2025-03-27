import React from "react";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title } from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title);

const data = {
  labels: ["Students", "Trees", "Volunteers", "Events", "Youth"],
  datasets: [
    {
      label: "Impact Metrics",
      data: [34000, 12000, 18000, 700, 30000],
      backgroundColor: ["#3498db", "#2ecc71", "#f39c12", "#e74c3c"],
    },
  ],
};

const options = {
  responsive: true,
  plugins: { title: { display: true, text: "Impact Overview" } },
};

const AboutGraph = () => {
  return (
    <div className="relative w-full max-w-5xl mx-auto my-12"> {/* Increased width */}
      <Bar data={data} options={options} />
    </div>
  );
};

export default AboutGraph;
