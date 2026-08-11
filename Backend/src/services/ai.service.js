import { env } from "../config/env.js";
import { ApiError } from "../utils/ApiError.js";

/**
 * HTTP client for the FastAPI AI engine.
 * Express owns auth/business data; AI work is delegated here.
 */
class AiEngineClient {
  constructor() {
    this.baseUrl = env.AI_ENGINE_URL.replace(/\/$/, "");
    this.timeoutMs = env.AI_ENGINE_TIMEOUT_MS;
  }

  /**
   * @param {string} path
   * @param {{ method?: string, body?: unknown, userId: string }} options
   */
  async request(path, { method = "POST", body, userId }) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(`${this.baseUrl}${path}`, {
        method,
        headers: {
          "Content-Type": "application/json",
          "X-User-Id": userId,
        },
        body: body === undefined ? undefined : JSON.stringify(body),
        signal: controller.signal,
      });

      const text = await response.text();
      let data = null;
      if (text) {
        try {
          data = JSON.parse(text);
        } catch {
          data = { raw: text };
        }
      }

      if (!response.ok) {
        throw new ApiError(
          502,
          data?.detail || data?.message || "AI engine request failed",
          { code: "AI_ENGINE_ERROR", details: data },
        );
      }

      return data;
    } catch (err) {
      if (err instanceof ApiError) throw err;
      if (err?.name === "AbortError") {
        throw new ApiError(504, "AI engine timed out", { code: "AI_ENGINE_TIMEOUT" });
      }
      throw new ApiError(503, "AI engine unavailable", {
        code: "AI_ENGINE_UNAVAILABLE",
        details: err.message,
      });
    } finally {
      clearTimeout(timer);
    }
  }

  /**
   * Best-effort call — returns null when the engine is down instead of failing the request.
   */
  async tryRequest(path, options) {
    try {
      return await this.request(path, options);
    } catch (err) {
      console.warn(`[ai-engine] ${path} skipped:`, err.message);
      return null;
    }
  }

  ingest(userId, payload) {
    return this.tryRequest("/api/v1/ingest", { userId, body: payload });
  }

  search(userId, payload) {
    return this.tryRequest("/api/v1/search", { userId, body: payload });
  }

  chat(userId, payload) {
    return this.request("/api/v1/chat", { userId, body: payload });
  }

  tryChat(userId, payload) {
    return this.tryRequest("/api/v1/chat", { userId, body: payload });
  }

  insights(userId, payload) {
    return this.tryRequest("/api/v1/insights", { userId, body: payload });
  }

  health() {
    return this.tryRequest("/health", { method: "GET", userId: "system" });
  }
}

export const aiEngine = new AiEngineClient();
