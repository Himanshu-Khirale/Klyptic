import mongoose from "mongoose";
import { CAPTURE_TYPES, KNOWLEDGE_STATUS } from "../config/constants.js";

const knowledgeItemSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: { type: String, required: true, trim: true, maxlength: 500 },
    source: { type: String, required: true, trim: true, maxlength: 300 },
    topic: { type: String, required: true, trim: true, maxlength: 120, default: "General" },
    type: {
      type: String,
      enum: CAPTURE_TYPES,
      required: true,
      index: true,
    },
    preview: { type: String, default: "", maxlength: 5000 },
    summary: { type: String, default: "", maxlength: 10000 },
    takeaways: {
      type: [String],
      default: [],
      validate: {
        validator: (arr) => arr.length <= 50,
        message: "Too many takeaways",
      },
    },
    related: {
      type: [String],
      default: [],
    },
    url: { type: String, default: null },
    originalContent: { type: String, default: "" },
    captureKind: { type: String, default: "text" },
    status: {
      type: String,
      enum: KNOWLEDGE_STATUS,
      default: "pending",
      index: true,
    },
    filePath: { type: String, default: null },
    fileName: { type: String, default: null },
    fileMime: { type: String, default: null },
    fileSize: { type: Number, default: null },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    aiError: { type: String, default: null },
    capturedAt: { type: Date, default: Date.now, index: true },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

knowledgeItemSchema.index({ userId: 1, capturedAt: -1 });
knowledgeItemSchema.index({ userId: 1, topic: 1 });
knowledgeItemSchema.index({ userId: 1, type: 1 });
knowledgeItemSchema.index(
  { title: "text", preview: "text", summary: "text", topic: "text", originalContent: "text" },
  { name: "knowledge_text_index" },
);

export const KnowledgeItem = mongoose.model("KnowledgeItem", knowledgeItemSchema);
