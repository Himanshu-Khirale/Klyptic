import mongoose from "mongoose";
import { KnowledgeItem } from "../models/KnowledgeItem.js";
import { User } from "../models/User.js";
import { toKnowledgeDto, toUserDto } from "../utils/serializers.js";
import { ApiError } from "../utils/ApiError.js";

function toObjectId(userId) {
  return typeof userId === "string" ? new mongoose.Types.ObjectId(userId) : userId;
}

function startOfWeek(date = new Date()) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? 6 : day - 1;
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - diff);
  return d;
}

function pctDelta(current, previous) {
  if (previous === 0) return current > 0 ? "+100%" : "0%";
  const delta = Math.round(((current - previous) / previous) * 100);
  return `${delta >= 0 ? "+" : ""}${delta}%`;
}

export async function getDashboard(userId) {
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found", { code: "USER_NOT_FOUND" });
  }

  const oid = toObjectId(userId);
  const weekStart = startOfWeek();
  const prevWeekStart = new Date(weekStart);
  prevWeekStart.setDate(prevWeekStart.getDate() - 7);

  const [
    total,
    typeCounts,
    recent,
    weekItems,
    prevWeekCount,
    topicCount,
    connectionsEstimate,
  ] = await Promise.all([
    KnowledgeItem.countDocuments({ userId: oid }),
    KnowledgeItem.aggregate([
      { $match: { userId: oid } },
      { $group: { _id: "$type", count: { $sum: 1 } } },
    ]),
    KnowledgeItem.find({ userId: oid }).sort({ capturedAt: -1 }).limit(5),
    KnowledgeItem.find({ userId: oid, capturedAt: { $gte: weekStart } }).sort({
      capturedAt: -1,
    }),
    KnowledgeItem.countDocuments({
      userId: oid,
      capturedAt: { $gte: prevWeekStart, $lt: weekStart },
    }),
    KnowledgeItem.distinct("topic", { userId: oid }),
    KnowledgeItem.aggregate([
      { $match: { userId: oid } },
      { $project: { relatedCount: { $size: { $ifNull: ["$related", []] } } } },
      { $group: { _id: null, total: { $sum: "$relatedCount" } } },
    ]),
  ]);

  const byType = Object.fromEntries(typeCounts.map((t) => [t._id, t.count]));
  const weekCount = weekItems.length;
  const weekTopics = new Set(weekItems.map((i) => i.topic)).size;
  const connections = connectionsEstimate[0]?.total ?? 0;

  const revisit = await KnowledgeItem.find({
    userId: oid,
    capturedAt: { $lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
  })
    .sort({ capturedAt: 1 })
    .limit(3);

  const greetingHour = new Date().getHours();
  const greeting =
    greetingHour < 12 ? "Good morning" : greetingHour < 18 ? "Good afternoon" : "Good evening";

  return {
    user: toUserDto(user),
    greeting: `${greeting}, ${user.name.split(" ")[0]}.`,
    dateLabel: new Date().toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    }),
    newThisWeek: weekCount,
    stats: {
      total,
      documents: (byType.pdf || 0) + (byType.note || 0) + (byType.code || 0),
      videos: byType.video || 0,
      articles: byType.article || 0,
      screenshots: byType.screenshot || 0,
      byType,
    },
    weeklyInsights: [
      {
        label: "Items captured",
        value: String(weekCount),
        delta: pctDelta(weekCount, prevWeekCount),
      },
      {
        label: "Topics explored",
        value: String(weekTopics),
        delta: weekTopics > 0 ? `+${weekTopics}` : "0",
      },
      {
        label: "Reading time saved",
        value: `${(weekCount * 0.25).toFixed(1)}h`,
        delta: weekCount > prevWeekCount ? "+18%" : "0%",
      },
      {
        label: "Connections found",
        value: String(connections),
        delta: connections > 0 ? `+${Math.min(connections, 99)}` : "0",
      },
    ],
    recentCaptures: recent.map(toKnowledgeDto),
    worthRevisiting: revisit.map(toKnowledgeDto),
    topicCount: topicCount.length,
  };
}
