import fs from "node:fs/promises";
import path from "node:path";
import { KnowledgeItem } from "../models/KnowledgeItem.js";
import { ApiError } from "../utils/ApiError.js";
import { mapCaptureKindToType, inferSource } from "../utils/mapCaptureType.js";
import { estimateReadMeta } from "../utils/date.js";
import { toKnowledgeDto } from "../utils/serializers.js";
import { aiEngine } from "./ai.service.js";
import { uploadsRoot } from "../middleware/upload.js";
import { enqueueAiJob } from "../utils/aiQueue.js";

// ─────────────────────────────────────────────────────────────────────────────
// Internal helpers
// ─────────────────────────────────────────────────────────────────────────────

function deriveTitle(content, fallback = "Untitled capture") {
  const line = content
    .trim()
    .split(/\r?\n/)
    .map((l) => l.trim())
    .find(Boolean);
  if (!line) return fallback;
  return line.length > 120 ? `${line.slice(0, 117)}…` : line;
}

function derivePreview(content, max = 400) {
  const cleaned = content.replace(/\s+/g, " ").trim();
  if (!cleaned) return "";
  return cleaned.length > max ? `${cleaned.slice(0, max - 1)}…` : cleaned;
}

/**
 * Builds the payload object sent to the FastAPI AI engine for ingestion.
 * Kept separate so all three creation paths (create, capture, upload) are consistent.
 */
function buildIngestPayload(item) {
  return {
    knowledgeId: String(item._id),
    userId: String(item.userId),
    title: item.title,
    type: item.type,
    captureKind: item.captureKind,
    url: item.url,
    content: item.originalContent,
    filePath: item.filePath ? path.join(uploadsRoot, path.basename(item.filePath)) : null,
    fileName: item.fileName,
    fileMime: item.fileMime,
    topic: item.topic,
  };
}

/**
 * AI Enrichment Job
 * -----------------
 * This is the function that runs inside the p-queue background job.
 * It transitions the item through processing → completed/failed states.
 *
 * The Express request handler DOES NOT await this function.
 * It is enqueued and runs asynchronously after the HTTP response is sent.
 */
async function applyAiEnrichment(item, userId) {
  const knowledgeId = String(item._id);

  // Transition: pending → processing
  item.status = "processing";
  await item.save();

  const result = await aiEngine.ingest(userId, buildIngestPayload(item));

  if (!result) {
    // AI engine is down or returned null — graceful fallback
    if (!item.summary) {
      item.summary =
        item.preview ||
        "Saved to your library. AI enrichment will run when the AI engine is available.";
    }
    if (!item.takeaways?.length && item.preview) {
      item.takeaways = [item.preview.slice(0, 160)];
    }
    // Mark completed so the user doesn't see a broken state
    item.status = "completed";
    item.aiError = "AI engine unavailable during enrichment";
    await item.save();
    console.warn(`[KNOWLEDGE_SERVICE] AI engine returned null for knowledgeId=${knowledgeId}`);
    return item;
  }

  // Apply enrichment results from the AI engine
  if (result.title) item.title = result.title;
  if (result.summary) item.summary = result.summary;
  if (result.preview) item.preview = result.preview;
  if (Array.isArray(result.takeaways)) item.takeaways = result.takeaways;
  if (Array.isArray(result.related)) item.related = result.related;
  if (result.topic) item.topic = result.topic;
  if (result.source) item.source = result.source;
  if (result.metadata) {
    item.metadata = { ...item.metadata, ...result.metadata };
  }

  // The AI engine now returns "completed" or "failed" as the status
  item.status = result.status === "failed" ? "failed" : "completed";
  item.aiError = result.error || null;
  await item.save();

  console.info(
    `[KNOWLEDGE_SERVICE] AI enrichment finished | knowledgeId=${knowledgeId} | status=${item.status}`,
  );
  return item;
}

/**
 * Enqueues the AI enrichment job for background processing.
 * The caller does NOT await this — it fires and forgets.
 * The queue handles retries and final failure marking.
 *
 * On permanent failure (after all retries), the item's status is set to "failed"
 * and the error message is stored in aiError.
 */
function scheduleEnrichment(item, userId) {
  const knowledgeId = String(item._id);

  enqueueAiJob(
    async () => {
      await applyAiEnrichment(item, userId);
    },
    knowledgeId,
    // Called only when all retries are exhausted — marks MongoDB doc as failed
    async (finalErr) => {
      try {
        await KnowledgeItem.findByIdAndUpdate(knowledgeId, {
          status: "failed",
          aiError: `All retries exhausted: ${finalErr?.message || "Unknown error"}`,
        });
      } catch (dbErr) {
        console.error(
          `[KNOWLEDGE_SERVICE] Could not mark item ${knowledgeId} as failed:`,
          dbErr.message,
        );
      }
    },
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Public service methods
// ─────────────────────────────────────────────────────────────────────────────

export async function listKnowledge(userId, query) {
  const filter = { userId };

  if (query.type && query.type !== "all") {
    filter.type = query.type;
  }
  if (query.topic) {
    filter.topic = query.topic;
  }
  if (query.q) {
    filter.$or = [
      { title: { $regex: query.q, $options: "i" } },
      { topic: { $regex: query.q, $options: "i" } },
      { preview: { $regex: query.q, $options: "i" } },
      { summary: { $regex: query.q, $options: "i" } },
    ];
  }

  const sortMap = {
    recent: { capturedAt: -1 },
    oldest: { capturedAt: 1 },
    title: { title: 1 },
  };

  const skip = (query.page - 1) * query.limit;
  const [items, total] = await Promise.all([
    KnowledgeItem.find(filter).sort(sortMap[query.sort]).skip(skip).limit(query.limit),
    KnowledgeItem.countDocuments(filter),
  ]);

  return {
    items: items.map(toKnowledgeDto),
    pagination: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / query.limit)),
    },
  };
}

export async function getKnowledgeById(userId, id) {
  const item = await KnowledgeItem.findOne({ _id: id, userId });
  if (!item) {
    throw new ApiError(404, "Knowledge item not found", { code: "NOT_FOUND" });
  }

  const relatedItems = await KnowledgeItem.find({
    userId,
    topic: item.topic,
    _id: { $ne: item._id },
  })
    .sort({ capturedAt: -1 })
    .limit(5);

  return {
    item: toKnowledgeDto(item),
    relatedItems: relatedItems.map(toKnowledgeDto),
  };
}

export async function createKnowledge(userId, body) {
  const content = body.content;
  const title = body.title || deriveTitle(content);
  const preview = derivePreview(content);
  const meta = estimateReadMeta(content);

  const item = await KnowledgeItem.create({
    userId,
    title,
    source: body.source || "Personal note",
    topic: body.topic || "General",
    type: body.type || "note",
    preview,
    summary: "",
    takeaways: [],
    related: [],
    url: body.url || null,
    originalContent: content,
    captureKind: "text",
    status: "pending",
    metadata: meta,
    capturedAt: new Date(),
  });

  // ── Fire-and-forget: enqueue AI enrichment asynchronously ────────────────
  scheduleEnrichment(item, userId);

  // Return immediately with the pending item — AI processes in the background
  return toKnowledgeDto(item);
}

export async function captureKnowledge(userId, body) {
  const kind = body.kind;
  const type = mapCaptureKindToType(kind);

  if (["url", "youtube", "docs"].includes(kind) && !body.url) {
    throw new ApiError(400, "URL is required for this capture kind", {
      code: "URL_REQUIRED",
    });
  }

  if (["text", "code", "note", "chat"].includes(kind) && !body.content?.trim()) {
    throw new ApiError(400, "Content is required for this capture kind", {
      code: "CONTENT_REQUIRED",
    });
  }

  const content = body.content?.trim() || body.url || "";
  const title =
    body.title ||
    (body.url ? deriveTitle(body.url, "Saved link") : deriveTitle(content));
  const preview = derivePreview(content || body.url || "");
  const source = inferSource({ kind, url: body.url });
  const meta = estimateReadMeta(content);

  const item = await KnowledgeItem.create({
    userId,
    title,
    source,
    topic: body.topic || "General",
    type,
    preview,
    summary: "",
    takeaways: [],
    related: [],
    url: body.url || null,
    originalContent: content,
    captureKind: kind,
    status: "pending",
    metadata: meta,
    capturedAt: new Date(),
  });

  // ── Fire-and-forget: enqueue AI enrichment asynchronously ────────────────
  scheduleEnrichment(item, userId);

  // Return immediately — frontend receives the item with status="pending"
  return toKnowledgeDto(item);
}

export async function uploadKnowledge(userId, file, fields = {}) {
  if (!file) {
    throw new ApiError(400, "File is required", { code: "FILE_REQUIRED" });
  }

  const kind = fields.kind === "pdf" || file.mimetype === "application/pdf" ? "pdf" : "image";
  const type = mapCaptureKindToType(kind);
  const title = fields.title?.trim() || file.originalname || "Uploaded file";

  const item = await KnowledgeItem.create({
    userId,
    title,
    source: inferSource({ kind, originalName: file.originalname }),
    topic: fields.topic || "General",
    type,
    preview: `Uploaded ${file.originalname}`,
    summary: "",
    takeaways: [],
    related: [],
    url: null,
    originalContent: "",
    captureKind: kind,
    status: "pending",
    filePath: path.basename(file.path),
    fileName: file.originalname,
    fileMime: file.mimetype,
    fileSize: file.size,
    metadata: { words: 0, readTime: "—" },
    capturedAt: new Date(),
  });

  // ── Fire-and-forget: enqueue AI enrichment asynchronously ────────────────
  // Large files (PDFs, images) no longer block the HTTP response.
  scheduleEnrichment(item, userId);

  // Return immediately — Express responds with 200 while AI processes in background
  return toKnowledgeDto(item);
}

export async function updateKnowledge(userId, id, body) {
  const item = await KnowledgeItem.findOneAndUpdate(
    { _id: id, userId },
    { $set: body },
    { new: true, runValidators: true },
  );

  if (!item) {
    throw new ApiError(404, "Knowledge item not found", { code: "NOT_FOUND" });
  }

  return toKnowledgeDto(item);
}

export async function deleteKnowledge(userId, id) {
  const item = await KnowledgeItem.findOneAndDelete({ _id: id, userId });
  if (!item) {
    throw new ApiError(404, "Knowledge item not found", { code: "NOT_FOUND" });
  }

  // Clean up the uploaded file from disk (if any)
  if (item.filePath) {
    const absolute = path.join(uploadsRoot, path.basename(item.filePath));
    try {
      await fs.unlink(absolute);
    } catch {
      // File may already be gone — safe to ignore
    }
  }

  // Best-effort vector cleanup from ChromaDB (fire-and-forget, never blocks delete)
  await aiEngine.tryRequest("/api/v1/knowledge/delete", {
    userId,
    body: { knowledgeId: String(item._id), userId },
  });

  return { id: String(item._id) };
}
