import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import * as dashboardController from "../controllers/dashboard.controller.js";

const router = Router();

router.get("/", requireAuth, dashboardController.getDashboard);

export default router;
