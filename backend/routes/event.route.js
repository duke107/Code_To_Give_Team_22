import express from "express";

import { isAuthenticated } from "../middlewares/auth.middleware.js";
import { createEvent, deleteEvent, getEventBySlug, getEvents, updateEvent, registerVolunteer, assignTask, updateTaskStatus, createFeedback, getFeedbacksForEvent, submitTestimonial, getRecentTestimonials, createEventSummary, getTasksUser, getEventsUser, submitTaskProof, approveTaskProof, rejectTaskProof, getAllDonations, searchEvents, addTaskUpdate, getTaskUpdates } from "../controllers/event.controller.js";


const router = express.Router();
// Create event
router.post("/create",isAuthenticated, createEvent);
router.put("/update/:eventId",isAuthenticated, updateEvent);
router.post("/assign",isAuthenticated, assignTask);
router.post("/submitFeedback",isAuthenticated,createFeedback)
router.post("/submitTestimonial",isAuthenticated,submitTestimonial)
router.post("/proof/:taskId",isAuthenticated, submitTaskProof);
router.post('/taskUpdate/:taskId', addTaskUpdate);
router.get('/taskUpdates/:taskId', getTaskUpdates);
router.get("/getAllDonations",isAuthenticated,getAllDonations)
router.get("/getEvents", isAuthenticated, getEvents);
router.get("/getEventsUser",isAuthenticated, getEventsUser);
router.get("/getTasksUser",isAuthenticated, getTasksUser);
router.get("/feedbacks",isAuthenticated, getFeedbacksForEvent );
router.get("/getRecentTestimonials",isAuthenticated, getRecentTestimonials);
router.get("/search", searchEvents);
// Get event by slug
router.get("/:slug",isAuthenticated, getEventBySlug);
router.post('/summary', isAuthenticated, createEventSummary);
// Register volunteer by slug
router.post("/:slug", isAuthenticated, registerVolunteer);
// Update event by ID
router.put("/:eventId",isAuthenticated, updateEvent);
router.patch("/updateTask/:taskId",isAuthenticated,updateTaskStatus)
router.patch("/proof/approve/:taskId",isAuthenticated,approveTaskProof)
router.patch("/proof/reject/:taskId",isAuthenticated,rejectTaskProof)

// Delete event by ID
router.delete("/:eventId",isAuthenticated, deleteEvent);


export default router;
