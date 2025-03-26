import express from "express";
import { isAuthenticated } from "../middlewares/auth.middleware.js";
import {login, logout, 
    approveEvent, rejectEvent,
     getPendingEvents, getPastEvents, getUsersByCity
    , getCityDetails, getStats,
    usersListByIds, userById, getEvents,
    warnOrganizer, removeOrganizer,
    getAllEventSummaries,
    getEventSummaryById,
    promoteToOrganiser} from "../controllers/admin.controller.js";
import { getFeedbacksForEvent } from "../controllers/event.controller.js";
import { analyze } from "../controllers/analyze.controller.js";
const router = express.Router();


router.post("/login", login);
router.get("/logout", isAuthenticated, logout);
router.post("/approve/:eventId",  approveEvent);
router.post("/promote-organiser", promoteToOrganiser);

router.get("/pending-events", getPendingEvents);
router.get("/past-events", getPastEvents);
router.get("/city-volunteers", getUsersByCity);
router.get("/city-details/:city", getCityDetails);
router.get("/stats", getStats);
router.get("/users", usersListByIds);
router.get("/eventSummaries", getAllEventSummaries);
router.get("/eventSummaries/:id", getEventSummaryById);
router.get("/getFeedbacksForEvent",getFeedbacksForEvent);
router.get("/analyze/:eventId",analyze)
router.get("/user/:userId", userById);
router.post("/getEvents", getEvents);
router.post("/warn-organizer", warnOrganizer);
router.put("/remove-organizer/:id", removeOrganizer);

router.post("/reject/:eventId",  rejectEvent);
export default router;