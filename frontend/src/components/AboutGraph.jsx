import React from "react";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title } from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title);

const data = {
  labels: ["Students", "Trees", "Volunteers", "Events"],
  datasets: [
    {
      label: "Impact Metrics",
      data: [5000, 12000, 3000, 700],
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
    <div className="relative w-3/4 mx-auto my-12">
      <Bar data={data} options={options} />
    </div>
  );
};

export default AboutGraph;
