import { CAPTURE_TYPES } from "../config/constants.js";

/**
 * Maps Quick Capture modal kinds → KnowledgeItem CaptureType used by the frontend.
 * @param {string} kind
 * @returns {typeof CAPTURE_TYPES[number]}
 */
export function mapCaptureKindToType(kind) {
  const map = {
    text: "note",
    pdf: "pdf",
    image: "screenshot",
    url: "article",
    youtube: "video",
    docs: "article",
    code: "code",
    note: "note",
    repo: "repo",
    chat: "chat",
  };

  const type = map[kind];
  if (!type || !CAPTURE_TYPES.includes(type)) {
    return "note";
  }
  return type;
}

/**
 * Infer a human-readable source label from kind + URL/filename.
 */
export function inferSource({ kind, url, originalName }) {
  if (kind === "youtube") return "YouTube";
  if (kind === "docs") return "Documentation";
  if (kind === "image") return "Screenshot";
  if (kind === "pdf") return originalName || "PDF";
  if (kind === "code") return "Code snippet";
  if (kind === "chat") return "Chat";
  if (kind === "repo") return "GitHub";
  if (url) {
    try {
      return new URL(url).hostname.replace(/^www\./, "");
    } catch {
      return "Web";
    }
  }
  if (kind === "text" || kind === "note") return "Personal note";
  return "Capture";
}
