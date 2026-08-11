"""
Loader Factory
--------------
Responsibility: Select and invoke the correct loader for a given capture kind.

This is the single entry point for all text extraction in the ingestion pipeline.
The ingestion service calls `extract_text(payload)` — it never imports individual loaders.

The factory:
  - Reads `captureKind` from the payload.
  - Delegates to the appropriate loader.
  - Returns plain text (always a string, never None).
  - Logs which loader was selected and how long extraction took.

Adding a new source type in the future only requires:
  1. Creating a new loader in loaders/
  2. Adding one case to the `_LOADER_MAP` dispatch table below.
"""

import logging
import time

from app.loaders.pdf_loader import load_pdf
from app.loaders.image_loader import load_image
from app.loaders.youtube_loader import load_youtube
from app.loaders.url_loader import load_url
from app.loaders.text_loader import load_text

logger = logging.getLogger(__name__)


def extract_text(payload: dict) -> str:
    """
    Routes the payload to the correct loader based on `captureKind`.

    Args:
        payload: The full ingestion payload from Express. Expected keys:
            - captureKind (str): one of pdf, image, youtube, url, docs, text, note, code, chat, repo
            - content     (str): raw text content (for text-based kinds)
            - url         (str): web/YouTube URL
            - filePath    (str): absolute path to uploaded file (for pdf, image)

    Returns:
        Extracted plain text as a string. Empty string if extraction fails.
    """
    capture_kind = (payload.get("captureKind") or "text").strip().lower()
    knowledge_id = payload.get("knowledgeId", "unknown")

    logger.info(
        f"[LOADER_FACTORY] LOADER_SELECTED | knowledgeId={knowledge_id} | captureKind={capture_kind}"
    )

    start_time = time.monotonic()
    text = _dispatch(capture_kind, payload)
    elapsed_ms = int((time.monotonic() - start_time) * 1000)

    if text:
        logger.info(
            f"[LOADER_FACTORY] TEXT_EXTRACTED | knowledgeId={knowledge_id} | "
            f"captureKind={capture_kind} | chars={len(text)} | duration={elapsed_ms}ms"
        )
    else:
        logger.warning(
            f"[LOADER_FACTORY] TEXT_EXTRACTED (empty) | knowledgeId={knowledge_id} | "
            f"captureKind={capture_kind} | duration={elapsed_ms}ms"
        )

    return text


def _dispatch(capture_kind: str, payload: dict) -> str:
    """Internal dispatch — maps capture_kind to the correct loader call."""

    # ── PDF ───────────────────────────────────────────────────────────────────
    if capture_kind == "pdf":
        file_path = payload.get("filePath", "")
        if not file_path:
            logger.error("[LOADER_FACTORY] PDF capture missing 'filePath'")
            return payload.get("content", "")
        return load_pdf(file_path)

    # ── Image / Screenshot ────────────────────────────────────────────────────
    if capture_kind == "image":
        file_path = payload.get("filePath", "")
        if not file_path:
            logger.error("[LOADER_FACTORY] Image capture missing 'filePath'")
            return payload.get("content", "")
        return load_image(file_path)

    # ── YouTube ───────────────────────────────────────────────────────────────
    if capture_kind == "youtube":
        url = payload.get("url", "")
        if not url:
            logger.error("[LOADER_FACTORY] YouTube capture missing 'url'")
            return payload.get("content", "")
        return load_youtube(url)

    # ── URL / Web page / Documentation ────────────────────────────────────────
    if capture_kind in ("url", "docs"):
        url = payload.get("url", "")
        # If we have a URL, scrape it. Fall back to raw content if scraping empty.
        scraped = load_url(url) if url else ""
        return scraped or load_text(payload.get("content", ""), capture_kind)

    # ── Text / Note / Code / Chat / Repo (plain text) ─────────────────────────
    if capture_kind in ("text", "note", "code", "chat", "repo"):
        return load_text(payload.get("content", ""), capture_kind)

    # ── Unknown / Fallback ────────────────────────────────────────────────────
    logger.warning(
        f"[LOADER_FACTORY] Unknown captureKind='{capture_kind}'. Using text fallback."
    )
    return load_text(payload.get("content", ""), capture_kind)
