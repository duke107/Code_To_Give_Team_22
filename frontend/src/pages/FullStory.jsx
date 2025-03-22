import React from "react";
import { useParams } from "react-router-dom";
import successStories from "../data/stories.json";

const FullStory = () => {
  const { id } = useParams();
  const story = successStories.find(story => story.id.toString() === id);

  if (!story) {
    return <p className="text-red-600 text-center">Story not found!</p>;
  }

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow-md rounded-lg">
      <img src={story.image} alt={story.title} className="w-full h-64 object-cover rounded-lg" />
      <h1 className="text-3xl font-bold mt-4">{story.title}</h1>
      <p className="text-gray-700 mt-2">{story.description}</p>
    </div>
  );
};

export default FullStory;
