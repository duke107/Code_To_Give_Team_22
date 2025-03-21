import express from "express";
import { 
    submitFeedback, 
    getEventFeedbacks, 
} from "../controllers/feedback.controller.js";

import { isAuthenticated } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/", isAuthenticated, submitFeedback);
router.get("/:eventId", isAuthenticated, getEventFeedbacks);

export default router;
