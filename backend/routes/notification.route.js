import express from "express";
import { 
    sendNotification, 
    getAllNotifications, 
    markNotificationAsRead, 
    deleteNotification 
} from "../controllers/notification.controller.js";

import { isAuthenticated } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/", isAuthenticated, sendNotification);
router.get("/", isAuthenticated, getAllNotifications);
router.patch("/:notificationId/read", isAuthenticated, markNotificationAsRead);
router.delete("/:notificationId", isAuthenticated, deleteNotification);

export default router;
