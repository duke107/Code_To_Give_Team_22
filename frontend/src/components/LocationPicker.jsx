import React, { useState } from "react";
import places from "../data/places.json";
import { HiLocationMarker } from "react-icons/hi";

const LocationPicker = ({ eventLocation, setEventLocation }) => {
  const [suggestions, setSuggestions] = useState([]);

  const handleChange = (e) => {
    const value = e.target.value;
    setEventLocation(value);

    if (value.length >= 2) {
      const filtered = places.cities
        .filter((city) =>
          city.name.toLowerCase().includes(value.toLowerCase())
        )
        .slice(0, 10);
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (city) => {
    setEventLocation(city.name);
    setSuggestions([]);
  };

  return (
    <div className="static">
      <div className="mb-2">
        <label htmlFor="Location" className="text-lg font-medium">
        </label>
      </div>
      <div className="flex items-center">
        <HiLocationMarker className="mr-2 text-gray-600" />
        <input
          id="Location"
          type="text"
          placeholder="Enter location"
          required
          value={eventLocation}
          onChange={handleChange}
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
        />
      </div>
      {suggestions.length > 0 && (
        <div className="absolute z-10 mt-1 max-w-full ml-5 bg-white border border-gray-300 rounded-md max-h-60 overflow-y-auto">
          {suggestions.map((suggestion) => (
            <div
              key={suggestion.id} 
              onClick={() => handleSuggestionClick(suggestion)}
              className="cursor-pointer px-4 py-2 hover:bg-blue-100"
            >
              {suggestion.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LocationPicker;