import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import successStories from "../data/stories.json";

const FullStory = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const story = successStories.find(story => story.id.toString() === id);

    if (!story) {
        return <p className="text-red-600 text-center mt-10 text-lg">Story not found!</p>;
    }

    return (
        <div className="max-w-3xl mx-auto p-6 bg-white shadow-lg rounded-lg">
            {/* Story Image */}
            <div className="flex justify-center">
                <img src={story.image} alt={story.title} className="w-64 h-64 object-cover rounded-full border-4 border-gray-300 shadow-md" />
            </div>

            {/* Story Title */}
            <h1 className="text-3xl font-bold text-center mt-4 text-gray-800">{story.title}</h1>

            {/* Author & Date (if available) */}
            <div className="text-center text-gray-500 mt-2">
                {story.author && <p className="font-medium">By {story.author}</p>}
                {story.date && <p className="text-sm">{new Date(story.date).toLocaleDateString()}</p>}
            </div>

            {/* Story Content */}
            <p className="text-gray-700 mt-4 leading-relaxed">{story.description}</p>

            {/* Back Button */}
            <div className="flex justify-center mt-6">
                <button
                    onClick={() => navigate("/gallery")}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg shadow-md hover:bg-blue-700 transition duration-300"
                >
                    ← Back to Stories
                </button>
            </div>
        </div>
    );
};

export default FullStory;
