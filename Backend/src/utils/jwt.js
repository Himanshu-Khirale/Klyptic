import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

/**
 * @param {{ userId: string, email: string }} payload
 */
export function signAccessToken(payload) {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  });
}

/**
 * @param {string} token
 */
export function verifyAccessToken(token) {
  return jwt.verify(token, env.JWT_SECRET);
}
