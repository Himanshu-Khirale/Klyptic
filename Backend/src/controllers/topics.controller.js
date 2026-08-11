import * as topicsService from "../services/topics.service.js";
import { sendSuccess } from "../utils/ApiResponse.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { validated } from "../middleware/validate.js";

export const list = asyncHandler(async (req, res) => {
  const data = await topicsService.listTopics(req.auth.userId);
  return sendSuccess(res, { data: { topics: data } });
});

export const getByName = asyncHandler(async (req, res) => {
  const { name } = validated(req, "params");
  const data = await topicsService.getTopicItems(req.auth.userId, name);
  return sendSuccess(res, { data });
});
