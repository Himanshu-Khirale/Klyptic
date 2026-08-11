import * as searchService from "../services/search.service.js";
import { sendSuccess } from "../utils/ApiResponse.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { validated } from "../middleware/validate.js";

export const search = asyncHandler(async (req, res) => {
  const data = await searchService.semanticSearch(req.auth.userId, validated(req, "query"));
  return sendSuccess(res, { data });
});
