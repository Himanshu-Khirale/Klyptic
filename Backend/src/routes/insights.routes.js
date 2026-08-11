import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import * as insightsController from "../controllers/insights.controller.js";

const router = Router();

router.get("/", requireAuth, insightsController.getInsights);

export default router;
