import React from "react";
import CountUp from "react-countup";
import { FaUsers, FaTree, FaHandsHelping, FaCalendarAlt } from "react-icons/fa"; // Icons

const stats = [
  { label: "Students Helped", value: 5000, icon: FaUsers },
  { label: "Trees Planted", value: 12000, icon: FaTree },
  { label: "Volunteers", value: 3000, icon: FaHandsHelping },
  { label: "Events Conducted", value: 700, icon: FaCalendarAlt },
];

const AboutStats = () => {
  return (
    <div className="py-12 bg-gradient-to-b from-blue-50 to-white"> {/* Gradient background */}
      <div className="container mx-auto">
        <h2 className="text-4xl font-bold text-blue-700 text-center mb-8">
          Impact in numbers
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 text-center">
          {stats.map((stat, i) => (
            <div
              key={i}
              className="p-8 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300" // Hover effect
            >
              <div className="text-4xl text-blue-600 mb-4">
                <stat.icon /> {/* Icon */}
              </div>
              <h2 className="text-4xl font-bold text-blue-600 mb-2">
                <CountUp start={0} end={stat.value} duration={3} />
              </h2>
              <p className="text-gray-700 font-semibold">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AboutStats;