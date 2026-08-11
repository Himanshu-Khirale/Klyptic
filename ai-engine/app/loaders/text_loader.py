"""
Text Loader
-----------
Responsibility: Return plain text directly from the payload content field.
Handles capture kinds: text, note, code, chat, docs, repo.
No chunking, no embeddings, no metadata — only extraction.
"""

import logging

logger = logging.getLogger(__name__)


def load_text(content: str, capture_kind: str = "text") -> str:
    """
    Returns the raw text content from the payload, cleaned up.

    Args:
        content:      The raw text string from the payload.
        capture_kind: The capture kind (text, note, code, chat, etc.) for logging.

    Returns:
        Cleaned text string, or empty string if content is empty.
    """
    if not content or not content.strip():
        logger.warning(f"[TEXT_LOADER] Empty content received for kind='{capture_kind}'")
        return ""

    text = content.strip()
    logger.info(f"[TEXT_LOADER] Loaded {len(text)} chars for kind='{capture_kind}'")
    return text
