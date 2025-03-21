import express from "express";
import { 
    createEvent, 
    getEvents, 
    getEventById, 
    updateEvent, 
    deleteEvent 
} from "../controllers/event.controller.js";

import { isAuthenticated } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/", isAuthenticated, createEvent);
router.get("/", isAuthenticated, getEvents);
router.get("/:eventId", isAuthenticated, getEventById);
router.patch("/:eventId", isAuthenticated, updateEvent);
router.delete("/:eventId", isAuthenticated, deleteEvent);

export default router;
