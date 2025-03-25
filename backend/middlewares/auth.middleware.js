import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken";
export const isAuthenticated = async (req, res, next) => {
    try {
        // console.log("Checking authentication...");
        // console.log("Cookies received:", req.cookies);  // Debug cookies

        const token = req.cookies?.token;

        if (!token) {
            return res.status(401).json({ message: "Unauthorized: No token provided" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // console.log("Decoded token:", decoded);  // Debug JWT payload

        req.user = await User.findById(decoded.id).select("-password");

        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized: User not found" });
        }

        // console.log("Authenticated User:", req.user);
        next();
    } catch (error) {
        console.error("Auth Middleware Error:", error.message);
        res.status(401).json({ message: "Unauthorized" });
    }
};


export const isAdminOrOrganiser = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  if (req.user.role === "Admin" || req.user.role === "Event Organiser") {
    return next();
  }
  return res.status(403).json({ error: "Access denied" });
};
