import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import successStories from "../data/stories.json";

const FullStory = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const story = successStories.find((story) => story.id.toString() === id);

  if (!story) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-red-600 text-xl font-semibold">🚨 Story not found!</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow-lg rounded-lg mt-10">
      {/* Image Container */}
      <div className="flex justify-center">
        <img
          src={story.image}
          alt={story.title}
          className="w-64 h-64 object-cover rounded-full shadow-md border-4 border-gray-300"
        />
      </div>

      {/* Story Content */}
      <div className="text-center mt-6">
        <h1 className="text-4xl font-bold text-gray-900">{story.title}</h1>
        <div className="w-20 h-1 bg-blue-500 mx-auto my-4 rounded-full"></div>
        <p className="text-gray-700 text-lg leading-relaxed">{story.description}</p>
      </div>

      {/* Buttons */}
      <div className="flex justify-center mt-6 gap-4">
        <button
          onClick={() => navigate(-1)}
          className="bg-gray-400 hover:bg-gray-500 text-white font-semibold py-2 px-6 rounded-md transition-all duration-300"
        >
          Back 
        </button>
      </div>
    </div>
  );
};

export default FullStory;
