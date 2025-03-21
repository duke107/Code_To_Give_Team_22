import express from "express";
import { 
    applyForEvent, 
    getEventApplications, 
} from "../controllers/application.controller.js";

import { isAuthenticated } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/", isAuthenticated, applyForEvent);
router.get("/:eventId", isAuthenticated, getEventApplications);

export default router;
