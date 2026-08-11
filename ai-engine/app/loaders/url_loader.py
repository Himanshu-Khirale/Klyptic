"""
URL Loader
----------
Responsibility: Scrape and extract readable text content from a web URL.
Handles capture kinds: url, docs.
No chunking, no embeddings, no metadata — only extraction.
"""

import logging
from langchain_community.document_loaders import WebBaseLoader

logger = logging.getLogger(__name__)


def load_url(url: str) -> str:
    """
    Scrapes the given URL and returns its readable text content.

    Args:
        url: The full URL string to scrape.

    Returns:
        Extracted text as a single string, or empty string on failure.
    """
    if not url or not url.strip():
        logger.warning("[URL_LOADER] No URL provided")
        return ""

    try:
        loader = WebBaseLoader(url.strip())
        docs = loader.load()
        text = "\n\n".join(doc.page_content for doc in docs if doc.page_content.strip())
        logger.info(f"[URL_LOADER] Scraped '{url}' → {len(text)} chars")
        return text
    except Exception as e:
        logger.error(f"[URL_LOADER] Failed to scrape URL '{url}': {e}")
        return ""
