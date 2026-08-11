import { z } from "zod";

export const updateProfileSchema = z
  .object({
    name: z.string().trim().min(2).max(120).optional(),
    handle: z
      .string()
      .trim()
      .toLowerCase()
      .regex(/^[a-z0-9_]{3,40}$/, "Handle must be 3–40 chars: a-z, 0-9, _")
      .optional(),
    avatarUrl: z.string().url().nullable().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
  });

export const updatePreferencesSchema = z.object({
  notifications: z
    .object({
      weeklySummaryEmail: z.boolean().optional(),
      revisionReminders: z.boolean().optional(),
      newConnections: z.boolean().optional(),
    })
    .optional(),
  appearance: z
    .object({
      theme: z.enum(["light", "dark", "system"]).optional(),
      reducedMotion: z.boolean().optional(),
      compactDensity: z.boolean().optional(),
    })
    .optional(),
  privacy: z
    .object({
      improveProduct: z.boolean().optional(),
      shareAnonymousUsage: z.boolean().optional(),
    })
    .optional(),
  defaultModel: z.string().trim().max(80).optional(),
});

export const topicNameSchema = z.object({
  name: z.string().trim().min(1).max(120),
});
