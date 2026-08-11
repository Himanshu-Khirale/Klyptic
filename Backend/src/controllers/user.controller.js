import * as userService from "../services/user.service.js";
import { sendSuccess } from "../utils/ApiResponse.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

export const updateProfile = asyncHandler(async (req, res) => {
  const data = await userService.updateProfile(req.auth.userId, req.body);
  return sendSuccess(res, { message: "Profile updated", data });
});

export const updatePreferences = asyncHandler(async (req, res) => {
  const data = await userService.updatePreferences(req.auth.userId, req.body);
  return sendSuccess(res, { message: "Preferences updated", data });
});

export const exportData = asyncHandler(async (req, res) => {
  const format = req.query.format === "markdown" ? "markdown" : "json";
  const data = await userService.exportLibrary(req.auth.userId, format);

  if (format === "markdown") {
    res.setHeader("Content-Type", "text/markdown; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="${data.filename}"`);
    return res.status(200).send(data.content);
  }

  return sendSuccess(res, { data });
});

export const deleteWorkspace = asyncHandler(async (req, res) => {
  const data = await userService.deleteWorkspace(req.auth.userId);
  return sendSuccess(res, { message: "Workspace deleted", data });
});
