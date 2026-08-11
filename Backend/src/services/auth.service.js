import { User } from "../models/User.js";
import { ApiError } from "../utils/ApiError.js";
import { hashPassword, comparePassword } from "../utils/password.js";
import { signAccessToken } from "../utils/jwt.js";
import { toUserDto } from "../utils/serializers.js";

function buildAuthPayload(user) {
  const token = signAccessToken({
    userId: String(user._id),
    email: user.email,
  });

  return {
    token,
    user: toUserDto(user),
  };
}

function defaultHandleFromEmail(email) {
  const base = email
    .split("@")[0]
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "")
    .slice(0, 30);
  return base || `user${Date.now().toString(36)}`;
}

export async function signup({ name, email, password }) {
  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    throw new ApiError(409, "Email already registered", { code: "EMAIL_TAKEN" });
  }

  let handle = defaultHandleFromEmail(email);
  const handleTaken = await User.findOne({ handle });
  if (handleTaken) {
    handle = `${handle}${Math.floor(Math.random() * 9000 + 1000)}`;
  }

  const passwordHash = await hashPassword(password);
  const user = await User.create({
    name,
    email: email.toLowerCase(),
    passwordHash,
    handle,
  });

  return buildAuthPayload(user);
}

export async function login({ email, password }) {
  const user = await User.findOne({ email: email.toLowerCase() }).select("+passwordHash");
  if (!user) {
    throw new ApiError(401, "Invalid email or password", { code: "INVALID_CREDENTIALS" });
  }

  const ok = await comparePassword(password, user.passwordHash);
  if (!ok) {
    throw new ApiError(401, "Invalid email or password", { code: "INVALID_CREDENTIALS" });
  }

  return buildAuthPayload(user);
}

export async function getMe(userId) {
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found", { code: "USER_NOT_FOUND" });
  }
  return toUserDto(user);
}
