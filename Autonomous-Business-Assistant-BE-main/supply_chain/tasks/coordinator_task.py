"""
Coordinator Task - Validates and synthesizes final procurement decision.
"""
from crewai import Task
from typing import Dict, Any


def create_coordinator_task(agent, context: Dict[str, Any]) -> Task:
    """
    Create the Coordinator Task.
    
    Args:
        agent: The coordinator agent
        context: Full context including all previous outputs
        
    Returns:
        Configured Task
    """
    goal = context.get('goal', '')
    
    description = f"""
    Orchestrate and validate the complete procurement workflow, then produce the final decision.
    
    ORIGINAL GOAL: {goal}
    
    Your task as Coordinator:
    
    1. VALIDATE WORKFLOW:
       - Verify that inventory was properly checked
       - Confirm procurement requirements were calculated
       - Ensure vendor analysis was thorough
       - Validate cost optimization was applied correctly
    
    2. CHECK CONSISTENCY:
       - All material IDs match across outputs
       - Quantities are reasonable and justified
       - Selected vendors are actually available
       - Costs are accurately calculated
    
    3. SYNTHESIZE RESULTS:
       - Combine insights from all agents
       - Resolve any conflicts or inconsistencies
       - Ensure completeness of the decision
    
    4. PRODUCE FINAL OUTPUT:
       Create a comprehensive JSON response with ALL required fields:
       
       - goal: The original goal
       - inventory_status: Complete inventory snapshot
       - procurement_required: boolean (true if any material below threshold)
       - selected_vendor: Full vendor details (or null if no procurement needed)
       - order_quantity: Quantity to order (or 0 if no procurement)
       - expected_cost: Total cost (or 0 if no procurement)
       - confidence_score: AI confidence (0-100)
       - explanation: Detailed, human-readable explanation including:
         * What was analyzed
         * Why procurement was/wasn't needed
         * How the vendor was selected
         * What the expected outcomes are
         * Any risks or considerations
    
    5. QUALITY ASSURANCE:
       - Ensure all numbers are accurate
       - Verify the explanation is clear and complete
       - Confirm the decision is actionable
       - Check that confidence score reflects decision quality
    
    Output STRICT JSON format. This is the final output that will be returned to the user.
    """
    
    expected_output = """
    {
        "goal": "string",
        "inventory_status": {
            "total_items": number,
            "items_checked": number,
            "items_below_threshold": number,
            "materials_needing_reorder": [
                {
                    "material_name": "string",
                    "sku": "string",
                    "current_stock": number,
                    "max_capacity": number,
                    "stock_percentage": number
                }
            ]
        },
        "procurement_required": boolean,
        "selected_vendor": {
            "vendor_id": number,
            "vendor_name": "string",
            "material_name": "string",
            "price_per_unit": number,
            "lead_time_days": number,
            "reliability_score": number
        } or null,
        "order_quantity": number,
        "expected_cost": number,
        "confidence_score": number,
        "explanation": "Comprehensive explanation covering: analysis performed, procurement decision rationale, vendor selection reasoning, expected outcomes, and any considerations"
    }
    """
    
    return Task(
        description=description,
        agent=agent,
        expected_output=expected_output,
    )
