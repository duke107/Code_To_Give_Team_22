import { Router } from "express";
import { analyze } from "../controllers/analyze.controller.js";

const router = Router();

router.get("/:eventId", analyze);

export default router;