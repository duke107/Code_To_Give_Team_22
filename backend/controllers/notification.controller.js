import { Notification } from "../models/notification.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {User} from "../models/user.model.js";
import Event from "../models/event.model.js"
import { sendEmail } from "../utils/sendEmail.js";
import {generateEventCompletionEmailTemplate, generateUserRegistrationEmailTemplate} from "../utils/emailTemplates.js"
import { markCompletedEvents } from "../controllers/event.controller.js";
import {io} from "../server.js"

export const sendRegistrationNotification = async (event, volunteerId) => {
  try {
    const volunteer = await User.findById(volunteerId);
    if (!volunteer) {
      console.error("Volunteer not found for ID:", volunteerId);
      return;
    }

    const msg = `Volunteer ${volunteer.name} (ID: ${volunteer.id}) has registered for ${event.title}`;
    
    // Create a notification for the event creator
    await Notification.create({
      userId: event.createdBy,
      message: msg,
      type: "registration"
    });

    // Fetch the event creator's email
    const eventCreator = await User.findById(event.createdBy);
    if (!eventCreator) {
      console.error("Event creator not found for ID:", event.createdBy);
      return;
    }

    // Generate the email template
    const emailBody = generateUserRegistrationEmailTemplate(volunteer.name, event.title);

    // Send the email
    await sendEmail({
      email: eventCreator.email,
      subject: "New Volunteer Registration",
      message: emailBody
    });

  } catch (error) {
    console.error("Error sending registration notification:", error);
  }
};



export const sendReminderNotifications = async () => {
    try {
        //if event is under 2 days
      const twoDaysFromNow = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
      const events = await Event.find({
        eventStartDate: { $lte: twoDaysFromNow },
        "volunteeringPositions.slots": { $gt: 0 }
      });
      
        //searching for same location volunteers
      for (const event of events) {
        const users = await User.find({
          location: event.eventLocation,
          _id: { $nin: event.registeredVolunteers }
        });
  
        for (const user of users) {
          await Notification.create({
            userId: user._id,
            message: `Reminder: The event "${event.title}" in your area`,
            type: "reminder"
          });
        }
      }
    } catch (error) {
      console.error("Error sending reminder notifications:", error);
    }
};
  

export const sendEventCompletionNotifications = async () => {
  try {
    const completedEvents = await markCompletedEvents();

    if (completedEvents.length === 0) return; // No new completed events, skip notifications

    for (const event of completedEvents) {
      const volunteers = await User.find({ _id: { $in: event.registeredVolunteers } }, "email name");

      for (const volunteer of volunteers) {
        const message = `The event "${event.title}" has concluded. We invite you to submit your honest feedback`;

        await Notification.create({
          userId: volunteer._id,
          message,
          type: "event-end",
        });

        io.to(volunteer._id.toString()).emit("new-notification", {
          message,
          type: "event-end",
          isRead: false,
        });

        const emailContent = generateEventCompletionEmailTemplate(event.title);
        await sendEmail({
          email: volunteer.email,
          subject: `Event Completed: ${event.title}`,
          message: emailContent,
        });
      }
    }

    console.log(`Sent event completion notifications for ${completedEvents.length} events.`);
  } catch (error) {
    console.error("Error in event completion notifications:", error);
  }
};



const sendNotification = async (req, res, next) => {
    try {
        const { userId, message, type } = req.body;
    if (!userId || !message || !type) {
      return next(new ApiError(400, "userId, message, and type are required"));
    }
      const notification = await Notification.create({ userId, message, type });
    return res.status(201).json(new ApiResponse(201, notification, "Notification sent successfully"));
    } catch (error) {
        next(new ApiError(500, "Error sending notifications"));
    }
};

const getAllNotifications = async (req, res, next) => {
    try {
        const userId = req.user._id; // Considering we sent user in the req too
        const notifications = await Notification.find({ userId }).sort({ createdAt: -1 });

        return res.status(200).json(new ApiResponse(200, notifications, "Notifications fetched successfully"));
    } catch (error) {
        next(error);
    }
};

const markNotificationAsRead = async (req, res, next) => {
    try {
        //! Frontend shall send a PATCH request at /notifications/:notificationId
        const updatedNotification = await Notification.findByIdAndUpdate(
            req.params.notificationId,
            { isRead: true },
            { new: true }
        );

        if (!updatedNotification) {
            return next(new ApiError(404, "Notification not found"));
        }

        return res.status(200).json(new ApiResponse(200, updatedNotification, "Notification updated successfully"));
    } catch (error) {
        next(error);
    }
};

const deleteNotification = async (req, res, next) => {
    try {
        //! Frontend shall send a DELETE request at /notifications/:notificationId
        const { notificationId } = req.params;
        const deletedNotification = await Notification.findByIdAndDelete(notificationId);

        if (!deletedNotification) {
            return next(new ApiError(404, "Notification not found"));
        }

        return res.status(200).json(new ApiResponse(200, null, "Notification deleted successfully"));
    } catch (error) {
        next(error);
    }
};

export { sendNotification, getAllNotifications, markNotificationAsRead, deleteNotification };
