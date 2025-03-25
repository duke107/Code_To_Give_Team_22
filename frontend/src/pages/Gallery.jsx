import React, { useEffect, useState } from "react";
import StoryCard from "../components/StoryCard.jsx";
import storiesData from "../data/stories.json";

const Gallery = () => {
    const [stories, setStories] = useState([]);

    useEffect(() => {
        setStories(storiesData);
    }, []);

    return (
        <div className="container mx-auto p-6">
            <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">Success Stories</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {stories.map((story) => (
                    <StoryCard key={story.id} story={story} />
                ))}
            </div>
        </div>
    );
};

export default Gallery;
