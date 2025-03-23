import express from "express";

import { isAuthenticated } from "../middlewares/auth.middleware.js";
import { createEvent, deleteEvent, getEventBySlug, getEvents, updateEvent, registerVolunteer, assignTask, updateTaskStatus, createFeedback, getFeedbacksForEvent } from "../controllers/event.controller.js";

const router = express.Router();

// Create event
router.post("/create",isAuthenticated, createEvent);
router.post("/assign",isAuthenticated, assignTask);
router.post("/submitFeedback",isAuthenticated,createFeedback)
router.get("/getEvents",isAuthenticated, getEvents);
router.get("/feedbacks",isAuthenticated, getFeedbacksForEvent );
// Get event by slug
router.get("/:slug",isAuthenticated, getEventBySlug);

// Register volunteer by slug
router.post("/:slug", isAuthenticated, registerVolunteer);
// Update event by ID
router.put("/:eventId",isAuthenticated, updateEvent);
router.patch("/updateTask/:taskId",isAuthenticated,updateTaskStatus)


// Delete event by ID
router.delete("/:eventId",isAuthenticated, deleteEvent);


export default router;
