import mongoose from "mongoose";
import { aiEngine } from "../services/ai.service.js";
import { sendSuccess } from "../utils/ApiResponse.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

export const health = asyncHandler(async (_req, res) => {
  const mongoReady = mongoose.connection.readyState === 1;
  const ai = await aiEngine.health();

  return sendSuccess(res, {
    data: {
      status: mongoReady ? "ok" : "degraded",
      service: "klyptic-backend",
      mongo: mongoReady ? "up" : "down",
      aiEngine: ai ? "up" : "down",
      timestamp: new Date().toISOString(),
    },
  });
});
