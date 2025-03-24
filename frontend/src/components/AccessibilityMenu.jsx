import React, { useState, useEffect } from "react";
import { FaEye, FaTimes } from "react-icons/fa";

const AccessibilityMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [textSize, setTextSize] = useState(1);
  const [highContrast, setHighContrast] = useState(false);
  const [grayscale, setGrayscale] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    // Update text size
    document.documentElement.style.fontSize = `${textSize}rem`;

    // Apply/remove classes for modes
    if (highContrast) {
      document.body.classList.add("high-contrast");
    } else {
      document.body.classList.remove("high-contrast");
    }

    if (grayscale) {
      document.body.classList.add("grayscale");
    } else {
      document.body.classList.remove("grayscale");
    }

    if (darkMode) {
      document.body.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
    }
  }, [textSize, grayscale, darkMode, highContrast]);

  return (
    <>
      {/* Eye Icon (Left-Bottom) */}
      <button
        className="fixed bottom-5 z-50 left-5 bg-gray-800 text-white p-3 rounded-full shadow-lg hover:bg-gray-700 transition"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Open Accessibility Menu"
      >
        <FaEye size={24} />
      </button>

      {/* Accessibility Menu */}
      <div
        className={`fixed bottom-16 left-5 z-50 bg-white shadow-lg p-4 border rounded-lg w-52 transition-transform ${
          isOpen ? "scale-100 opacity-100" : "scale-0 opacity-0"
        }`}
      >
        {/* Close Button */}
        <button
          className="absolute top-2 right-2 text-gray-600 hover:text-gray-900"
          onClick={() => setIsOpen(false)}
          aria-label="Close Accessibility Menu"
        >
          <FaTimes size={16} />
        </button>

        <h3 className="font-bold text-md mb-3">Accessibility</h3>

        {/* Text Size Controls */}
        <div className="flex justify-between items-center mb-2">
          <button
            onClick={() => setTextSize((prev) => Math.min(prev + 0.1, 2))}
            className="px-2 py-1 bg-gray-200 rounded text-xs hover:bg-gray-300"
          >
            A+
          </button>
          <button
            onClick={() => setTextSize((prev) => Math.max(prev - 0.1, 0.8))}
            className="px-2 py-1 bg-gray-200 rounded text-xs hover:bg-gray-300"
          >
            A-
          </button>
        </div>

        {/* High Contrast Mode */}
        <button
          onClick={() => setHighContrast(!highContrast)}
          className={`block w-full p-1 text-xs rounded my-1 ${
            highContrast ? "bg-yellow-400" : "bg-gray-200"
          } hover:bg-gray-300`}
        >
          High Contrast
        </button>

        {/* Grayscale Mode */}
        <button
          onClick={() => setGrayscale(!grayscale)}
          className={`block w-full p-1 text-xs rounded my-1 ${
            grayscale ? "bg-gray-600 text-white" : "bg-gray-200"
          } hover:bg-gray-300`}
        >
          Grayscale
        </button>

        {/* Dark Mode */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className={`block w-full p-1 text-xs rounded my-1 ${
            darkMode ? "bg-black text-white" : "bg-gray-200"
          } hover:bg-gray-300`}
        >
          {darkMode ? "Light Mode" : "Dark Mode"}
        </button>
      </div>
    </>
  );
};

export default AccessibilityMenu;
