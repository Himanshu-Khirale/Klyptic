import * as authService from "../services/auth.service.js";
import { sendSuccess, sendCreated } from "../utils/ApiResponse.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

export const signup = asyncHandler(async (req, res) => {
  const data = await authService.signup(req.body);
  return sendCreated(res, { message: "Account created", data });
});

export const login = asyncHandler(async (req, res) => {
  const data = await authService.login(req.body);
  return sendSuccess(res, { message: "Logged in", data });
});

export const me = asyncHandler(async (req, res) => {
  const data = await authService.getMe(req.auth.userId);
  return sendSuccess(res, { data });
});

export const logout = asyncHandler(async (_req, res) => {
  // JWT is stateless — client discards the token.
  return sendSuccess(res, { message: "Logged out", data: { success: true } });
});
