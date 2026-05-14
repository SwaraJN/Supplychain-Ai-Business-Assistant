"""
Planner Task - Analyzes goals and creates execution plans.
"""
from crewai import Task
from typing import Dict, Any


def create_planner_task(agent, context: Dict[str, Any]) -> Task:
    """
    Create the Planner Task.
    
    Args:
        agent: The planner agent
        context: Context dictionary with goal and data
        
    Returns:
        Configured Task
    """
    goal = context.get('goal', '')
    inventory_summary = context.get('inventory', {})
    
    description = f"""
    Analyze the following goal and create a structured execution plan:
    
    GOAL: {goal}
    
    INVENTORY OVERVIEW:
    - Total items: {inventory_summary.get('total_items', 0)}
    - Items needing reorder: {inventory_summary.get('items_needing_reorder', 0)}
    
    Your task:
    1. Understand what the goal requires
    2. Determine if inventory monitoring is needed
    3. Determine if procurement action is required
    4. Create a clear execution strategy
    
    Output a JSON plan with:
    - goal_understood: boolean
    - requires_inventory_check: boolean
    - requires_procurement: boolean
    - execution_strategy: string
    - next_steps: list of strings
    """
    
    expected_output = """
    A JSON object containing:
    {
        "goal_understood": true/false,
        "requires_inventory_check": true/false,
        "requires_procurement": true/false,
        "execution_strategy": "description of the approach",
        "next_steps": ["step 1", "step 2", ...]
    }
    """
    
    return Task(
        description=description,
        agent=agent,
        expected_output=expected_output,
    )
