"""
Ingestion Service
-----------------
Orchestrates the complete ingestion pipeline for a single knowledge item:

  INGEST_START
      │
      ▼
  Loader Factory  →  Extract Plain Text
      │
      ▼
  Chunking        →  RecursiveCharacterTextSplitter
      │
      ▼
  Embeddings      →  HuggingFace (local, CPU, free)
      │
      ▼
  ChromaDB        →  Store vectors (with userId + knowledgeId metadata)
      │
      ▼
  Enrichment LLM  →  Gemini 1.5 Flash  →  title, summary, topic, takeaways
      │
      ▼
  Return metadata →  Express updates MongoDB

This service does NOT perform authentication, user management, or business logic.
It receives a payload + userId and returns enrichment metadata.
"""

import logging
import time

from app.loaders.loader_factory import extract_text
from app.loaders.text_splitter import get_text_splitter
from app.embeddings.huggingface import get_embeddings
from app.vectorstore.chroma_client import get_chroma_client
from app.chains.enrichment_chain import get_enrichment_chain, fallback_enrichment

logger = logging.getLogger(__name__)

# Collection name used for all user vectors (isolated by user_id metadata filter)
COLLECTION_NAME = "knowledge_vectors"


async def process_ingestion(payload: dict, user_id: str) -> dict:
    """
    Main orchestration entry point for the AI ingestion pipeline.

    Args:
        payload:  Full ingestion payload from Express.
        user_id:  Authenticated user ID (used for ChromaDB tenant isolation).

    Returns:
        A dict containing enriched metadata to be persisted in MongoDB by Express.
        Keys: status, error, title, summary, preview, topic, takeaways, metadata.
    """
    knowledge_id = payload.get("knowledgeId", "unknown")
    capture_kind = payload.get("captureKind", "text")
    pipeline_start = time.monotonic()

    logger.info(
        f"[INGESTION] INGEST_START | knowledgeId={knowledge_id} | "
        f"userId={user_id} | captureKind={capture_kind}"
    )

    # ─────────────────────────────────────────────────────────────────
    # Stage 1: Text Extraction via Loader Factory
    # ─────────────────────────────────────────────────────────────────
    full_text = extract_text(payload)
    # extract_text always returns a string (possibly empty) — never None

    # ─────────────────────────────────────────────────────────────────
    # Stage 2: Chunking → Embedding → ChromaDB
    # ─────────────────────────────────────────────────────────────────
    chroma_status = "skipped"
    chroma_error = None

    if full_text.strip():
        chroma_status, chroma_error = await _store_in_vectordb(
            full_text, knowledge_id, user_id, capture_kind
        )
    else:
        logger.warning(
            f"[INGESTION] No text extracted for knowledgeId={knowledge_id}. "
            f"Skipping chunking and embedding stages."
        )

    # ─────────────────────────────────────────────────────────────────
    # Stage 3: LLM Enrichment (title, summary, topic, takeaways)
    # ─────────────────────────────────────────────────────────────────
    enrichment_data = await _enrich_with_llm(full_text, payload, knowledge_id)

    # ─────────────────────────────────────────────────────────────────
    # Stage 4: Determine final status and return
    # ─────────────────────────────────────────────────────────────────
    if chroma_status == "failed":
        final_status = "failed"
    else:
        final_status = "completed"

    elapsed_ms = int((time.monotonic() - pipeline_start) * 1000)
    logger.info(
        f"[INGESTION] INGEST_COMPLETED | knowledgeId={knowledge_id} | "
        f"status={final_status} | duration={elapsed_ms}ms"
    )

    return {
        "status": final_status,
        "error": chroma_error,
        "title": enrichment_data["title"],
        "summary": enrichment_data["summary"],
        "preview": _make_preview(full_text),
        "topic": enrichment_data["topic"],
        "takeaways": enrichment_data["takeaways"],
        "metadata": {
            "words": len(full_text.split()) if full_text else 0,
            "readTime": f"{max(1, len(full_text.split()) // 200)} min" if full_text else "—",
            "captureKind": capture_kind,
        },
    }


# ─────────────────────────────────────────────────────────────────────────────
# Internal helpers
# ─────────────────────────────────────────────────────────────────────────────

async def _store_in_vectordb(
    full_text: str,
    knowledge_id: str,
    user_id: str,
    capture_kind: str,
) -> tuple[str, str | None]:
    """
    Chunks the text, generates embeddings, and upserts into ChromaDB.

    Returns:
        A tuple (status, error) where status is "ok" or "failed".
    """
    try:
        # ── Chunking ───────────────────────────────────────────────────────────
        from langchain_core.documents import Document

        doc = Document(
            page_content=full_text,
            metadata={"knowledge_id": knowledge_id, "source": capture_kind},
        )
        splitter = get_text_splitter()
        chunks = splitter.split_documents([doc])

        logger.info(
            f"[INGESTION] CHUNKING_COMPLETED | knowledgeId={knowledge_id} | "
            f"chunks={len(chunks)}"
        )

        # ── Embeddings ─────────────────────────────────────────────────────────
        texts = [chunk.page_content for chunk in chunks]
        embeddings_model = get_embeddings()
        vectors = embeddings_model.embed_documents(texts)

        logger.info(
            f"[INGESTION] EMBEDDINGS_CREATED | knowledgeId={knowledge_id} | "
            f"vectors={len(vectors)}"
        )

        # ── ChromaDB Upsert ────────────────────────────────────────────────────
        metadatas = [
            {
                "user_id": user_id,
                "knowledge_id": knowledge_id,
                "source_type": capture_kind,
                "chunk_index": i,
            }
            for i in range(len(chunks))
        ]
        ids = [f"{knowledge_id}_chunk_{i}" for i in range(len(chunks))]

        client = get_chroma_client()
        collection = client.get_or_create_collection(
            name=COLLECTION_NAME,
            metadata={"hnsw:space": "cosine"},
        )
        collection.upsert(
            ids=ids,
            embeddings=vectors,
            metadatas=metadatas,
            documents=texts,
        )

        logger.info(
            f"[INGESTION] CHROMADB_UPDATED | knowledgeId={knowledge_id} | "
            f"chunks_stored={len(chunks)}"
        )
        return "ok", None

    except Exception as e:
        error_msg = str(e)
        logger.error(
            f"[INGESTION] INGEST_FAILED (vectordb) | knowledgeId={knowledge_id} | error={error_msg}"
        )
        return "failed", error_msg


async def _enrich_with_llm(full_text: str, payload: dict, knowledge_id: str) -> dict:
    """
    Calls the LLM enrichment chain to generate title, summary, topic, and takeaways.
    Falls back gracefully if the API key is missing or the call fails.
    """
    # Always have a sane fallback before we even try the LLM
    enrichment_data = fallback_enrichment(full_text, payload)

    if not full_text.strip():
        return enrichment_data

    chain = get_enrichment_chain()
    if not chain:
        return enrichment_data

    try:
        # Limit to 10,000 chars — Gemini 1.5 Flash supports 1M tokens but we
        # keep prompt size predictable and fast for personal-scale knowledge.
        text_to_analyze = full_text[:10_000]
        result = await chain.ainvoke({"text": text_to_analyze})

        enrichment_data = {
            "title": result.title,
            "summary": result.summary,
            "topic": result.topic,
            "takeaways": result.takeaways,
        }
        logger.info(
            f"[INGESTION] METADATA_GENERATED | knowledgeId={knowledge_id} | "
            f"topic='{result.topic}'"
        )

    except Exception as e:
        logger.error(
            f"[INGESTION] INGEST_FAILED (enrichment) | knowledgeId={knowledge_id} | "
            f"error={e}. Using fallback enrichment."
        )

    return enrichment_data


def _make_preview(full_text: str, max_chars: int = 400) -> str:
    """Generates a short text preview for the MongoDB document."""
    if not full_text:
        return ""
    cleaned = " ".join(full_text.split())  # collapse whitespace
    return cleaned[:max_chars - 1] + "…" if len(cleaned) > max_chars else cleaned
