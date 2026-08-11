import * as insightsService from "../services/insights.service.js";
import { sendSuccess } from "../utils/ApiResponse.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

export const getInsights = asyncHandler(async (req, res) => {
  const data = await insightsService.getInsights(req.auth.userId);
  return sendSuccess(res, { data });
});
