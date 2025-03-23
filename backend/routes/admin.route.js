import express from "express";
import { isAuthenticated } from "../middlewares/auth.middleware.js";
import {login, logout, approveEvent, rejectEvent} from "../controllers/admin.controller.js";
const router = express.Router();


router.post("/login", login);
router.get("/logout", isAuthenticated, logout);
router.get("/approve/:eventId", isAuthenticated, approveEvent);
router.get("/reject/:eventId", isAuthenticated, rejectEvent);

export default router;