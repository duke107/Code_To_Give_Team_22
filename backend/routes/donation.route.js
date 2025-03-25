import { Router } from "express";
import makeDonation, { getDonationsForAdmin, getDonations, getDonors }  from "../controllers/donation.controller.js";
import { isAuthenticated } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/", isAuthenticated, makeDonation);
router.get("/fetch", isAuthenticated, getDonations);
router.get("/fetchAdmin", getDonationsForAdmin);
router.get("/donors", isAuthenticated, getDonors);

export default router;
