import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { sendToken } from "../utils/sendToken.js";
import Event from "../models/event.model.js";
import { Notification } from '../models/notification.model.js';
import { io } from "../server.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Task } from "../models/task.model.js";

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

        const user = await User.create({
            name: "Admin",
            email: process.env.ADMIN_EMAIL,
            password: process.env.ADMIN_PASSWORD,
            role: "Admin"
        });
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
            const users = await User.find({ location: city }).select("name email role avatar");
        
            // Fetch past events
            const pastEvents = await Event.find({ eventLocation: city, eventEndDate: { $lt: today } });
        
            // Fetch upcoming events
            const upcomingEvents = await Event.find({ eventLocation: city, eventStartDate: { $gte: today } });
            // console.log(users, pastEvents, upcomingEvents);
            res.status(200).json({ users, pastEvents, upcomingEvents });
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