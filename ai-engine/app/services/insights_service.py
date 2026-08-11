from app.chains.insights_chain import get_insights_chain, fallback_insights
import logging

logger = logging.getLogger(__name__)

async def process_insights(payload: dict, user_id: str) -> dict:
    """
    Handles Phase 8: Dashboard Intelligence.
    Synthesizes incoming weekly stats into AI-generated dashboard cards and summaries.
    """
    week_count = payload.get("weekCount", 0)
    prev_week_count = payload.get("prevWeekCount", 0)
    topics = payload.get("topics", [])

    # Format the stats for the prompt
    topic_names = [t.get("name") if isinstance(t, dict) else str(t) for t in topics]
    topics_str = ", ".join(topic_names) if topic_names else "None yet"
    
    stats_text = (
        f"Items captured this week: {week_count}\n"
        f"Items captured last week: {prev_week_count}\n"
        f"Top topics being explored: {topics_str}"
    )

    # Call the chain
    chain = get_insights_chain()
    if not chain:
        return fallback_insights(stats_text)

    try:
        # result is an InsightsOutput Pydantic object
        result = await chain.ainvoke({"stats": stats_text})
        
        return {
            "cards": [{"title": c.title, "body": c.body} for c in result.cards],
            "weeklySummary": result.weeklySummary
        }
    except Exception as e:
        logger.error(f"Failed to generate AI insights: {e}")
        return fallback_insights(stats_text)
