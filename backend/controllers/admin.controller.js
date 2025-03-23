import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { sendToken } from "../utils/sendToken.js";
import Event from "../models/event.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log(email, password);
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
