import { z } from "zod";
import {
  CAPTURE_INPUT_KINDS,
  CAPTURE_TYPES,
  DEFAULT_PAGE_LIMIT,
  MAX_PAGE_LIMIT,
} from "../config/constants.js";

export const listKnowledgeSchema = z.object({
  type: z.enum(["all", ...CAPTURE_TYPES]).optional().default("all"),
  topic: z.string().trim().max(120).optional(),
  q: z.string().trim().max(500).optional().default(""),
  sort: z.enum(["recent", "oldest", "title"]).optional().default("recent"),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce
    .number()
    .int()
    .positive()
    .max(MAX_PAGE_LIMIT)
    .optional()
    .default(DEFAULT_PAGE_LIMIT),
});

export const createKnowledgeSchema = z.object({
  title: z.string().trim().min(1).max(500).optional(),
  content: z.string().trim().min(1).max(200_000),
  type: z.enum(CAPTURE_TYPES).optional().default("note"),
  topic: z.string().trim().max(120).optional(),
  source: z.string().trim().max(300).optional(),
  url: z.string().url().optional(),
});

export const captureSchema = z.object({
  kind: z.enum(CAPTURE_INPUT_KINDS),
  content: z.string().trim().max(200_000).optional().default(""),
  url: z.string().url().optional(),
  title: z.string().trim().max(500).optional(),
  topic: z.string().trim().max(120).optional(),
});

export const updateKnowledgeSchema = z
  .object({
    title: z.string().trim().min(1).max(500).optional(),
    topic: z.string().trim().max(120).optional(),
    preview: z.string().max(5000).optional(),
    summary: z.string().max(10000).optional(),
    takeaways: z.array(z.string().max(500)).max(50).optional(),
    related: z.array(z.string().max(120)).max(50).optional(),
    url: z.string().url().nullable().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
  });

export const knowledgeIdSchema = z.object({
  id: z.string().regex(/^[a-fA-F0-9]{24}$/, "Invalid knowledge id"),
});
