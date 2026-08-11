import mongoose from "mongoose";
import { KnowledgeItem } from "../models/KnowledgeItem.js";
import { aiEngine } from "./ai.service.js";
import { listTopics } from "./topics.service.js";

function toObjectId(userId) {
  return typeof userId === "string" ? new mongoose.Types.ObjectId(userId) : userId;
}

function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function pctDelta(current, previous) {
  if (previous === 0) return current > 0 ? "+100%" : "0%";
  const delta = Math.round(((current - previous) / previous) * 100);
  return `${delta >= 0 ? "+" : ""}${delta}%`;
}

export async function getInsights(userId) {
  const oid = toObjectId(userId);
  const today = startOfDay(new Date());
  const weekStart = new Date(today);
  weekStart.setDate(weekStart.getDate() - 6);
  const prevWeekStart = new Date(weekStart);
  prevWeekStart.setDate(prevWeekStart.getDate() - 7);

  const dayBuckets = [];
  for (let i = 0; i < 7; i += 1) {
    const day = new Date(weekStart);
    day.setDate(weekStart.getDate() + i);
    const next = new Date(day);
    next.setDate(day.getDate() + 1);
    // Sequential day counts keep the query simple and readable.
    // eslint-disable-next-line no-await-in-loop
    const count = await KnowledgeItem.countDocuments({
      userId: oid,
      capturedAt: { $gte: day, $lt: next },
    });
    dayBuckets.push({
      label: day.toLocaleDateString("en-US", { weekday: "short" }),
      value: count,
    });
  }

  const [topics, weekItems, prevWeekCount, connectionsAgg] = await Promise.all([
    listTopics(userId),
    KnowledgeItem.find({ userId: oid, capturedAt: { $gte: weekStart } }),
    KnowledgeItem.countDocuments({
      userId: oid,
      capturedAt: { $gte: prevWeekStart, $lt: weekStart },
    }),
    KnowledgeItem.aggregate([
      { $match: { userId: oid } },
      { $project: { n: { $size: { $ifNull: ["$related", []] } } } },
      { $group: { _id: null, total: { $sum: "$n" } } },
    ]),
  ]);

  const weekCount = dayBuckets.reduce((sum, d) => sum + d.value, 0);
  const weekTopics = new Set(weekItems.map((i) => i.topic)).size;
  const connections = connectionsAgg[0]?.total ?? 0;
  const topTwo = topics.slice(0, 2).map((t) => t.name);

  const ai = await aiEngine.insights(userId, {
    userId,
    topics: topics.slice(0, 10),
    weekCount,
    prevWeekCount,
  });

  const cards = ai?.cards || [
    {
      title: "Learning trends",
      body:
        topTwo.length > 0
          ? `You've been focusing on ${topTwo.join(" and ")} recently based on capture volume.`
          : "Capture more items to unlock personalized learning trends.",
    },
    {
      title: "Knowledge gaps",
      body: "As your library grows, Klyptic will surface topics that appear connected but underrepresented.",
    },
    {
      title: "Revision suggestions",
      body: "Older captures that link to new ones will appear here for spaced revision.",
    },
  ];

  const weeklySummary =
    ai?.weeklySummary ||
    (weekCount > 0
      ? `This week you captured ${weekCount} item${weekCount === 1 ? "" : "s"}${
          topTwo.length ? ` with focus on ${topTwo.join(" and ")}` : ""
        }. Compared to last week (${prevWeekCount}), volume is ${
          weekCount >= prevWeekCount ? "up" : "down"
        }.`
      : "No captures this week yet. Use Quick Capture to start building your knowledge graph.");

  return {
    weeklyInsights: [
      { label: "Items captured", value: String(weekCount), delta: pctDelta(weekCount, prevWeekCount) },
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
    growth: dayBuckets,
    topics: topics.slice(0, 5),
    cards,
    weeklySummary,
  };
}
