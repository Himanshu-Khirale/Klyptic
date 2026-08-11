/**
 * AI Processing Queue
 * -------------------
 * A lightweight, in-memory concurrency queue built on p-queue.
 *
 * Purpose:
 *   Ensure that AI enrichment jobs are processed asynchronously and
 *   never overwhelm the FastAPI AI Engine by running too many requests
 *   simultaneously.
 *
 * Configuration:
 *   - concurrency: 2  — At most 2 AI jobs run at the same time.
 *                       Other jobs wait in the queue until a slot is free.
 *
 * Retry Strategy:
 *   Jobs that throw errors are retried up to MAX_RETRIES times with an
 *   exponential back-off delay before each retry.
 *
 * Why p-queue and not BullMQ/Redis:
 *   This is an intentional architectural decision for v1. p-queue keeps
 *   the local dev setup simple (no Redis required). In production at scale,
 *   this module can be replaced by BullMQ + Redis with minimal code changes.
 *
 * Usage:
 *   import { enqueueAiJob } from '../utils/aiQueue.js';
 *   enqueueAiJob(() => applyAiEnrichment(item, userId));
 */

import PQueue from "p-queue";

const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY_MS = 1000; // 1s → 2s → 4s (exponential)

/** Singleton queue — shared across the entire Express process. */
const aiQueue = new PQueue({ concurrency: 2 });

// ── Queue event telemetry (logged to console in dev) ────────────────────────
aiQueue.on("add", () => {
  console.info(`[AI_QUEUE] Job added. Size: ${aiQueue.size} | Pending: ${aiQueue.pending}`);
});

aiQueue.on("next", () => {
  console.info(`[AI_QUEUE] Job started. Size: ${aiQueue.size} | Pending: ${aiQueue.pending}`);
});

aiQueue.on("completed", () => {
  console.info(`[AI_QUEUE] Job completed. Size: ${aiQueue.size} | Pending: ${aiQueue.pending}`);
});

aiQueue.on("error", (err) => {
  console.error(`[AI_QUEUE] Unhandled job error:`, err.message);
});

// ── Public API ───────────────────────────────────────────────────────────────

/**
 * Enqueues an AI job with automatic retry on failure.
 *
 * This function is fire-and-forget — the caller does NOT await it.
 * The job executes asynchronously in the background once a concurrency
 * slot is free.
 *
 * @param {() => Promise<void>} jobFn  An async function to execute.
 *                                     Must handle its own MongoDB updates.
 * @param {string} [label]             Optional label for log messages (e.g., the knowledgeId).
 */
/**
 * @param {() => Promise<void>} jobFn         Async job to run inside the queue.
 * @param {string}              [label]        Human-readable label for log messages.
 * @param {(err: Error) => Promise<void>} [onPermanentFailure]
 *   Optional callback invoked ONLY when all retries are exhausted.
 *   Use this to update MongoDB status → "failed".
 */
export function enqueueAiJob(jobFn, label = "unknown", onPermanentFailure = null) {
  aiQueue
    .add(() => _withRetry(jobFn, label))
    .catch(async (finalErr) => {
      // All retries exhausted — invoke the permanent failure callback if provided
      if (typeof onPermanentFailure === "function") {
        try {
          await onPermanentFailure(finalErr);
        } catch (cbErr) {
          console.error(`[AI_QUEUE] onPermanentFailure callback threw for job "${label}":`, cbErr.message);
        }
      } else {
        console.error(`[AI_QUEUE] Fatal: job "${label}" failed permanently:`, finalErr?.message);
      }
    });
}

// ── Internal helpers ─────────────────────────────────────────────────────────

/**
 * Executes jobFn with up to MAX_RETRIES attempts, using exponential back-off.
 * On all-retry exhaustion, the error is re-thrown so the queue can log it.
 */
async function _withRetry(jobFn, label) {
  let lastError;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      await jobFn();
      return; // Success — exit retry loop
    } catch (err) {
      lastError = err;
      console.warn(
        `[AI_QUEUE] Job "${label}" failed (attempt ${attempt}/${MAX_RETRIES}): ${err.message}`,
      );

      if (attempt < MAX_RETRIES) {
        const delay = INITIAL_RETRY_DELAY_MS * 2 ** (attempt - 1); // 1s, 2s, 4s
        console.info(`[AI_QUEUE] Retrying job "${label}" in ${delay}ms…`);
        await _sleep(delay);
      }
    }
  }

  // All retries exhausted
  console.error(
    `[AI_QUEUE] Job "${label}" permanently failed after ${MAX_RETRIES} attempts. Last error: ${lastError?.message}`,
  );
  throw lastError;
}

function _sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
