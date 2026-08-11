"""
Image Loader (OCR via Gemini 1.5 Flash Vision)
-----------------------------------------------
Responsibility: Extract text and structured description from an image file.
Uses Gemini 1.5 Flash's native multimodal capability instead of Tesseract.

Why Gemini Vision over Tesseract:
  - Better OCR accuracy on real-world screenshots, diagrams, and code.
  - Understands context (e.g., identifies programming language in code screenshots).
  - No local native binary dependencies.
  - Can describe diagrams, UI layouts, and handwritten notes.

No chunking, no embeddings, no further AI pipeline — only extraction.
"""

import os
import base64
import logging
from pathlib import Path

logger = logging.getLogger(__name__)

# Supported MIME types for Gemini Vision
_SUPPORTED_MIME_TYPES = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".webp": "image/webp",
    ".gif": "image/gif",
}

# Prompt designed to extract maximum useful text for downstream indexing
_OCR_PROMPT = """\
You are an expert OCR and image analysis assistant. Carefully examine this image and extract the following:

1. ALL visible text — word for word, preserving structure (headings, bullets, code blocks, labels, etc.).
2. If code is present: identify the programming language.
3. A concise description of the image type and its visual content.
4. Image category — choose one: documentation, screenshot, UI, diagram, notes, receipt, code, other.

Format your response as follows:
---EXTRACTED TEXT---
[All visible text here]

---IMAGE DESCRIPTION---
[Brief description of what the image shows]

---IMAGE CATEGORY---
[Single category from the list above]
"""


def load_image(file_path: str) -> str:
    """
    Reads an image from disk and sends it to Gemini 1.5 Flash Vision for OCR.

    Args:
        file_path: Absolute path to the image file (PNG, JPEG, WEBP, GIF).

    Returns:
        Extracted text and description as a plain string, or empty string on failure.
    """
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        logger.error("[IMAGE_LOADER] GEMINI_API_KEY not set — cannot perform OCR")
        return ""

    path = Path(file_path)
    if not path.exists():
        logger.error(f"[IMAGE_LOADER] File not found: '{file_path}'")
        return ""

    suffix = path.suffix.lower()
    mime_type = _SUPPORTED_MIME_TYPES.get(suffix)
    if not mime_type:
        logger.error(f"[IMAGE_LOADER] Unsupported image format: '{suffix}'")
        return ""

    try:
        # Read and encode the image to Base64
        with open(file_path, "rb") as f:
            image_bytes = f.read()
        image_b64 = base64.b64encode(image_bytes).decode("utf-8")
    except Exception as e:
        logger.error(f"[IMAGE_LOADER] Failed to read image file: {e}")
        return ""

    try:
        from langchain_google_genai import ChatGoogleGenerativeAI
        from langchain_core.messages import HumanMessage

        llm = ChatGoogleGenerativeAI(
            model="gemini-3.5-flash",
            google_api_key=api_key,
            temperature=0.1,   # Low temperature — we want accurate extraction, not creativity
            max_retries=2,
        )

        # Build a multimodal message: text prompt + inline image data
        message = HumanMessage(
            content=[
                {"type": "text", "text": _OCR_PROMPT},
                {
                    "type": "image_url",
                    "image_url": {
                        "url": f"data:{mime_type};base64,{image_b64}"
                    },
                },
            ]
        )

        response = llm.invoke([message])
        
        if isinstance(response.content, str):
            extracted_text = response.content.strip()
        elif isinstance(response.content, list):
            text_parts = [
                part if isinstance(part, str) else part.get("text", "") 
                for part in response.content if isinstance(part, (str, dict))
            ]
            extracted_text = " ".join(text_parts).strip()
        else:
            extracted_text = str(response.content).strip()

        logger.info(
            f"[IMAGE_LOADER] OCR completed for '{path.name}' "
            f"({path.stat().st_size // 1024} KB) → {len(extracted_text)} chars"
        )
        return extracted_text

    except Exception as e:
        logger.error(f"[IMAGE_LOADER] Gemini Vision OCR failed for '{file_path}': {e}")
        return ""
