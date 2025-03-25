import React from "react";
import People from "../data/people.json"; // Assuming this path is correct

const AboutPeople = () => {
  return (
    <div className=" py-16 px-6 bg-gradient-to-br from-gray-50 to-gray-100 relative">
      <div className="min-h-screen max-w-6x3  mx-auto">
        <h2 className="text-4xl font-extrabold text-blue-800 text-center mb-12 relative">
          Meet Our Team
          <span className=" left-1/2 transform -translate-x-1/2 bottom-[-8px] w-1/3 h-1 bg-blue-300 rounded-full"></span>
        </h2>
        <div className="absolute grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-20">
          {People.map((member) => (
            <div
              key={member.id}
              className="bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300
                        hover:shadow-2xl hover:scale-[1.02] border border-gray-100"
            >
              <div className="relative">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-full h-64 object-cover rounded-t-xl"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0
                               hover:opacity-50 transition-opacity duration-300 rounded-t-xl"></div>
              </div>
              <div className="p-6">
                <h3 className="text-2xl font-semibold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors duration-300">
                  {member.name}
                </h3>
                <p className="text-blue-600 font-medium mb-4">{member.title}</p>
                <p className="text-gray-700 text-base leading-relaxed">
                  {member.bio}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AboutPeople;
