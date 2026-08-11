import { formatRelativeDate, estimateReadMeta } from "./date.js";

/**
 * Serialize a KnowledgeItem mongoose document for the frontend KnowledgeItem shape.
 * @param {import("mongoose").Document | object} doc
 */
export function toKnowledgeDto(doc) {
  const item = typeof doc.toObject === "function" ? doc.toObject() : doc;
  const content = item.originalContent || item.preview || "";
  const meta = estimateReadMeta(content);

  return {
    id: String(item._id),
    title: item.title,
    source: item.source,
    date: formatRelativeDate(item.capturedAt || item.createdAt),
    capturedAt: item.capturedAt || item.createdAt,
    topic: item.topic,
    type: item.type,
    preview: item.preview,
    summary: item.summary,
    takeaways: item.takeaways ?? [],
    related: item.related ?? [],
    url: item.url || undefined,
    status: item.status,
    metadata: {
      words: item.metadata?.words ?? meta.words,
      readTime: item.metadata?.readTime ?? meta.readTime,
      mimeType: item.fileMime || undefined,
      fileName: item.fileName || undefined,
    },
  };
}

/**
 * @param {import("mongoose").Document | object} user
 */
export function toUserDto(user) {
  const doc = typeof user.toObject === "function" ? user.toObject() : user;
  return {
    id: String(doc._id),
    name: doc.name,
    email: doc.email,
    handle: doc.handle,
    avatarUrl: doc.avatarUrl || null,
    plan: doc.plan,
    initials: getInitials(doc.name),
    preferences: doc.preferences,
    createdAt: doc.createdAt,
  };
}

function getInitials(name = "") {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}
