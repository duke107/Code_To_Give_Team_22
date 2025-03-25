import React, { useEffect, useState } from "react";
import StoryCard from "../components/StoryCard.jsx";
import storiesData from "../data/stories.json";
import galleryData from "../data/gallery.json"; // JSON file for images
import Modal from "../components/LoadGallery.jsx"; // A modal component for displaying images

const Gallery = () => {
  const [stories, setStories] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    setStories(storiesData);
    setGallery(galleryData);
  }, []);

  return (
    <div className="py-16 px-6 bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto">
        
        {/* Event Highlights Section */}
        <h1 className="text-4xl font-extrabold text-blue-800 text-center mb-12 relative">
          Event Highlights
          <span className="left-1/2 transform -translate-x-1/2 bottom-[-8px] w-1/3 h-1 bg-blue-300 rounded-full"></span>
        </h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-16">
          {gallery.map((event, index) => (
            <div key={index} className="relative group">
              <img
                src={event.images[0]}
                alt={event.title}
                className="w-full h-56 object-cover rounded-lg shadow-lg cursor-pointer transition-transform transform group-hover:scale-105"
                onClick={() => setSelectedEvent(event)}
              />
              <p className="text-center text-gray-700 mt-2 font-medium">{event.title}</p>
            </div>
          ))}
        </div>

        {/* Success Stories Section */}
        <h1 className="text-4xl font-extrabold text-blue-800 text-center mb-12 relative">
          Success Stories
          <span className=" left-1/2 transform -translate-x-1/2 bottom-[-8px] w-1/3 h-1 bg-blue-300 rounded-full"></span>
        </h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {stories.map((story) => (
            <StoryCard key={story.id} story={story} />
          ))}
        </div>
      </div>

      {/* Modal for Image Gallery */}
      {selectedEvent && <Modal event={selectedEvent} onClose={() => setSelectedEvent(null)} />}
    </div>
  );
};

export default Gallery;
