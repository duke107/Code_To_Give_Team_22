import express from "express";
import { isAuthenticated } from "../middlewares/auth.middleware.js";
import {login, logout, 
    approveEvent, rejectEvent,
     getPendingEvents, getPastEvents, getUsersByCity
    , getCityDetails, getStats,
    usersListByIds, userById} from "../controllers/admin.controller.js";
const router = express.Router();


router.post("/login", login);
router.get("/logout", isAuthenticated, logout);
router.post("/approve/:eventId",  approveEvent);
router.post("/reject/:eventId",  rejectEvent);
router.get("/pending-events", getPendingEvents);
router.get("/past-events", getPastEvents);
router.get("/city-volunteers", getUsersByCity);
router.get("/city-details/:city", getCityDetails);
router.get("/stats", getStats);
router.get("/users", usersListByIds);
router.get("/user/:userId", userById);

export default router;