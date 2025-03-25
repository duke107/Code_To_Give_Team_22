import { Contact } from "../models/contact.model.js";
import { User } from "../models/user.model.js";
import { sendEmail } from "../utils/sendEmail.js";
import Event from "../models/event.model.js";
import { generateReplyEmailTemplate} from "../utils/emailTemplates.js";

export const submitContactMessage = async (req, res) => {
  try {
    const { name, email, message, category, eventId } = req.body;

    // Validate required fields
    if (!name || !email || !message || !category) {
      return res.status(400).json({ error: "All fields are required." });
    }

    let recipientId;
    if (category === "event") {
      if (!eventId) {
        return res
          .status(400)
          .json({ error: "Please select an event for event-related queries." });
      }
      // Find the event; if found, set recipient as the organizer (createdBy)
      const event = await Event.findById(eventId);
      if (!event) {
        return res.status(404).json({ error: "Event not found." });
      }
      recipientId = event.createdBy;
    } else {
      // For general queries, fetch an admin (assumes at least one admin exists)
      const adminUser = await User.findOne({ role: "Admin" });
      if (!adminUser) {
        return res.status(404).json({ error: "Admin not found." });
      }
      recipientId = adminUser._id;
    }

    // Create and save the contact message
    const newMessage = await Contact.create({
      name,
      email,
      message,
      category,
      eventId: category === "event" ? eventId : null,
      recipientId,
    });

    return res.status(201).json({
      message: "Your query has been submitted successfully.",
      newMessage,
    });
  } catch (error) {
    console.error("Error submitting contact message:", error);
    return res.status(500).json({ error: "Server error" });
  }
};

// Get all messages (for Admin/Organizer)
export const getMessagesForAdmin = async (req, res) => {
  try {
    const messages = await Contact.find({ category: "general" }).sort({ createdAt: -1 });
    return res.status(200).json(messages);
  } catch (error) {
    console.error("Error fetching general messages:", error);
    return res.status(500).json({ error: "Server error" });
  }
};


export const getMessagesForOrganiser = async (req, res) => {
  try {
    if (req.user.role !== "Event Organiser") {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const messages = await Contact.find({ recipientId: req.user._id }).sort({
      createdAt: -1,
    });
    return res.status(200).json(messages);
  } catch (error) {
    console.error("Error fetching organizer messages:", error);
    return res.status(500).json({ error: "Server error" });
  }
};

export const replyToMessage = async (req, res) => {
  try {
    console.log("Reply function called", req.body);

    const { messageId, replyText } = req.body;
    if (!messageId || !replyText) {
      return res.status(400).json({ error: "Message ID and reply text are required." });
    }

    console.log("Extracted messageId:", messageId);

    const message = await Contact.findById(messageId);
    if (!message) {
      return res.status(404).json({ error: "Message not found." });
    }

    console.log("Found message:", message);

    // Generate email template
    const emailContent = generateReplyEmailTemplate(message.name, replyText);

    // Send Email
    await sendEmail({
      email: message.email,
      subject: `Response to Your Inquiry`,
      message: emailContent,
    });

    message.isReplied = true;
    await message.save();

    return res.status(200).json({ message: "Reply sent successfully." });
  } catch (error) {
    console.error("Error replying to message:", error);
    return res.status(500).json({ error: "Server error." });
  }
};


export const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;

    const message = await Contact.findById(messageId);
    if (!message) return res.status(404).json({ error: "Message not found." });

    // Check if the logged-in user is authorized to delete
    if (message.recipientId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    await Contact.findByIdAndDelete(messageId);
    return res.status(200).json({ message: "Message deleted successfully." });
  } catch (error) {
    console.error("Error deleting message:", error);
    return res.status(500).json({ error: "Server error." });
  }
};


export const deleteAllMessages = async (req, res) => {
  try {
    await Contact.deleteMany({ recipientId: req.user._id });
    return res.status(200).json({ message: "All messages deleted successfully." });
  } catch (error) {
    console.error("Error deleting all messages:", error);
    return res.status(500).json({ error: "Server error." });
  }
};
