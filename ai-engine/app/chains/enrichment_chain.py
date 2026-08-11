import os
from pydantic import BaseModel, Field
from typing import List
from langchain_core.prompts import ChatPromptTemplate
from langchain_google_genai import ChatGoogleGenerativeAI
import logging


logger = logging.getLogger(__name__)

class EnrichmentOutput(BaseModel):
    title: str = Field(description="A concise and descriptive title for the content.")
    summary: str = Field(description="A short, 2-3 sentence summary of the main points.")
    topic: str = Field(description="A single broad category or topic for the content (e.g., 'Artificial Intelligence', 'Software Engineering', 'Finance').")
    takeaways: List[str] = Field(description="A list of 3-5 key takeaways or important facts extracted from the content.")

def get_enrichment_chain():
    """
    Returns a LangChain runnable that takes a dictionary with a 'text' key
    and returns a parsed EnrichmentOutput object.
    """
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        logger.warning("GEMINI_API_KEY not found. AI enrichment will use fallback data.")
        return None

    try:
        llm = ChatGoogleGenerativeAI(
            model="gemini-3.5-flash",
            google_api_key=api_key,
            temperature=0.3, # Low temperature for more factual extraction
            max_retries=2
        )
        
        # We use structured output to ensure we get a valid JSON parsing to our Pydantic model
        structured_llm = llm.with_structured_output(EnrichmentOutput)

        prompt = ChatPromptTemplate.from_messages([
            ("system", "You are an expert knowledge curator. Your task is to analyze the provided text and extract a descriptive title, a concise summary, a broad categorization topic, and a list of key takeaways. Ensure your response strictly follows the requested structure."),
            ("human", "Analyze the following text and extract the required information:\n\n{text}")
        ])

        chain = prompt | structured_llm
        return chain
    except Exception as e:
        logger.error(f"Failed to initialize Gemini LLM: {e}")
        return None

def fallback_enrichment(text: str, payload: dict) -> dict:
    """Fallback if LLM fails or is missing"""
    content_preview = text[:200].replace("\n", " ") + "..." if text else "No content"
    return {
        "title": payload.get("title") or "Untitled Document",
        "summary": "AI enrichment is disabled or failed. This is a fallback summary.",
        "topic": payload.get("topic") or "General",
        "takeaways": [content_preview]
    }
