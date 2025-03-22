import React from "react";
import CountUp from "react-countup";

const stats = [
  { label: "Students Helped", value: 5000 },
  { label: "Trees Planted", value: 12000 },
  { label: "Volunteers", value: 3000 },
  { label: "Events Conducted", value: 700 },
];

const AboutStats = () => {
  return (
    <div>
      <h2 className="text-3xl font-bold text-blue-700 text-center mb-4">Impact in numbers</h2>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center py-12">
      {stats.map((stat, i) => (
        <div key={i} className="p-6 bg-blue-100 rounded shadow-md">
          <h2 className="text-3xl font-bold text-blue-600">
            <CountUp start={0} end={stat.value} duration={3} />
          </h2>
          <p className="text-gray-700">{stat.label}</p>
        </div>
      ))}
      </div>
      </div>
  );
};

export default AboutStats;
