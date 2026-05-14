"""
Inventory Task - Monitors inventory and identifies reorder needs.
"""
from crewai import Task
from typing import Dict, Any


def create_inventory_task(agent, context: Dict[str, Any]) -> Task:
    """
    Create the Inventory Monitoring Task.
    
    Args:
        agent: The inventory monitoring agent
        context: Context dictionary with inventory data
        
    Returns:
        Configured Task
    """
    inventory_data = context.get('inventory', {})
    all_items = inventory_data.get('all_items', [])
    low_stock_items = inventory_data.get('low_stock_items', [])
    
    # Format inventory information with historical intelligence
    inventory_details = []
    for item in all_items:
        detail = (
            f"- {item['raw_material_name']} (ID: {item['raw_material_id']}): "
            f"{item['current_stock']}/{item['max_capacity']} units "
            f"({item['stock_percentage']:.2f}%) - "
            f"Threshold: {item['reorder_threshold']}%"
        )
        
        # Add forecast data if available for low stock items
        if item.get('consumption_forecast'):
            forecast = item['consumption_forecast']
            detail += (
                f"\n  📊 Historical Intelligence:"
                f"\n    - Daily avg consumption: {forecast.get('daily_average', 0):.2f} units"
                f"\n    - 30-day forecast: {forecast.get('forecast_30_days', 0):.2f} units"
            )
            if forecast.get('seasonal_multiplier', 1.0) != 1.0:
                detail += f"\n    - ⚠️ Seasonal multiplier: {forecast['seasonal_multiplier']}x (Valentine's/Christmas/etc)"
            detail += f"\n    - Confidence: {forecast.get('confidence', 0)*100:.0f}%"
        
        if item.get('intelligent_reorder'):
            reorder = item['intelligent_reorder']
            detail += (
                f"\n  🎯 Intelligent Reorder Point: {reorder.get('recommended_reorder_point', 0):.0f} units"
                f"\n    - Safety stock buffer: {reorder.get('safety_stock', 0):.0f} units"
            )
        
        inventory_details.append(detail)
    
    description = f"""
    Monitor inventory with PREDICTIVE INTELLIGENCE and identify materials requiring reorder.
    
    🎯 CRITICAL RULE: Materials need reorder when stock_percentage < 25% (or at intelligent reorder point)
    
    📊 CURRENT INVENTORY WITH HISTORICAL INTELLIGENCE:
    {chr(10).join(inventory_details)}
    
    Your intelligent analysis tasks:
    1. Review stock percentages AND historical consumption forecasts
    2. Apply seasonal adjustments if present (Valentine's 1.8x, Christmas 2.0x, etc.)
    3. Calculate days until stockout = current_stock / (daily_average × seasonal_multiplier)
    4. Compare against reorder thresholds AND intelligent reorder points
    5. Identify materials at RISK of stockout (not just below 25%)
    6. Flag URGENT items where stockout risk < vendor lead time
    7. Prioritize by risk level: URGENT > HIGH > MEDIUM > LOW
    
    For EACH material needing attention, provide:
    - Material name and SKU
    - Current stock vs max capacity
    - Stock percentage
    - Days until stockout (if forecast available)
    - Seasonal factors affecting demand
    - Risk level with justification
    
    Use historical data to be PREDICTIVE, not just REACTIVE!
    
    Output strict JSON format with:
    - total_items_checked: number
    - items_below_threshold: list of material details with risk assessment
    - procurement_required: boolean
    - priority_materials: list of material IDs ordered by RISK (urgent first)
    """
    
    expected_output = """
    A JSON object:
    {
        "total_items_checked": number,
        "items_below_threshold": [
            {
                "material_id": number,
                "material_name": "string",
                "sku": "string",
                "current_stock": number,
                "max_capacity": number,
                "stock_percentage": number,
                "threshold": number,
                "shortage_severity": "high/medium/low"
            }
        ],
        "procurement_required": boolean,
        "priority_materials": [material_id1, material_id2, ...]
    }
    """
    
    return Task(
        description=description,
        agent=agent,
        expected_output=expected_output,
    )
