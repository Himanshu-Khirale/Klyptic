import asyncio
from dotenv import load_dotenv
load_dotenv()
from app.services.ingestion_service import process_ingestion

async def test_ingest():
    payload = {
        "knowledgeId": "test_123",
        "captureKind": "text",
        "content": "Artificial intelligence (AI) is intelligence demonstrated by machines, as opposed to intelligence of humans and other animals. AI applications include advanced web search engines, recommendation systems, understanding human speech, self-driving cars, and generative or creative tools."
    }
    result = await process_ingestion(payload, user_id="user_test_456")
    print("Ingestion Result:")
    print(result)

if __name__ == "__main__":
    asyncio.run(test_ingest())
