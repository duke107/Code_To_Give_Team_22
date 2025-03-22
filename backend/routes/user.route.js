import express from "express"
import { forgotPassword, getUser, login, logout, register, resetPassword, updatePassword, updateUser, verifyOtp } from "../controllers/user.controller.js";
import { isAuthenticated } from "../middlewares/auth.middleware.js";


const router =express.Router();

router.post('/register',register)
router.post("/verify-otp",verifyOtp)
router.post("/login",login)
router.get("/logout",isAuthenticated, logout)
router.get("/profile",isAuthenticated,getUser)
router.post("/password/forgot",forgotPassword)
router.put("/password/reset/:token",resetPassword)
router.put("/updateUser",updateUser)

router.put("/updatePassword",updatePassword)
export default router;