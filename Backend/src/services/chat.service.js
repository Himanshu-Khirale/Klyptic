import mongoose from "mongoose";
import { KnowledgeItem } from "../models/KnowledgeItem.js";
import { toKnowledgeDto } from "../utils/serializers.js";
import { aiEngine } from "./ai.service.js";
import { ApiError } from "../utils/ApiError.js";

const SUGGESTED_FALLBACKS = [
  "Summarize everything I saved this week",
  "What topics am I learning most about?",
  "Show me connections between my recent captures",
  "What should I revisit from last month?",
];

function toObjectId(userId) {
  return typeof userId === "string" ? new mongoose.Types.ObjectId(userId) : userId;
}

export async function askLibrary(userId, { message, history }) {
  const aiResult = await aiEngine.tryChat(userId, {
    message,
    history,
    userId,
  });

  if (aiResult?.answer) {
    const refIds = (aiResult.refs || aiResult.references || []).map(String);
    const refs = await KnowledgeItem.find({
      userId,
      _id: { $in: refIds },
    });

    return {
      answer: aiResult.answer,
      refs: refs.map((r) => String(r._id)),
      referencedItems: refs.map(toKnowledgeDto),
      mode: "rag",
    };
  }

  const recent = await KnowledgeItem.find({ userId }).sort({ capturedAt: -1 }).limit(5);
  if (recent.length === 0) {
    throw new ApiError(
      503,
      "AI chat is unavailable and your library is empty. Capture something first, then start the AI engine.",
      { code: "CHAT_UNAVAILABLE" },
    );
  }

  const titles = recent.map((r) => r.title).join("; ");
  return {
    answer: `AI engine is offline, so this is a library preview rather than a full RAG answer. Your latest captures include: ${titles}. Start the FastAPI AI engine to get cited answers from your knowledge base.`,
    refs: recent.slice(0, 2).map((r) => String(r._id)),
    referencedItems: recent.slice(0, 2).map(toKnowledgeDto),
    mode: "fallback",
  };
}

export async function getSuggestedQuestions(userId) {
  const topTopics = await KnowledgeItem.aggregate([
    { $match: { userId: toObjectId(userId) } },
    { $group: { _id: "$topic", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 3 },
  ]);

  if (topTopics.length === 0) {
    return SUGGESTED_FALLBACKS;
  }

  return [
    `Summarize what I learned about ${topTopics[0]._id}`,
    topTopics[1]
      ? `Compare notes on ${topTopics[0]._id} and ${topTopics[1]._id}`
      : SUGGESTED_FALLBACKS[1],
    `What connections exist in my ${topTopics[0]._id} captures?`,
    SUGGESTED_FALLBACKS[3],
  ];
}
