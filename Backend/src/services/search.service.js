import { KnowledgeItem } from "../models/KnowledgeItem.js";
import { toKnowledgeDto } from "../utils/serializers.js";
import { aiEngine } from "./ai.service.js";

export async function semanticSearch(userId, { q, limit }) {
  const aiResult = await aiEngine.search(userId, { query: q, limit, userId });

  if (aiResult?.results?.length) {
    const ids = aiResult.results.map((r) => r.knowledgeId).filter(Boolean);
    const items = await KnowledgeItem.find({
      userId,
      _id: { $in: ids },
    });

    const byId = new Map(items.map((i) => [String(i._id), i]));
    const ordered = ids
      .map((id) => byId.get(String(id)))
      .filter(Boolean)
      .map((doc) => {
        const dto = toKnowledgeDto(doc);
        const hit = aiResult.results.find((r) => String(r.knowledgeId) === String(doc._id));
        return {
          ...dto,
          score: hit?.score,
          snippet: hit?.snippet || dto.preview,
        };
      });

    return {
      query: q,
      mode: "semantic",
      results: ordered,
      count: ordered.length,
    };
  }

  // Fallback: MongoDB text / regex search when AI engine is offline.
  let items = [];
  try {
    items = await KnowledgeItem.find(
      { userId, $text: { $search: q } },
      { score: { $meta: "textScore" } },
    )
      .sort({ score: { $meta: "textScore" } })
      .limit(limit);
  } catch {
    items = [];
  }

  if (items.length === 0) {
    items = await KnowledgeItem.find({
      userId,
      $or: [
        { title: { $regex: q, $options: "i" } },
        { topic: { $regex: q, $options: "i" } },
        { preview: { $regex: q, $options: "i" } },
        { summary: { $regex: q, $options: "i" } },
        { originalContent: { $regex: q, $options: "i" } },
      ],
    })
      .sort({ capturedAt: -1 })
      .limit(limit);
  }

  return {
    query: q,
    mode: "lexical",
    results: items.map((doc) => ({
      ...toKnowledgeDto(doc),
      snippet: doc.preview,
    })),
    count: items.length,
  };
}
