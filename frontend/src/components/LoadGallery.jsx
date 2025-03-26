import React, { useState } from "react";
import { FaArrowLeft, FaArrowRight, FaTimes } from "react-icons/fa";

const LoadGallery = ({ event, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextImage = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % event.images.length);
  };

  const prevImage = () => {
    setCurrentIndex(
      (prevIndex) => (prevIndex - 1 + event.images.length) % event.images.length
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-3xl w-full relative">
        <button
          className="absolute top-2 right-2 text-gray-600 hover:text-gray-900 text-2xl"
          onClick={onClose}
        >
          <FaTimes />
        </button>
        <h2 className="text-xl font-bold text-center mb-4">{event.title}</h2>

        <div className="relative flex items-center">
          {/* Left Arrow */}
          <button
            onClick={prevImage}
            className="absolute left-2 text-gray-600 hover:text-gray-900 text-2xl z-10"
          >
            <FaArrowLeft />
          </button>

          {/* Main Image */}
          <img
            src={event.images[currentIndex]}
            alt={event.title}
            className="rounded-lg shadow-md mx-auto max-h-[400px] object-cover"
          />

          {/* Right Arrow */}
          <button
            onClick={nextImage}
            className="absolute right-2 text-gray-600 hover:text-gray-900 text-2xl z-10"
          >
            <FaArrowRight />
          </button>
        </div>

        {/* Image Tracker */}
        <div className="mt-4 flex justify-center gap-2">
          {event.images.map((img, index) => (
            <img
              key={index}
              src={img}
              alt={`Thumbnail ${index}`}
              className={`w-12 h-12 rounded cursor-pointer border-2 ${
                index === currentIndex ? "border-blue-500" : "border-transparent"
              }`}
              onClick={() => setCurrentIndex(index)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default LoadGallery;