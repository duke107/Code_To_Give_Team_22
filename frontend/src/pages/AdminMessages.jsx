import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { FaCheck, FaReply, FaTrashAlt } from "react-icons/fa";
import axios from 'axios'
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AdminMessages = () => {
  const [messages, setMessages] = useState([]);
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [loading, setLoading] = useState(false)
  const [isMsgModalOpen, setIsMsgModalOpen] = useState(false);
  const [isReplyModalOpen, setIsReplyModalOpen] = useState(false);
  
    const openMessageModal = (msg) => {
      setSelectedMessage(msg);
      setIsModalOpen(true);
    };
  
    const closeMessageModal = () => {
      setIsModalOpen(false);
      setSelectedMessage(null);
    };

  useEffect(() => {
    fetch("http://localhost:3000/api/v1/contact/admin/messages", {
      method: "GET",
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setMessages(data);
        } else if (data.data && Array.isArray(data.data)) {
          setMessages(data.data);
        } else {
          setMessages([]);
        }
        console.log("hit again");
      })
      .catch((err) => console.error("Error fetching messages:", err));
  }, [isReplyModalOpen]);

  const handleReplySubmit = async () => {
    setLoading(true);
    if (!replyText.trim()) return alert("Reply cannot be empty.");

    try {
      const res = await fetch("http://localhost:3000/api/v1/contact/reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messageId: selectedMessage._id, replyText }),
        credentials: "include",
      });

      if (res.ok) {
        toast.success("Reply sent!");
        setLoading(false)
        setMessages((prev) =>
          prev.map((m) =>
            m._id === selectedMessage._id ? { ...m, status: "responded" } : m
          )
        );
        setIsReplyModalOpen(false);
      } else {
        toast.error("Failed to send reply.");
      }
    } catch (err) {
      console.error("Error sending reply:", err);
    }
  };

  const openReplyModal = (message) => {
    setSelectedMessage(message);
    setIsReplyModalOpen(true);
  };

  const handleDeleteMessage = async (messageId) => {
    try {
      const res = await fetch(`http://localhost:3000/api/v1/contact/admin/messages/${messageId}`, {
        method: "DELETE",
        credentials: "include",
      });
  
      if (!res.ok) throw new Error("Failed to delete message");
  
      setMessages((prev) => prev.filter((msg) => msg._id !== messageId));
    } catch (err) {
      console.error("Error deleting message:", err);
    }
  };

  const handleDeleteAllMessages = async () => {
    try {
      const res = await fetch("http://localhost:3000/api/v1/contact/admin/messages", {
        method: "DELETE",
        credentials: "include",
      });
  
      if (!res.ok) throw new Error("Failed to delete all messages");
  
      setMessages([]); // Clear messages after deletion
    } catch (err) {
      console.error("Error deleting all messages:", err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Your Messages</h2>
        {messages.length > 0 && (
          <button
            className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-all"
            onClick={handleDeleteAllMessages}
          >
            Delete All
          </button>
        )}
      </div>
  
      {messages.length > 0 ? (
        <div className="space-y-3">
          {messages.map((msg) => (
            <div
              key={msg._id}
              className="p-4 rounded-lg border bg-white flex justify-between items-center transition-all"
            >
              {/* Left - Message Info */}
              <div className="w-full">
                <p>
                  <strong>{msg.name} ({msg.email})</strong> - {msg.category}
                </p>
                <p className="text-gray-700">
                  {msg.message.split(" ").length > 30 ? (
                    <>
                      {msg.message.split(" ").slice(0, 30).join(" ")}...
                      <button
                        className="text-blue-600 hover:underline ml-1"
                        onClick={() => openMessageModal(msg)}
                      >
                        Read more
                      </button>
                    </>
                  ) : (
                    msg.message
                  )}
                </p>
                <div className="flex items-center mt-1 text-xs text-gray-500">
                  {msg.isReplied ? (
                    <>
                      <FaCheck className="text-green-500 mr-1" size={14} />
                      <span>Read</span>
                    </>
                  ) : (
                    <span className="text-gray-400">Unread</span>
                  )}
                </div>
              </div>
  
              {/* Right - Buttons */}
              <div className="flex space-x-2 flex-shrink-0">
                {!msg.isReplied && (
                  <button
                    onClick={() => openReplyModal(msg)}
                    title="Reply"
                    className="p-2 rounded-full text-blue-600 hover:bg-blue-200 transition-colors"
                  >
                    <FaReply size={16} />
                  </button>
                )}
  
                <button
                  onClick={() => handleDeleteMessage(msg._id)}
                  title="Delete Message"
                  className="p-2 rounded-full text-red-500 hover:bg-red-100 transition-colors"
                >
                  <FaTrashAlt size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-10 bg-gray-50 rounded-lg">
          <p className="text-lg font-medium text-gray-500">No messages available</p>
          <p className="text-sm text-gray-400 mt-1">You're all caught up!</p>
        </div>
      )}
  
      {/* Read More Modal */}
      {isModalOpen && selectedMessage && (
        <div
          className="fixed inset-0 flex items-center justify-center w-screen h-screen bg-black bg-opacity-50 backdrop-blur-sm"
          onClick={closeMessageModal}
        >
          <div
            className="bg-white p-6 rounded-lg shadow-md mx-auto sm:w-96 lg:w-[500px] max-h-[80vh] overflow-auto"
            onClick={(e) => e.stopPropagation()} 
          >
            <h3 className="text-lg font-semibold mb-4">Message from {selectedMessage.name}</h3>
            <p className="text-gray-700">{selectedMessage.message}</p>
            <div className="flex justify-end mt-4">
              <button
                className="px-4 py-2 bg-gray-400 text-white rounded-md hover:bg-gray-500"
                onClick={closeMessageModal}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
  
      {/* Reply Modal */}
      {isReplyModalOpen && selectedMessage && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-lg shadow-md w-96">
            <h3 className="text-lg font-semibold mb-4">Reply to {selectedMessage.name}</h3>
            <textarea
              className="w-full p-2 border rounded-md"
              placeholder="Write your reply..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
            />
            <div className="flex justify-end mt-4 gap-2">
              <button
                className="px-4 py-2 bg-gray-400 text-white rounded-md hover:bg-gray-500"
                onClick={() => setIsReplyModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                onClick={handleReplySubmit}
              >
                {loading ? "Replying..." : "Send Reply"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
  
};

export default AdminMessages;
