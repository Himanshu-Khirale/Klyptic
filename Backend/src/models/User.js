import mongoose from "mongoose";

const notificationPrefsSchema = new mongoose.Schema(
  {
    weeklySummaryEmail: { type: Boolean, default: true },
    revisionReminders: { type: Boolean, default: true },
    newConnections: { type: Boolean, default: false },
  },
  { _id: false },
);

const appearancePrefsSchema = new mongoose.Schema(
  {
    theme: { type: String, enum: ["light", "dark", "system"], default: "dark" },
    reducedMotion: { type: Boolean, default: false },
    compactDensity: { type: Boolean, default: false },
  },
  { _id: false },
);

const privacyPrefsSchema = new mongoose.Schema(
  {
    improveProduct: { type: Boolean, default: false },
    shareAnonymousUsage: { type: Boolean, default: true },
  },
  { _id: false },
);

const preferencesSchema = new mongoose.Schema(
  {
    notifications: { type: notificationPrefsSchema, default: () => ({}) },
    appearance: { type: appearancePrefsSchema, default: () => ({}) },
    privacy: { type: privacyPrefsSchema, default: () => ({}) },
    defaultModel: { type: String, default: "klyptic-medium" },
  },
  { _id: false },
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 254,
    },
    passwordHash: { type: String, required: true, select: false },
    handle: {
      type: String,
      trim: true,
      lowercase: true,
      maxlength: 40,
      unique: true,
      sparse: true,
    },
    avatarUrl: { type: String, default: null },
    plan: {
      type: String,
      enum: ["free", "pro"],
      default: "free",
    },
    preferences: {
      type: preferencesSchema,
      default: () => ({}),
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export const User = mongoose.model("User", userSchema);
