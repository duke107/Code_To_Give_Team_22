import { Router } from "express";
import makeDonation  from "../controllers/donation.controller.js";
import { isAuthenticated } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/", isAuthenticated, makeDonation);

export default router;
