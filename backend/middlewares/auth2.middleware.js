import { Volunteer } from "../models/volunteer.model.js";
import jwt from "jsonwebtoken";
export const isAuthenticated = async (req, res, next) => {
    const { token } = req.cookies;
    if(!token) {
        return res.status(401).json({
            success: false,
            messsage: "Volunteer is not authenticated"
        });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.id = decoded.id;  // Attach volunteer ID to request object
        return next();
    } catch (error) {
        return res.status(401).json({ 
            success: false, 
            message: "Invalid token" 
        });
    }
};
        
