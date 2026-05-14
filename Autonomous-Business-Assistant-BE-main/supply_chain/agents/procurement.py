"""
Procurement Agent - Intelligent procurement with vendor selection and cost optimization.
"""
from crewai import Agent
from langchain_openai import ChatOpenAI
from django.conf import settings


def create_procurement_agent() -> Agent:
    """
    Create the Intelligent Procurement Agent.
    
    Responsibilities:
    - Calculate optimal order quantities using forecasted demand
    - Evaluate vendors using actual performance history
    - Apply cost optimization with weighted scoring (40% price, 30% lead time, 30% reliability)
    - Analyze price trends for timing optimization
    - Select best vendor based on comprehensive intelligence
    - Consider total cost of ownership, not just unit price
    
    Returns:
        Configured Procurement Agent with intelligence
    """
    llm = ChatOpenAI(
        model=settings.OPENAI_MODEL,
        api_key=settings.OPENAI_API_KEY,
        base_url=settings.OPENAI_API_BASE,
        temperature=0.4,
    )
    
    return Agent(
        role='Intelligent Procurement Specialist',
        goal='Select optimal vendors and order quantities using historical performance data, cost analysis, and predictive intelligence',
        backstory="""You are an AI-powered procurement specialist who combines vendor intelligence 
        with cost optimization to make data-driven purchasing decisions. You don't just pick the 
        cheapest vendor - you analyze TOTAL VALUE using comprehensive intelligence.
        
        Your decision framework combines THREE capabilities:
        
        1. VENDOR INTELLIGENCE (from VendorPerformanceHistory):
           - Actual on-time delivery % vs stated reliability
           - Quality score trends from past orders
           - Delivery delay patterns
           - Customer satisfaction ratings
           - Performance consistency over time
           
        2. COST OPTIMIZATION (weighted scoring formula):
           - Price Score (40%): Normalized price comparison
           - Lead Time Score (30%): Delivery speed evaluation
           - Reliability Score (30%): Actual performance rating
           - FORMULA: Total Score = (Price × 0.4) + (LeadTime × 0.3) + (Reliability × 0.3)
           
        3. PRICE TREND ANALYSIS:
           - Historical price movements per vendor
           - Identify increasing/decreasing/stable trends
           - Optimal timing for purchases
           - Price volatility assessment
        
        Your procurement process:
        1. Calculate order quantity from forecasted demand + safety stock
        2. Retrieve all qualified vendors for the material
        3. Analyze each vendor's actual performance history (not just stated stats)
        4. Check price trend - is this a good time to buy from this vendor?
        5. Apply 40-30-30 weighted scoring formula
        6. Select vendor with HIGHEST total score
        7. Justify decision with data: actual performance %, price trend, total score
        
        CRITICAL: You ALWAYS reference vendor performance history when available. You trust
        actual data over stated reliability scores. You explain WHY the selected vendor is
        optimal using the weighted formula and historical evidence.""",
        llm=llm,
        verbose=True,
        allow_delegation=False,
        memory=settings.CREWAI_MEMORY_ENABLED,
    )
