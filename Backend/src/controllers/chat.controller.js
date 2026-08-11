import * as chatService from "../services/chat.service.js";
import { sendSuccess } from "../utils/ApiResponse.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

export const ask = asyncHandler(async (req, res) => {
  const data = await chatService.askLibrary(req.auth.userId, req.body);
  return sendSuccess(res, { data });
});

export const suggestions = asyncHandler(async (req, res) => {
  const data = await chatService.getSuggestedQuestions(req.auth.userId);
  return sendSuccess(res, { data: { suggestions: data } });
});
