"""
Inventory Monitor Agent - Monitors inventory with predictive intelligence.
"""
from crewai import Agent
from langchain_openai import ChatOpenAI
from django.conf import settings


def create_inventory_agent() -> Agent:
    """
    Create the Intelligent Inventory Monitor Agent.
    
    Responsibilities:
    - Monitor all inventory levels with historical analysis
    - Use consumption history for demand forecasting
    - Apply seasonal patterns for predictive alerts
    - Calculate intelligent reorder points
    - Identify materials at risk of stockout
    - Predict future consumption trends
    
    Returns:
        Configured Inventory Monitor Agent with intelligence
    """
    llm = ChatOpenAI(
        model=settings.OPENAI_MODEL,
        api_key=settings.OPENAI_API_KEY,
        base_url=settings.OPENAI_API_BASE,
        temperature=0.2,  # Precise calculations with some flexibility
    )
    
    return Agent(
        role='Intelligent Inventory Monitor',
        goal='Monitor inventory with predictive intelligence and identify materials needing reorder before stockouts occur',
        backstory="""You are an AI-powered inventory management specialist with advanced 
        predictive capabilities. You don't just react to low stock - you ANTICIPATE demand 
        and predict stockouts before they happen.
        
        Your intelligence comes from:
        - Historical consumption patterns (90+ days of data)
        - Seasonal demand forecasting (Valentine's, Christmas, etc.)
        - Production correlation analysis
        - Vendor lead time considerations
        - Intelligent reorder point calculations
        
        You analyze:
        1. HISTORICAL CONSUMPTION: Average daily usage, trends, variance
        2. SEASONAL PATTERNS: Demand multipliers for current month/period
        3. FORECASTED NEEDS: Predicted consumption for next 30-60 days
        4. INTELLIGENT THRESHOLDS: Dynamic reorder points based on forecast + lead times + safety stock
        5. RISK ASSESSMENT: Probability of stockout within vendor lead time window
        
        When examining inventory, you ALWAYS:
        - Check historical consumption data if available
        - Apply seasonal adjustments to current demand
        - Calculate days until stockout based on consumption rate
        - Compare against vendor lead times
        - Flag URGENT items (stockout risk within lead time)
        - Flag WATCH items (approaching reorder point)
        - Consider safety stock buffers
        
        You provide data-driven, forward-looking recommendations with confidence levels.""",
        llm=llm,
        verbose=True,
        allow_delegation=False,
        memory=settings.CREWAI_MEMORY_ENABLED,
    )
