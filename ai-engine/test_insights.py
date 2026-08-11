import asyncio
import os
from dotenv import load_dotenv
load_dotenv()

from app.services.insights_service import process_insights

async def test_insights():
    payload = {
        "weekCount": 12,
        "prevWeekCount": 5,
        "topics": ["React", "Machine Learning", "System Design"]
    }
    print("Testing Insights Pipeline...")
    result = await process_insights(payload, user_id="user_test_999")
    
    print("\n--- Weekly Summary ---")
    print(result.get("weeklySummary"))
    
    print("\n--- Insight Cards ---")
    for card in result.get("cards", []):
        print(f"Title: {card.get('title')}")
        print(f"Body: {card.get('body')}\n")

if __name__ == "__main__":
    asyncio.run(test_insights())
