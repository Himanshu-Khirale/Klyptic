import { Router } from "express";
import healthRoutes from "./health.routes.js";
import authRoutes from "./auth.routes.js";
import knowledgeRoutes from "./knowledge.routes.js";
import searchRoutes from "./search.routes.js";
import chatRoutes from "./chat.routes.js";
import dashboardRoutes from "./dashboard.routes.js";
import insightsRoutes from "./insights.routes.js";
import topicsRoutes from "./topics.routes.js";
import userRoutes from "./user.routes.js";

const router = Router();

router.use("/health", healthRoutes);
router.use("/auth", authRoutes);
router.use("/knowledge", knowledgeRoutes);
router.use("/search", searchRoutes);
router.use("/chat", chatRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/insights", insightsRoutes);
router.use("/topics", topicsRoutes);
router.use("/users", userRoutes);

export default router;
