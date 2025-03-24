import React, { useState, useEffect } from "react";
import { FaEye, FaTimes } from "react-icons/fa";

const AccessibilityMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [textSize, setTextSize] = useState(1);
  const [highContrast, setHighContrast] = useState(false);
  const [grayscale, setGrayscale] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  // Load settings from localStorage when the component mounts
  useEffect(() => {
    const savedTextSize = localStorage.getItem("textSize");
    const savedHighContrast = localStorage.getItem("highContrast") === "true";
    const savedGrayscale = localStorage.getItem("grayscale") === "true";
    const savedDarkMode = localStorage.getItem("darkMode") === "true";

    if (savedTextSize) setTextSize(parseFloat(savedTextSize));
    setHighContrast(savedHighContrast);
    setGrayscale(savedGrayscale);
    setDarkMode(savedDarkMode);
  }, []);

  // Apply settings & update localStorage when changes occur
  useEffect(() => {
    document.documentElement.style.fontSize = `${textSize}rem`;
    document.body.classList.toggle("high-contrast", highContrast);
    document.body.classList.toggle("grayscale", grayscale);
    document.body.classList.toggle("dark-mode", darkMode);

    localStorage.setItem("textSize", textSize);
    localStorage.setItem("highContrast", highContrast);
    localStorage.setItem("grayscale", grayscale);
    localStorage.setItem("darkMode", darkMode);
  }, [textSize, grayscale, darkMode, highContrast]);

  return (
    <>
      {/* Eye Icon (Left-Bottom) */}
      <button
        className="fixed bottom-5 left-5 bg-gray-800 text-white p-3 rounded-full shadow-lg hover:bg-gray-700 transition"
        onClick={() => setIsOpen((prev) => !prev)} // Toggle menu open/close
        aria-label="Toggle Accessibility Menu"
      >
        <FaEye size={24} />
      </button>

      {/* Accessibility Menu */}
      <div
        className={`fixed bottom-16 left-5 bg-white shadow-lg p-4 border rounded-lg w-52 transition-transform z-50 ${
          isOpen ? "scale-100 opacity-100" : "scale-0 opacity-0"
        }`}
        style={{ position: "fixed" }} // Ensure grayscale doesn't affect position
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
          // style={{ position: "relative" }} // Prevents menu shift
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
