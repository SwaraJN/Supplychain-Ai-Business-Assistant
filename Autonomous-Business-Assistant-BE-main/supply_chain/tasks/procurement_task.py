"""
Procurement Task - Determines order quantities and requirements.
"""
from crewai import Task
from typing import Dict, Any, List


def create_procurement_task(agent, context: Dict[str, Any], materials_to_reorder: List[Dict[str, Any]]) -> Task:
    """
    Create the Procurement Task.
    
    Args:
        agent: The procurement agent
        context: Context dictionary
        materials_to_reorder: List of materials identified for reorder
        
    Returns:
        Configured Task
    """
    if not materials_to_reorder:
        description = """
        No materials require procurement at this time.
        All inventory levels are above the reorder threshold.
        
        Output a JSON response indicating no procurement needed.
        """
        
        expected_output = """
        {
            "procurement_needed": false,
            "message": "All inventory levels are adequate"
        }
        """
    else:
        # Get vendor data for the first material (in production, handle multiple)
        from supply_chain.services.data_fetcher import DataFetcher
        
        # Format material details with vendor intelligence
        material_details = []
        for item in materials_to_reorder:
            gap = item['max_capacity'] - item['current_stock']
            detail = (
                f"\n📦 {item['raw_material_name']} (ID: {item['raw_material_id']})"
                f"\n  Current: {item['current_stock']}, Max: {item['max_capacity']}, Gap: {gap:.2f} units"
                f"\n  Stock: {item['stock_percentage']:.1f}%"
            )
            
            # Add forecast if available
            if item.get('consumption_forecast'):
                forecast = item['consumption_forecast']
                detail += f"\n  📊 30-day forecast: {forecast.get('forecast_30_days', 0):.0f} units"
                if forecast.get('seasonal_multiplier', 1.0) != 1.0:
                    detail += f" (Seasonal: {forecast['seasonal_multiplier']}x)"
            
            # Get vendors for this material
            vendors = DataFetcher.get_vendors_by_material(item['raw_material_id'])
            if vendors:
                detail += "\n\n  💰 VENDOR OPTIONS WITH INTELLIGENCE:"
                for vendor in vendors:
                    detail += (
                        f"\n  • {vendor['name']}: ${vendor['price_per_unit']}/unit, {vendor['lead_time_days']} days"
                        f"\n    - Stated reliability: {vendor['reliability_score']}%"
                    )
                    
                    # Add performance history if available
                    if vendor.get('performance_history'):
                        perf = vendor['performance_history']
                        detail += (
                            f"\n    - ✓ ACTUAL on-time delivery: {perf.get('actual_on_time_percentage', 0):.1f}% (from {perf.get('total_orders', 0)} orders)"
                            f"\n    - Quality score: {perf.get('average_quality_score', 0):.1f}/5.0"
                            f"\n    - Avg delay: {perf.get('average_delay_days', 0):.1f} days"
                        )
                    
                    # Add price trends if available
                    if vendor.get('price_trends'):
                        trends = vendor['price_trends']
                        trend_status = trends.get('trend', 'unknown')
                        detail += f"\n    - 📈 Price trend: {trend_status.upper()}"
                        if trends.get('recommendation'):
                            detail += f" - {trends['recommendation']}"
            
            material_details.append(detail)
        
        description = f"""
        INTELLIGENT PROCUREMENT: Calculate optimal quantities AND select best vendors using historical data.
        
        🎯 MATERIALS REQUIRING PROCUREMENT WITH VENDOR INTELLIGENCE:
        {chr(10).join(material_details)}
        
        Your comprehensive procurement tasks:
        
        📊 STEP 1: CALCULATE ORDER QUANTITIES
        1. Use forecasted demand (if available) rather than just gap to max capacity
        2. Factor in seasonal multipliers (Valentine's 1.8x, etc.)
        3. Add safety stock buffer (typically 1.5x lead time consumption)
        4. Recommend order quantity = forecasted_30_days + safety_stock - current_stock
        
        💰 STEP 2: VENDOR ANALYSIS & COST OPTIMIZATION
        For EACH vendor option, apply the 40-30-30 WEIGHTED SCORING FORMULA:
        
        Formula: Total Score = (Price Score × 0.4) + (Lead Time Score × 0.3) + (Reliability Score × 0.3)
        
        - Price Score: Normalize prices (lowest = 100, scale others)
        - Lead Time Score: Normalize lead times (fastest = 100, scale others)
        - Reliability Score: Use ACTUAL on-time % from performance history (if available)
        
        ⚠️ CRITICAL: Trust ACTUAL performance data over stated reliability!
        
        📈 STEP 3: PRICE TREND ANALYSIS
        - If price trend is INCREASING → Consider buying more now (timing advantage)
        - If price trend is DECREASING → Consider buying less, wait for better price
        - If price trend is STABLE → Focus on reliability and lead time
        
        🎯 STEP 4: VENDOR SELECTION
        - Select vendor with HIGHEST total score (40-30-30 formula)
        - Justify selection with actual performance data
        - Calculate total cost = order_quantity × price_per_unit
        - Estimate delivery date = today + lead_time_days
        
        For EACH material, provide:
        - Material ID and name
        - Order quantity with forecast-based justification
        - ALL vendor scores (show 40-30-30 calculation)
        - SELECTED vendor with reasoning (why this vendor wins)
        - Total cost and delivery estimate
        - Urgency level (based on days until stockout)
        
        Output strict JSON format with complete procurement decisions.
        """
        
        expected_output = """
        {
            "procurement_needed": true,
            "materials": [
                {
                    "material_id": number,
                    "material_name": "string",
                    "current_stock": number,
                    "max_capacity": number,
                    "forecasted_30_day_need": number,
                    "recommended_order_quantity": number,
                    "order_justification": "string (explain forecast-based calculation)",
                    "vendor_analysis": [
                        {
                            "vendor_name": "string",
                            "price_score": number,
                            "lead_time_score": number,
                            "reliability_score": number,
                            "total_score": number,
                            "actual_performance": "string (from history)"
                        }
                    ],
                    "selected_vendor": {
                        "vendor_name": "string",
                        "vendor_id": number,
                        "price_per_unit": number,
                        "total_score": number,
                        "selection_reason": "string (why this vendor wins)",
                        "total_cost": number,
                        "estimated_delivery_days": number
                    },
                    "urgency": "urgent/high/medium/low"
                }
            ],
            "total_materials": number
        }
        """
    
    return Task(
        description=description,
        agent=agent,
        expected_output=expected_output,
    )
