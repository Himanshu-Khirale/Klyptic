"""
YouTube Loader
--------------
Responsibility: Extract transcript and video metadata from a YouTube URL.
Uses youtube-transcript-api for transcripts and LangChain's YoutubeLoader
for richer metadata when available.
No chunking, no embeddings, no metadata generation — only extraction.
"""

import logging
import re
from typing import Optional

logger = logging.getLogger(__name__)


def _extract_video_id(url: str) -> Optional[str]:
    """
    Extracts the YouTube video ID from various URL formats.

    Supports:
        - https://www.youtube.com/watch?v=VIDEO_ID
        - https://youtu.be/VIDEO_ID
        - https://www.youtube.com/embed/VIDEO_ID
        - https://www.youtube.com/shorts/VIDEO_ID
    """
    patterns = [
        r"(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})",
    ]
    for pattern in patterns:
        match = re.search(pattern, url)
        if match:
            return match.group(1)
    return None


def load_youtube(url: str) -> str:
    """
    Fetches the transcript from a YouTube video URL.

    Strategy:
      1. Extract the video ID from the URL.
      2. Use youtube-transcript-api to fetch the transcript directly (most reliable).
      3. Join all transcript segments into a single readable text block.
      4. Falls back to LangChain YoutubeLoader if the direct API fails.

    Args:
        url: Full YouTube video URL.

    Returns:
        Transcript text as a plain string, or empty string on failure.
    """
    if not url or not url.strip():
        logger.warning("[YOUTUBE_LOADER] No URL provided")
        return ""

    video_id = _extract_video_id(url.strip())
    if not video_id:
        logger.error(f"[YOUTUBE_LOADER] Could not extract video ID from URL: '{url}'")
        return ""

    # --- Strategy 1: youtube-transcript-api (most reliable, no browser needed) ---
    try:
        from youtube_transcript_api import YouTubeTranscriptApi, TranscriptsDisabled, NoTranscriptFound

        transcript_list = YouTubeTranscriptApi.get_transcript(video_id)
        full_transcript = " ".join(entry["text"] for entry in transcript_list)
        logger.info(
            f"[YOUTUBE_LOADER] Transcript fetched via youtube-transcript-api "
            f"for video_id='{video_id}' → {len(full_transcript)} chars"
        )
        return full_transcript.strip()
    except Exception as primary_err:
        logger.warning(
            f"[YOUTUBE_LOADER] youtube-transcript-api failed for '{video_id}': {primary_err}. "
            f"Falling back to LangChain YoutubeLoader."
        )

    # --- Strategy 2: LangChain YoutubeLoader (fallback) ---
    try:
        from langchain_community.document_loaders import YoutubeLoader

        loader = YoutubeLoader.from_youtube_url(
            url.strip(),
            add_video_info=False,  # set to True only if pytube is installed and not rate-limited
            language=["en", "en-US"],
        )
        docs = loader.load()
        text = "\n\n".join(doc.page_content for doc in docs if doc.page_content.strip())
        logger.info(
            f"[YOUTUBE_LOADER] Transcript fetched via LangChain YoutubeLoader "
            f"for video_id='{video_id}' → {len(text)} chars"
        )
        return text.strip()
    except Exception as fallback_err:
        logger.error(
            f"[YOUTUBE_LOADER] Both strategies failed for '{video_id}'. "
            f"Fallback error: {fallback_err}"
        )
        return ""
