import React from "react";

const AboutMission = () => {
  return (
    <div className="py-16 px-6 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-4xl mx-auto text-center">
        
        <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-lg p-8 border border-gray-200/50">
          <h3 className="text-2xl font-semibold text-blue-700 mb-6 flex items-center justify-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-target"
            >
              <circle cx="12" cy="12" r="10" />
              <circle cx="12" cy="12" r="6" />
              <circle cx="12" cy="12" r="2" />
            </svg>
            Our Mission
          </h3>
          <p className="text-gray-700 text-lg leading-relaxed mb-6 text-justify">
            To empower individuals with disabilities, promote inclusive education, and foster sustainable livelihoods through innovative initiatives. We strive to create a world where everyone has the opportunity to reach their full potential. We are dedicated to fostering a supportive and inclusive environment where every person feels valued, respected, and empowered to achieve their goals. Our commitment extends to breaking down barriers, challenging stereotypes, and advocating for the rights of individuals with disabilities.
          </p>
          <h3 className="text-2xl font-semibold text-blue-700 mb-4 flex items-center justify-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-eye"
            >
              <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            Our Vision
          </h3>
          <p className="text-gray-700 text-lg leading-relaxed text-justify">
            We envision a society where every person is given equal opportunities and access to the resources needed to thrive. Through education, vocational training, and community support, we are breaking barriers and building bridges to a more inclusive future. We aspire to be a catalyst for change, driving the creation of a world where diversity is celebrated, and everyone can participate fully in all aspects of life.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AboutMission;
