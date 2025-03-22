import React from "react";
import { useNavigate } from "react-router-dom";

const StoryCard = ({ story }) => {
    const navigate = useNavigate();

    const shortDescription = story.description.split(" ").slice(0, 50).join(" ") + "..."

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <img src={story.image} alt={story.title} className="w-full h-48 object-cover rounded" />
      <h2 className="text-xl font-semibold mt-2">{story.title}</h2>
      <p className="text-gray-600">{shortDescription}</p>
      <button
        onClick={() => navigate(`/stories/${story.id}`)}
        className="mt-3 bg-blue-600 text-white px-4 py-2 rounded"
      >
        Read More
      </button>
    </div>
  );
};

export default StoryCard;
