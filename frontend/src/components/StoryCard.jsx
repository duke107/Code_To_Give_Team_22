import React from "react";
import { useNavigate } from "react-router-dom";

const StoryCard = ({ story }) => {
    const navigate = useNavigate();
    const shortDescription = story.description.split(" ").slice(0, 50).join(" ") + "...";

    return (
        <div className="bg-gray-100 rounded-lg shadow-lg p-5 transition-transform duration-300 hover:scale-95 hover:shadow-xl">
            {/* Circular Image */}
            <div className="flex justify-center">
                <img src={story.image} alt={story.title} className="w-32 h-32 object-cover rounded-full border-4 border-gray-300 shadow-md" />
            </div>

            <h2 className="text-xl font-semibold text-center mt-4">{story.title}</h2>
            <p className="text-gray-600 text-center mt-2">{shortDescription}</p>

            <div className="flex justify-center mt-4">
                <button
                    onClick={() => navigate(`/stories/${story.id}`)}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg shadow-md hover:bg-blue-700 transition duration-300"
                >
                    Read More
                </button>
            </div>
        </div>
    );
};

export default StoryCard;
