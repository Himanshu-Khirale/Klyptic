from app.retrieval.retriever import retrieve_knowledge_chunks
from app.chains.chat_chain import get_chat_chain
import logging

logger = logging.getLogger(__name__)

async def process_chat(payload: dict, user_id: str) -> dict:
    """
    Handles Phase 7 RAG Chat.
    Retrieves context from ChromaDB and passes it to the LLM to generate an answer.
    """
    question = payload.get("message") or payload.get("question", "")
    question = question.strip()
    if not question:
        return {"response": "Please ask a valid question.", "sources": []}

    # 1. Retrieve Context
    chunks = retrieve_knowledge_chunks(question, user_id, top_k=5)
    
    context_text = ""
    seen_sources = set()
    sources = []

    for idx, chunk in enumerate(chunks):
        context_text += f"--- Source {idx+1} ---\n{chunk['content']}\n\n"
        
        k_id = chunk["metadata"].get("knowledge_id")
        if k_id and k_id not in seen_sources:
            seen_sources.add(k_id)
            sources.append({
                "knowledgeId": k_id,
                "relevanceScore": round(1.0 - chunk["distance"], 3)
            })

    # If no context found, we could either let the LLM handle it (using the strict prompt)
    # or short-circuit here. We will let the LLM handle it using the strict prompt
    # so it replies politely as requested.
    if not context_text.strip():
        context_text = "No relevant documents found in the user's knowledge base."

    # 2. Generate Response
    chain = get_chat_chain()
    if not chain:
        return {
            "response": "AI Chat is currently unavailable. Please check API configurations.",
            "sources": sources
        }

    try:
        response_text = await chain.ainvoke({
            "context": context_text,
            "question": question
        })
        
        return {
            "answer": response_text,
            "sources": sources
        }
    except Exception as e:
        logger.error(f"Chat generation failed: {e}")
        return {
            "response": "An error occurred while generating the response.",
            "sources": sources
        }
