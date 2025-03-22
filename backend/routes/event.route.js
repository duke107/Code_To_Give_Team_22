import express from "express";

import { isAuthenticated } from "../middlewares/auth.middleware.js";
import { createEvent, deleteEvent, getEventBySlug, getEvents, updateEvent, registerVolunteer } from "../controllers/event.controller.js";

const router = express.Router();

// Create event
router.post("/create",isAuthenticated, createEvent);
router.get("/getEvents",isAuthenticated, getEvents);

// Get event by slug
router.get("/:slug",isAuthenticated, getEventBySlug);
// Register volunteer by slug
router.post("/:slug", isAuthenticated, registerVolunteer);

// Update event by ID
router.put("/:eventId",isAuthenticated, updateEvent);

// Delete event by ID
router.delete("/:eventId",isAuthenticated, deleteEvent);

export default router;
