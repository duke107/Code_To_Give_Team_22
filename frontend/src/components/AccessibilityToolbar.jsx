import React from "react";
import { useAccessibility } from "./Accessibility/AccessibilityContext.Hook";

const AccessibilityToolbar = () => {
  const { increaseFontSize, decreaseFontSize, toggleHighContrast } = useAccessibility();

  return (
    <div
      style={{ top: "100px", zIndex: "2" }}
      className="fixed right-5 bg-red-600 text-white px-2 py-2 rounded shadow transition transform focus:outline-none flex items-center space-x-2"
    >
      <span className="text-lg">🔎</span> 
      
      <button
        onClick={increaseFontSize}
        className="rounded shadow transition transform hover:bg-red-700 hover:-translate-y-1 focus:outline-none px-2 py-1"
      >
        A+
      </button>
      
      <button
        onClick={decreaseFontSize}
        className="rounded shadow transition transform hover:bg-red-700 hover:-translate-y-1 focus:outline-none px-2 py-1"
      >
        A-
      </button>
      
      <button
        onClick={toggleHighContrast}
        className="rounded shadow transition transform hover:bg-red-700 hover:-translate-y-1 focus:outline-none px-2 py-1"
      >
        High Contrast
      </button>
    </div>
  );
  
};

export default AccessibilityToolbar;
