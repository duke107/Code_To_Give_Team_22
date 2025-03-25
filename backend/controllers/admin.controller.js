import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { sendToken } from "../utils/sendToken.js";
import Event from "../models/event.model.js";
import { Notification } from '../models/notification.model.js';
import { io } from "../server.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Task } from "../models/task.model.js";
import mongoose from "mongoose";
import nodemailer from "nodemailer";
import EventSummary from "../models/eventSummary.model.js";

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        // console.log(email, password);
        if(!email || !password){
            return res.status(400).json({ msg: "Please fill in all fields" });
        }

        if (email !== process.env.ADMIN_EMAIL) {
            return res.status(403).json({ message: "Not authorized as Admin" });
        }

        // const isMatch = await bcrypt.compare(password, process.env.ADMIN_PASSWORD);
        //TODO: Have to remove the below line and uncomment the above line after encrypting .env password for admin
        const isMatch = (password === process.env.ADMIN_PASSWORD);


        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        let user = await User.findOne({ email: process.env.ADMIN_EMAIL });
          
          // console.log("this is user", user);
          if(!user){
            user = await User.create({
              name: "Admin",
              email: process.env.ADMIN_EMAIL,
              password: process.env.ADMIN_PASSWORD,
              role: "Admin"
            });
          }
        // console.log("reached");
        sendToken(user, 200, "Admin logged in successfully", res);
        // console.log("passed");

    } catch (error) {
        // console.log("error found");
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};


export const logout =async(req,res)=>{
    try {
        
        res.clearCookie('token', { httpOnly: true });
        return res.status(200).json({ success: true, message: "Logged out successfully"})
        } catch (error) {
            console.log(error.message);
            return res.status(500).json({ success: false, message: "Internal Server Error"
             })
        }
}


export const approveEvent = async (req, res) => {
    try {
        const { eventId } = req.params;

        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ success: false, message: "Event not found" });
        }

          event.isApproved = true;

          const usersInArea = await User.find({
              location: event.eventLocation,
              _id: { $ne: event.user_id }
            });
        
            // For each user, create a notification about the new event
            for (const user of usersInArea) {
              const notification = await Notification.create({
                userId: user._id,
                message: `New event "${event.title}" is listed in your area.`,
                type: "reminder"
              });
              io.to(user._id.toString()).emit("new-notification", notification);
            }
        

        await event.save();

        res.status(200).json({ success: true, message: "Event approved successfully", event });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

export const rejectEvent = async (req, res) => {
    try {
        const { eventId } = req.params;
        
        const event = await Event.findByIdAndDelete(eventId);
        if (!event) {
            return res.status(404).json({ success: false, message: "Event not found" });
        }   

        res.status(200).json({ success: true, message: "Event rejected successfully", event });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

export const getPendingEvents = async (req, res) => {
    // console.log("Reached for checking");
    try {
        const events = await Event.find({ isApproved: false });
        res.status(200).json({ success: true, events });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
}

export const getPastEvents = async (req, res) => {
    try {
        const events = await Event.find({ isApproved: true }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, events });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
}

export const getUsersByCity = async (req, res) => {
    try {
      // Aggregate users by location (city) and count the number of users in each city
      const cityData = await User.aggregate([
        { 
          $match: { location: { $ne: null, $ne: "" } } // Exclude users without a location
        },
        { 
          $group: { _id: "$location", users: { $sum: 1 } } 
        },
        { 
          $project: { city: "$_id", users: 1, _id: 0 } 
        },
        { 
          $sort: { users: -1 } // Sort by user count (descending)
        }
      ]);
  
      res.status(200).json(cityData);
    } catch (error) {
      console.error("Error fetching users by city:", error);
      res.status(500).json({ message: "Error fetching city data", error });
    }
  };

  const getAllUsers = async (req, res) => {
    User.find()
      .then((users) => {
        res.json(users);
      })
      .catch((err) => res.status(400).json("Error: " + err));
  }

    export const getCityDetails = async (req, res) => {
        try {
            const { city } = req.params;
            const today = new Date();
            
            // Fetch users in the city
            const allUsers = await User.find({ location: city });
            const users = allUsers.filter((user) => user.role === "User");
            const organizers = allUsers.filter((user) => user.role === "Event Organiser");
          
            // Fetch past events
            const pastEvents = await Event.find({ eventLocation: city, eventEndDate: { $lt: today } });
        
            // Fetch upcoming events
            const upcomingEvents = await Event.find({ eventLocation: city, eventStartDate: { $gte: today } });
            // console.log(users, pastEvents, upcomingEvents);
            res.status(200).json({ users, organizers, pastEvents, upcomingEvents });
          } catch (error) {
            console.error("Error fetching city data:", error);
            res.status(500).json({ message: "Internal Server Error" });
          }
    };

    export const getStats = async (req, res) => {
        try {
            // Fetch total users, events, and tasks completed
            const totalUsers = await User.countDocuments();
            const totalEvents = await Event.countDocuments();
            const totalTasks = await Task.countDocuments({ status: "completed" });
        
            
            res.status(200).json({
              users: totalUsers,
              events: totalEvents,
              tasks: totalTasks,
            });
          } catch (error) {
            console.error("Error fetching dashboard stats:", error);
            res.status(500).json({ error: "Internal Server Error" });
          }
};

export const usersListByIds = async (req, res) => {
    try {
        const { userIds } = req.body;
        const users = await User.find({ _id: { $in: userIds } });
        res.status(200).json(users);
    } catch (error) {
        console.error("Error fetching users by IDs:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const userById = async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);
        res.status(200).json(user);
    } catch (error) {
        console.error("Error fetching user by ID:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export const getEvents = async (req, res) => {
  const { eventIds } = req.body;
  // console.log(eventIds);
  if (!eventIds || !Array.isArray(eventIds) || eventIds.length === 0) {
    return res.status(400).json({ message: "Invalid event IDs" });
  }

  try {
    const events = await Event.find({ _id: { $in: eventIds } });

    res.status(200).json({ events });
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const removeOrganizer = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findById(id);
    if (!user || user.role !== "Event Organiser") {
      return res.status(404).json({ message: "Organizer not found" });
    }

    // Change role to "User"
    user.role = "User";
    await user.save();

    // Send Notification
    const message = "Your role has been changed to User by the Admin.";
    await sendNotification(id, message, "role_change");

    res.status(200).json({ message: "Organizer role changed to User successfully" });
  } catch (error) {
    console.error("Error updating organizer role:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


const sendNotification = async (userId, message, type) => {
  try {
    if (!userId || !message || !type) {
      throw new Error("userId, message, and type are required");
    }
    
    const notification = await Notification.create({ userId, message, type });
    return notification;
  } catch (error) {
    console.error("Error sending notification:", error);
    throw new Error("Failed to send notification");
  }
};

export const warnOrganizer = async (req, res) => {
  const { userId, message } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user || user.role !== "Event Organiser") {
      return res.status(404).json({ message: "Organizer not found" });
    }

    // Send email using Nodemailer
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.SMTP_MAIL,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.SMTP_MAIL,
      to: user.email,
      subject: "Warning from Admin",
      text: `Dear ${user.name},\n\n${message}\n\nPlease take necessary action.\n\nRegards,\nAdmin`,
    };

    await transporter.sendMail(mailOptions);

    // Store notification in the database
    await sendNotification(userId, message, "warning");

    res.status(200).json({ message: "Warning sent successfully" });
  } catch (error) {
    console.error("Error sending warning:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


export const getAllEventSummaries = async (req, res) => {
  try {
    // Fetch all summaries, optionally sorted by creation date
    const summaries = await EventSummary.find().sort({ createdAt: -1 });
    res.status(200).json(summaries);
  } catch (error) {
    console.error("Error fetching event summaries:", error);
    res.status(500).json({ message: error.message });
  }
};


export const getEventSummaryById = async (req, res) => {
  try {
    const { id } = req.params; // summary ID from URL
    const summary = await EventSummary.findById(id);

    if (!summary) {
      return res.status(404).json({ message: "Event summary not found" });
    }

    res.status(200).json(summary);
  } catch (error) {
    console.error("Error fetching event summary by ID:", error);
    res.status(500).json({ message: error.message });
  }
};

export const promoteToOrganiser = async (req, res) => {
  try {
    const { userId } = req.body;
    
    // Validate input
    if (!userId) {
      return res.status(400).json({ message: "User ID is required." });
    }

    // Find the user by ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // If user is already an event organiser, return an error or message
    if (user.role === "Event Organiser") {
      return res.status(400).json({ message: "User is already an event organiser." });
    }

    // Update the user's role
    user.role = "Event Organiser";
    await user.save();

    return res.status(200).json({ message: "User promoted to Event Organiser successfully." });
  } catch (error) {
    console.error("Error promoting user:", error);
    return res.status(500).json({ message: error.message });
  }
};