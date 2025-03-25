import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";

const AdminMessages = () => {
  const [messages, setMessages] = useState([]);
  const {isAuthenticated} = useSelector((state) => state.auth)

  useEffect(() => {
    if(!isAuthenticated)
      return
    console.log("hit")

    fetch("http://localhost:3000/api/v1/admin/messages", {
      method: "GET",
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        // Check if data is directly an array or wrapped in data.data
        if (Array.isArray(data)) {
          setMessages(data);
        } else if (data.data && Array.isArray(data.data)) {
          setMessages(data.data);
        } else {
          setMessages([]);
        }
        console.log("hit again")
      })
      .catch((err) => console.error("Error fetching messages:", err));
  }, []);

  const handleReply = async (messageId, replyText) => {
    try {
      const res = await fetch(`http://localhost:3000/api/v1/contact/reply/${messageId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ replyText }),
        credentials: "include",
      });

      if (res.ok) {
        alert("Reply sent!");
        setMessages((prev) =>
          prev.map((m) => (m._id === messageId ? { ...m, status: "responded" } : m))
        );
      } else {
        alert("Failed to send reply.");
      }
    } catch (err) {
      console.error("Error sending reply:", err);
    }
  };

  const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return Math.floor(seconds) + " seconds ago";
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold text-center mb-6">Your Messages</h2>
      {messages && messages.length > 0 ? (
        messages.map((msg) => (
          <div key={msg._id} className="border-b p-4">
            <p>
              <strong>{msg.name} ({msg.email})</strong> - {msg.category}
            </p>
            <p className="text-gray-700">{msg.message}</p>
            {msg.status !== "responded" && (
              <textarea
                className="w-full p-2 border rounded-md mt-2"
                placeholder="Write a response..."
                onBlur={(e) => handleReply(msg._id, e.target.value)}
              />
            )}
          </div>
        ))
      ) : (
        <p className="text-center text-gray-500">No messages available</p>
      )}
    </div>
  );
};

export default AdminMessages;
