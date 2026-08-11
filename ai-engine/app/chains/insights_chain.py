import os
from pydantic import BaseModel, Field
from typing import List
from langchain_core.prompts import ChatPromptTemplate
from langchain_google_genai import ChatGoogleGenerativeAI
import logging

logger = logging.getLogger(__name__)

class InsightCard(BaseModel):
    title: str = Field(description="Title of the insight card, e.g., 'Learning trends' or 'Knowledge gaps'.")
    body: str = Field(description="A short, encouraging, and analytical insight paragraph.")

class InsightsOutput(BaseModel):
    cards: List[InsightCard] = Field(description="Exactly 3 insight cards summarizing the user's knowledge graph.")
    weeklySummary: str = Field(description="A 2-3 sentence overview of the user's progress this week compared to last week.")

def get_insights_chain():
    """
    Returns an LCEL chain for generating Dashboard Insights.
    """
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        logger.warning("GEMINI_API_KEY not found. Insights will use fallback data.")
        return None

    try:
        llm = ChatGoogleGenerativeAI(
            model="gemini-3.5-flash",
            google_api_key=api_key,
            temperature=0.7, # Higher temperature for more creative/encouraging insights
            max_retries=2
        )
        
        structured_llm = llm.with_structured_output(InsightsOutput)

        prompt = ChatPromptTemplate.from_messages([
            ("system", "You are an analytical and encouraging AI learning coach. The user will provide their weekly learning stats (saved topics, item counts). Synthesize this into exactly 3 insight cards (e.g., Learning Trends, Knowledge Gaps, Revision Suggestions) and a brief overall weekly summary."),
            ("human", "Weekly Stats:\n{stats}")
        ])

        return prompt | structured_llm
    except Exception as e:
        logger.error(f"Failed to initialize Insights chain: {e}")
        return None

def fallback_insights(stats_text: str) -> dict:
    """Fallback if LLM fails or is missing"""
    return {
        "cards": [
            {
                "title": "Learning trends",
                "body": "You have been actively building your knowledge base. Keep exploring new topics!"
            },
            {
                "title": "Knowledge gaps",
                "body": "As you capture more diverse content, we will identify potential areas to expand your learning."
            },
            {
                "title": "Revision suggestions",
                "body": "Review older captures to solidify your understanding and find new connections."
            }
        ],
        "weeklySummary": "AI insights are currently using fallback mode. Please check your API configurations to unlock personalized summaries."
    }
