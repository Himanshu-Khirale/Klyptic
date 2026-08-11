import * as dashboardService from "../services/dashboard.service.js";
import { sendSuccess } from "../utils/ApiResponse.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

export const getDashboard = asyncHandler(async (req, res) => {
  const data = await dashboardService.getDashboard(req.auth.userId);
  return sendSuccess(res, { data });
});
