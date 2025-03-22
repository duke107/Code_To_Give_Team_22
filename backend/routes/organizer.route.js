import express from "express"
import { 
    register, mailVerificationCode, verifyVerificationCode, login, 
    getOrganizer, mailPasswordReset, verifyPasswordReset, logout,
    
} from "../controllers/organizer.controller.js";
import { isAuthenticated } from "../middlewares/auth2.middleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/mail-verification-code", mailVerificationCode);
router.post("/verify-verification-code", verifyVerificationCode);
// router.post("/send-approve-request", isAuthenticated, sendApproveRequest);
router.post("/login", login);
router.get("/logout", isAuthenticated, logout);
router.get("/profile", isAuthenticated, getOrganizer);
router.post("/password/forgot", mailPasswordReset);
router.put("/password/reset/:token", verifyPasswordReset);

export default router;