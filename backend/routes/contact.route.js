import express from "express";
import { 
  submitContactMessage, 
  getMessagesForAdmin, 
  replyToMessage, 
  getMessagesForOrganiser, 
  deleteMessage, 
  deleteAllMessages 
} from "../controllers/contact.controller.js";
import { isAuthenticated, isAdminOrOrganiser } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/submit", submitContactMessage); 
router.post("/reply", isAuthenticated, replyToMessage);

router.get("/admin/messages", isAuthenticated, getMessagesForAdmin);
router.get("/organiser/messages", isAuthenticated, getMessagesForOrganiser);

router.delete("/delete/:messageId", isAuthenticated, isAdminOrOrganiser, deleteMessage);

router.delete("/deleteAll", isAuthenticated, isAdminOrOrganiser, deleteAllMessages);

export default router;
