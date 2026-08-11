from app.vectorstore.chroma_client import get_chroma_client
from app.embeddings.huggingface import get_embeddings
import logging

logger = logging.getLogger(__name__)

def retrieve_knowledge_chunks(query: str, user_id: str, top_k: int = 5):
    """
    Performs a similarity search in ChromaDB.
    Strictly filters results by user_id to ensure multitenant isolation.
    """
    try:
        client = get_chroma_client()
        collection = client.get_or_create_collection("knowledge_vectors")
        embeddings_model = get_embeddings()

        # Embed the query
        query_vector = embeddings_model.embed_query(query)

        # Query ChromaDB, strictly filtering by user_id
        results = collection.query(
            query_embeddings=[query_vector],
            n_results=top_k,
            where={"user_id": user_id},
            include=["documents", "metadatas", "distances"]
        )

        chunks = []
        if results and results["documents"] and len(results["documents"]) > 0:
            for i in range(len(results["documents"][0])):
                chunks.append({
                    "content": results["documents"][0][i],
                    "metadata": results["metadatas"][0][i],
                    "distance": results["distances"][0][i]
                })
        
        return chunks
    except Exception as e:
        logger.error(f"Error retrieving knowledge chunks: {e}")
        return []
