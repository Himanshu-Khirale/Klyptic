import mongoose from "mongoose";
import { KnowledgeItem } from "../models/KnowledgeItem.js";
import { toKnowledgeDto } from "../utils/serializers.js";
import { ApiError } from "../utils/ApiError.js";

const TOPIC_COLORS = [
  "oklch(0.62 0.16 42)",
  "oklch(0.55 0.09 200)",
  "oklch(0.65 0.08 145)",
  "oklch(0.7 0.12 85)",
  "oklch(0.5 0.1 300)",
];

function toObjectId(userId) {
  return typeof userId === "string" ? new mongoose.Types.ObjectId(userId) : userId;
}

export async function listTopics(userId) {
  const rows = await KnowledgeItem.aggregate([
    { $match: { userId: toObjectId(userId) } },
    { $group: { _id: "$topic", count: { $sum: 1 } } },
    { $sort: { count: -1, _id: 1 } },
  ]);

  return rows.map((row, index) => ({
    name: row._id,
    count: row.count,
    color: TOPIC_COLORS[index % TOPIC_COLORS.length],
  }));
}

export async function getTopicItems(userId, name) {
  const items = await KnowledgeItem.find({ userId, topic: name }).sort({ capturedAt: -1 });
  if (items.length === 0) {
    const exists = await KnowledgeItem.exists({ userId, topic: name });
    if (!exists) {
      // Still return empty list for unknown topic — frontend handles empty state.
    }
  }

  return {
    name,
    count: items.length,
    items: items.map(toKnowledgeDto),
  };
}

export async function getSidebarTopics(userId, limit = 5) {
  const topics = await listTopics(userId);
  return topics.slice(0, limit);
}

export async function requireTopic(userId, name) {
  const count = await KnowledgeItem.countDocuments({ userId, topic: name });
  if (count === 0) {
    throw new ApiError(404, "Topic not found", { code: "TOPIC_NOT_FOUND" });
  }
  return getTopicItems(userId, name);
}
