import express from "express";
import { 
  submitContactMessage, 
  getMessagesForAdmin, 
  replyToMessage, 
  getMessagesForOrganiser, 
  deleteMessage, 
  deleteAllMessages,
  deleteOrgMessage,
  deleteAllOrgMessages
} from "../controllers/contact.controller.js";
import { isAuthenticated, isAdminOrOrganiser } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/submit", submitContactMessage); 
router.post("/reply", replyToMessage);

router.get("/admin/messages", getMessagesForAdmin);
router.delete("/admin/messages/:messageId", deleteMessage);
router.delete("/admin/messages", deleteAllMessages);

router.get("/organiser/messages", isAuthenticated, getMessagesForOrganiser);
router.delete("/organiser/messages/:messageId", isAuthenticated, deleteOrgMessage);
router.delete("/organiser/messages", isAuthenticated, deleteAllOrgMessages);

export default router;


