from app.retrieval.retriever import retrieve_knowledge_chunks

async def process_search(payload: dict, user_id: str) -> dict:
    """
    Handles Phase 6 Semantic Search.
    Finds relevant chunks and returns unique knowledge items.
    """
    query = payload.get("query", "").strip()
    if not query:
        return {"results": []}

    # Retrieve top 10 most relevant chunks
    chunks = retrieve_knowledge_chunks(query, user_id, top_k=10)

    # Group by knowledge_id to avoid returning duplicates of the same document
    seen_knowledge = set()
    unique_results = []

    for chunk in chunks:
        k_id = chunk["metadata"].get("knowledge_id")
        if k_id and k_id not in seen_knowledge:
            seen_knowledge.add(k_id)
            unique_results.append({
                "knowledgeId": k_id,
                "relevanceScore": round(1.0 - chunk["distance"], 3), # Cosine similarity
                "matchSnippet": chunk["content"][:200] + "..." # Preview
            })

    # Sort by relevance score (highest first)
    unique_results.sort(key=lambda x: x["relevanceScore"], reverse=True)

    return {"results": unique_results}
