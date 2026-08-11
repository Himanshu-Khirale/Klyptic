import os
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_google_genai import ChatGoogleGenerativeAI
import logging

logger = logging.getLogger(__name__)

# System prompt enforcing strict adherence to context
RAG_SYSTEM_PROMPT = """You are a highly intelligent and helpful Personal Knowledge Assistant.
Your primary role is to answer the user's question using ONLY the provided context from their personal knowledge base.

CRITICAL INSTRUCTIONS:
1. Base your answer STRICTLY on the provided context.
2. DO NOT use external knowledge or hallucinate facts.
3. If the answer cannot be reasonably found in the context, politely state: "I'm sorry, but I cannot find the answer to that in your knowledge base." (Be generous and polite, but firm about not guessing).
4. Keep your answer clear, concise, and well-formatted.

Context from User's Knowledge Base:
{context}
"""

def get_chat_chain():
    """
    Returns the LCEL RAG chain for answering questions based on context.
    """
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        logger.warning("GEMINI_API_KEY not found. Chat will use fallback response.")
        return None

    try:
        llm = ChatGoogleGenerativeAI(
            model="gemini-3.5-flash",
            google_api_key=api_key,
            temperature=0.1, # Low temperature to prevent hallucinations
            max_retries=2
        )

        prompt = ChatPromptTemplate.from_messages([
            ("system", RAG_SYSTEM_PROMPT),
            ("human", "Question: {question}")
        ])

        # A simple string output parser
        chain = prompt | llm | StrOutputParser()
        return chain
    except Exception as e:
        logger.error(f"Failed to initialize Chat chain: {e}")
        return None
