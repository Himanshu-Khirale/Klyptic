"""
FastAPI API Routes
------------------
All endpoints exposed by the Klyptic AI Engine.

Security note: FastAPI is an internal service — the Express backend handles
authentication and passes the authenticated userId via the X-User-Id header.
No JWT or session logic lives here.
"""

import logging
from typing import Optional, Dict, Any

from fastapi import APIRouter, Header, HTTPException

from app.services.ingestion_service import process_ingestion
from app.services.search_service import process_search
from app.services.chat_service import process_chat
from app.services.insights_service import process_insights
from app.vectorstore.chroma_client import get_chroma_client

router = APIRouter()
logger = logging.getLogger(__name__)

COLLECTION_NAME = "knowledge_vectors"


def _require_user(x_user_id: Optional[str]) -> str:
    """Dependency helper: raises 401 if user ID header is missing."""
    if not x_user_id or x_user_id.strip() == "system":
        raise HTTPException(status_code=401, detail="X-User-Id header is required")
    return x_user_id.strip()


# ─────────────────────────────────────────────────────────────────────────────
# Health
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/health", tags=["Health"])
async def health_check():
    """Health check endpoint used by the Express backend to verify AI Engine status."""
    return {"status": "ok", "service": "klyptic-ai-engine"}


# ─────────────────────────────────────────────────────────────────────────────
# Ingestion
# ─────────────────────────────────────────────────────────────────────────────

@router.post("/api/v1/ingest", tags=["Ingestion"])
async def ingest_knowledge(
    payload: Dict[str, Any],
    x_user_id: Optional[str] = Header(None),
):
    """
    Ingests a knowledge item: extracts text via the loader factory, chunks it,
    embeds it into ChromaDB, and returns AI-enriched metadata to Express.
    """
    user_id = _require_user(x_user_id)
    try:
        result = await process_ingestion(payload, user_id)
        return result
    except Exception as e:
        logger.error(f"[ROUTE] Ingestion failed for user={user_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ─────────────────────────────────────────────────────────────────────────────
# Search
# ─────────────────────────────────────────────────────────────────────────────

@router.post("/api/v1/search", tags=["Search"])
async def search_knowledge(
    payload: Dict[str, Any],
    x_user_id: Optional[str] = Header(None),
):
    """Performs semantic similarity search in ChromaDB, scoped to the requesting user."""
    user_id = _require_user(x_user_id)
    try:
        result = await process_search(payload, user_id)
        return result
    except Exception as e:
        logger.error(f"[ROUTE] Search failed for user={user_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ─────────────────────────────────────────────────────────────────────────────
# Chat (RAG)
# ─────────────────────────────────────────────────────────────────────────────

@router.post("/api/v1/chat", tags=["Chat"])
async def chat(
    payload: Dict[str, Any],
    x_user_id: Optional[str] = Header(None),
):
    """RAG Chat: retrieves relevant context from ChromaDB and generates an answer via Gemini."""
    user_id = _require_user(x_user_id)
    try:
        result = await process_chat(payload, user_id)
        return result
    except Exception as e:
        logger.error(f"[ROUTE] Chat failed for user={user_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ─────────────────────────────────────────────────────────────────────────────
# Insights
# ─────────────────────────────────────────────────────────────────────────────

@router.post("/api/v1/insights", tags=["Insights"])
async def get_insights(
    payload: Dict[str, Any],
    x_user_id: Optional[str] = Header(None),
):
    """Generates AI-powered dashboard insight cards and weekly summary."""
    user_id = _require_user(x_user_id)
    try:
        result = await process_insights(payload, user_id)
        return result
    except Exception as e:
        logger.error(f"[ROUTE] Insights failed for user={user_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ─────────────────────────────────────────────────────────────────────────────
# Knowledge Deletion
# ─────────────────────────────────────────────────────────────────────────────

@router.post("/api/v1/knowledge/delete", tags=["Ingestion"])
async def delete_knowledge(
    payload: Dict[str, Any],
    x_user_id: Optional[str] = Header(None),
):
    """
    Deletes all ChromaDB vector chunks for a specific knowledge item.
    Called by Express when the user deletes a knowledge item from MongoDB.
    """
    user_id = _require_user(x_user_id)
    knowledge_id = payload.get("knowledgeId", "").strip()

    if not knowledge_id:
        raise HTTPException(status_code=400, detail="knowledgeId is required")

    try:
        client = get_chroma_client()
        collection = client.get_or_create_collection(name=COLLECTION_NAME)

        # Delete all chunks belonging to this knowledge item AND this user.
        # The user_id filter adds an extra safety layer for multi-tenant integrity.
        collection.delete(
            where={"$and": [{"knowledge_id": knowledge_id}, {"user_id": user_id}]}
        )

        logger.info(
            f"[ROUTE] Deleted ChromaDB chunks | knowledgeId={knowledge_id} | userId={user_id}"
        )
        return {"status": "deleted", "knowledgeId": knowledge_id}

    except Exception as e:
        logger.error(f"[ROUTE] Delete failed for knowledgeId={knowledge_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))
