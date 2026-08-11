import asyncio
import os
from dotenv import load_dotenv
load_dotenv()

from app.services.ingestion_service import process_ingestion
from app.services.search_service import process_search
from app.services.chat_service import process_chat

async def run_tests():
    user_id = "user_777"
    
    print("--- 1. INGESTING DATA ---")
    payload = {
        "knowledgeId": "k_999",
        "captureKind": "text",
        "content": "Antigravity is an AI model built by Google DeepMind. It is highly capable at coding and software engineering tasks. It has a strict instruction to prioritize specific tools like view_file and write_to_file over generic bash commands."
    }
    ingest_result = await process_ingestion(payload, user_id=user_id)
    print("Ingestion complete.\n")
    
    print("--- 2. TESTING SEARCH ---")
    search_payload = {"query": "Who built Antigravity?"}
    search_result = await process_search(search_payload, user_id=user_id)
    print("Search Results:")
    for res in search_result.get("results", []):
        print(f" - {res['knowledgeId']} (Score: {res['relevanceScore']}): {res['matchSnippet']}")
    print("\n")

    print("--- 3. TESTING RAG CHAT ---")
    chat_payload = {"message": "What is Antigravity's strict instruction regarding tools?"}
    chat_result = await process_chat(chat_payload, user_id=user_id)
    print("Chat Response:")
    print(chat_result.get("response"))
    print("\nSources Used:", chat_result.get("sources"))
    
    print("\n--- 4. TESTING RAG CHAT (OUT OF CONTEXT) ---")
    chat_payload_ooc = {"message": "How do I bake a chocolate cake?"}
    chat_result_ooc = await process_chat(chat_payload_ooc, user_id=user_id)
    print("Chat Response (Out of Context):")
    print(chat_result_ooc.get("response"))

if __name__ == "__main__":
    asyncio.run(run_tests())
