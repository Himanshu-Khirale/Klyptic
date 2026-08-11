import { ZodError } from "zod";
import { ApiError } from "../utils/ApiError.js";
import { env } from "../config/env.js";

export function notFoundHandler(req, _res, next) {
  next(
    new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`, {
      code: "NOT_FOUND",
    }),
  );
}

export function errorHandler(err, _req, res, _next) {
  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      code: "VALIDATION_ERROR",
      details: err.flatten(),
    });
  }

  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      code: err.code,
      details: err.details ?? undefined,
    });
  }

  if (err?.name === "ValidationError" && err.errors) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      code: "MONGOOSE_VALIDATION",
      details: err.errors,
    });
  }

  if (err?.code === 11000) {
    const fields = Object.keys(err.keyPattern || {});
    return res.status(409).json({
      success: false,
      message: `Duplicate value for ${fields.join(", ") || "field"}`,
      code: "DUPLICATE_KEY",
    });
  }

  if (err?.name === "CastError") {
    return res.status(400).json({
      success: false,
      message: "Invalid identifier",
      code: "INVALID_ID",
    });
  }

  if (err?.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({
      success: false,
      message: "Uploaded file exceeds size limit",
      code: "FILE_TOO_LARGE",
    });
  }

  console.error("[error]", err);

  return res.status(500).json({
    success: false,
    message: env.NODE_ENV === "production" ? "Internal server error" : err.message,
    code: "INTERNAL_ERROR",
  });
}
