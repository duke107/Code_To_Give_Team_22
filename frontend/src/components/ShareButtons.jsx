import React from "react";
import { FaWhatsapp, FaTwitter, FaFacebook, FaLinkedin } from "react-icons/fa";
import messages from "../data/messages.json";

const ShareButtons = ({ event }) => {
  if (!event) return null;

  // Function to replace placeholders with actual event details
  const formatMessage = (template) => {
    return template
      .replace("{eventTitle}", event.title)
      .replace("{eventStartDate}", new Date(event.eventStartDate).toLocaleDateString())
      .replace("{eventEndDate}", new Date(event.eventEndDate).toLocaleDateString())
      .replace("{eventLocation}", event.eventLocation)
      .replace("{eventLink}", window.location.href);
  };

  // Encode messages for URL usage
  const whatsappMessage = encodeURIComponent(formatMessage(messages.eventShare.whatsapp));
  const twitterMessage = encodeURIComponent(formatMessage(messages.eventShare.twitter));
  const facebookMessage = encodeURIComponent(formatMessage(messages.eventShare.facebook));
  const linkedinMessage = encodeURIComponent(formatMessage(messages.eventShare.linkedin));

  return (
    <div className="flex gap-2">
      {/* WhatsApp */}
      <a
        href={`https://wa.me/?text=${whatsappMessage}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-green-500 hover:text-green-700 text-xl"
      >
        <FaWhatsapp />
      </a>

      {/* Twitter */}
      <a
        href={`https://twitter.com/intent/tweet?text=${twitterMessage}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-500 hover:text-blue-700 text-xl"
      >
        <FaTwitter />
      </a>

      {/* Facebook */}
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}&quote=${facebookMessage}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-700 hover:text-blue-900 text-xl"
      >
        <FaFacebook />
      </a>

      {/* LinkedIn */}
      <a
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}&quote=${facebookMessage}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 hover:text-blue-800 text-xl"
      >
        <FaLinkedin />
      </a>
    </div>
  );
};

export default ShareButtons;
