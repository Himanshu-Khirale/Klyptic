"""
PDF Loader
----------
Responsibility: Extract plain text from a PDF file on disk.
No chunking, no embeddings, no metadata — only extraction.
"""

import logging
from langchain_community.document_loaders import PyPDFLoader

logger = logging.getLogger(__name__)


def load_pdf(file_path: str) -> str:
    """
    Loads a PDF from the given absolute file path and returns its full text content.

    Args:
        file_path: Absolute path to the PDF file.

    Returns:
        Extracted text as a single string, or empty string on failure.
    """
    try:
        loader = PyPDFLoader(file_path)
        pages = loader.load()
        text = "\n\n".join(page.page_content for page in pages if page.page_content.strip())
        logger.info(f"[PDF_LOADER] Extracted {len(pages)} pages → {len(text)} chars")
        return text
    except Exception as e:
        logger.error(f"[PDF_LOADER] Failed to extract PDF at '{file_path}': {e}")
        return ""
