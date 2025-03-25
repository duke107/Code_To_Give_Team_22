import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const StoryCard = ({ story }) => {
    const navigate = useNavigate();
    const shortDescription = story.description.split(" ").slice(0, 50).join(" ") + "...";
    

    return (
        <motion.div
            className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 
                      hover:shadow-2xl transition-all duration-300 group p-6 text-center"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
        >
            {/* Circular Image Holder */}
            <div className="relative w-32 h-32 mx-auto rounded-full overflow-hidden shadow-lg">
                <img
                    src={story.image}
                    alt={story.title}
                    className="w-full h-full object-cover transition-transform duration-300 
                               group-hover:scale-105"
                />
            </div>

            {/* Content */}
            <div className="mt-4">
                <h2 className="text-2xl font-semibold text-gray-800 mb-2 
                               group-hover:text-blue-600 transition-colors duration-300">
                    {story.title}
                </h2>
                <p className="text-gray-600 text-base leading-relaxed mb-4 line-clamp-3">
                    {shortDescription}
                </p>

                {/* Read More Button */}
                <button
                    onClick={() => navigate(`/stories/${story.id}`)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 
                               rounded-lg transition-all duration-300 shadow-md hover:shadow-lg"
                >
                    Read More
                </button>
            </div>
        </motion.div>
    );
};

export default StoryCard;
