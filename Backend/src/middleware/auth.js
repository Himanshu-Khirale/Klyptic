import { ApiError } from "../utils/ApiError.js";
import { verifyAccessToken } from "../utils/jwt.js";
import { User } from "../models/User.js";
import { asyncHandler } from "./asyncHandler.js";

export const requireAuth = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    throw new ApiError(401, "Authentication required", { code: "UNAUTHORIZED" });
  }

  const token = header.slice(7).trim();
  if (!token) {
    throw new ApiError(401, "Authentication required", { code: "UNAUTHORIZED" });
  }

  let payload;
  try {
    payload = verifyAccessToken(token);
  } catch {
    throw new ApiError(401, "Invalid or expired token", { code: "INVALID_TOKEN" });
  }

  const user = await User.findById(payload.userId);
  if (!user) {
    throw new ApiError(401, "User no longer exists", { code: "USER_NOT_FOUND" });
  }

  req.user = user;
  req.auth = { userId: String(user._id), email: user.email };
  next();
});
