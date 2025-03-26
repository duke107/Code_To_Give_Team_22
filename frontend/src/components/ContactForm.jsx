import React, { useState, useEffect, useRef } from 'react';
import SpeechToText from './SpeechToText';
import { HiMicrophone, HiStop } from "react-icons/hi";
import { Toast } from 'flowbite-react';
import { toast } from 'react-toastify';

const ContactForm = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [queryType, setQueryType] = useState("general"); // "general" or "event"
  const [message, setMessage] = useState("");
  const [selectedEvent, setSelectedEvent] = useState("");
  const [activeEvents, setActiveEvents] = useState([]);
  const textAreaRef = useRef(null)

  // Fetch active events if query type is "event"
  useEffect(() => {
    if (queryType === "event") {
      fetch("http://localhost:3000/api/v1/events/getEvents", {
        credentials: "include",
      })
        .then((res) => res.json())
        .then((data) => {
          // Filter events: Only include events where eventEndDate is in the future and isCompleted is false
          const now = new Date();
          const filtered = data.filter(
            (event) => new Date(event.eventEndDate) > now && !event.isCompleted
          );
          setActiveEvents(filtered);
        })
        .catch((err) => console.error("Error fetching events:", err));
    } else {
      setActiveEvents([]);
    }
  }, [queryType]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      name,
      email,
      message,
      category: queryType,
      eventId: queryType === "event" ? selectedEvent : null,
    };

    try {
      const res = await fetch("http://localhost:3000/api/v1/contact/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error || "Something went wrong");
      }
      toast.success("Your query has been submitted successfully!");
      setName("");
      setEmail("");
      setQueryType("general");
      setMessage("");
      setSelectedEvent("");
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error(error.message);
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white shadow-md rounded-lg p-6 mt-12">
      <h2 className="text-2xl font-semibold text-center mb-4">Contact Us</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Your Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-0 focus:ring-blue-500 focus:border-blue-500"
        />
        <input
          type="email"
          placeholder="Your Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-0 focus:ring-blue-500 focus:border-blue-500"
        />
        <select
          value={queryType}
          onChange={(e) => setQueryType(e.target.value)}
          required
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-0 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="general">General Inquiry</option>
          <option value="event">Event Related Query</option>
        </select>
        {queryType === "event" && (
          <select
            value={selectedEvent}
            onChange={(e) => setSelectedEvent(e.target.value)}
            required
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-0 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select an Event</option>
            {activeEvents.map((ev) => (
              <option key={ev._id} value={ev._id}>
                {ev.title}
              </option>
            ))}
          </select>
        )}
        <div className='relative'><textarea
          placeholder="Your Message"
          ref={textAreaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-0 focus:ring-blue-500 focus:border-blue-500  min-h-[120px]"
        />
          <SpeechToText textAreaRef={textAreaRef} setText={setMessage} left="10px" bottom="10px"/>
        {/* </textarea> */}
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default ContactForm;
