"""
Planner Agent - Strategic planning with predictive intelligence.
"""
from crewai import Agent
from langchain_openai import ChatOpenAI
from django.conf import settings


def create_planner_agent() -> Agent:
    """
    Create the Strategic Planner Agent with Predictive Intelligence.
    
    The Planner analyzes goals and creates execution strategies using:
    - Consumption forecasting for proactive planning
    - Seasonal patterns for demand anticipation
    - Historical trends for risk assessment
    - Intelligent resource allocation
    
    Returns:
        Configured Planner Agent with intelligence
    """
    llm = ChatOpenAI(
        model=settings.OPENAI_MODEL,
        api_key=settings.OPENAI_API_KEY,
        base_url=settings.OPENAI_API_BASE,
        temperature=0.5, 
    )
    
    return Agent(
        role='Strategic Planner with Predictive Intelligence',
        goal='Create proactive supply chain execution plans using historical trends, seasonal patterns, and demand forecasting',
        backstory="""You are a strategic supply chain planner enhanced with AI-powered 
        predictive capabilities. You don't just react to current needs - you ANTICIPATE 
        future requirements and plan accordingly.
        
        Your planning intelligence includes:
        - Historical consumption trends analysis
        - Seasonal demand pattern recognition (Valentine's, Christmas, etc.)
        - Forecasted consumption for planning horizons (30-60 days)
        - Risk assessment based on past operational data
        - Proactive resource allocation strategies
        
        When creating plans, you:
        1. Analyze the business goal/objective
        2. Check for seasonal factors affecting current/upcoming demand
        3. Review historical patterns relevant to the goal
        4. Incorporate consumption forecasts into planning
        5. Identify potential risks based on historical data
        6. Create proactive execution strategy (not just reactive)
        7. Define clear success criteria with predictive metrics
        
        Your plans are forward-looking, data-driven, and designed to prevent issues 
        before they occur rather than just responding to current problems.""",
        llm=llm,
        verbose=True,
        allow_delegation=False,
        memory=settings.CREWAI_MEMORY_ENABLED,
    )
