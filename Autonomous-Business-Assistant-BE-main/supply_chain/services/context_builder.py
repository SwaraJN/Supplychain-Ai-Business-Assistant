"""
Context builder service for preparing structured data for agents.
Transforms ORM data into agent-friendly context dictionaries with historical intelligence.
"""
from typing import Dict, Any, List, Optional
import logging

from .data_fetcher import DataFetcher
from .historical_intelligence import HistoricalIntelligence

logger = logging.getLogger(__name__)


class ContextBuilder:
    """Service for building structured context for agents."""

    @staticmethod
    def build_full_context(goal: str) -> Dict[str, Any]:
        """
        Build complete context for the crew with all necessary data + historical intelligence.
        
        Args:
            goal: The goal to execute
            
        Returns:
            Structured context dictionary with intelligence
        """
        logger.info("Building full context with historical intelligence")
        
        # Fetch all necessary data
        inventory_data = DataFetcher.get_all_inventory()
        low_stock_items = [inv for inv in inventory_data if inv['needs_reorder']]
        recent_decisions = DataFetcher.get_recent_procurement_decisions(limit=5)
        
        # Add historical intelligence for low stock items
        for item in low_stock_items:
            material_id = item['raw_material_id']
            
            # Get consumption forecast
            forecast = HistoricalIntelligence.get_consumption_forecast(material_id, days_ahead=30)
            item['consumption_forecast'] = forecast
            
            # Get intelligent reorder point
            reorder_info = HistoricalIntelligence.get_intelligent_reorder_point(material_id)
            item['intelligent_reorder'] = reorder_info
        
        # Get AI learning insights
        ai_insights = HistoricalIntelligence.get_ai_learning_insights()
        
        context = {
            'goal': goal,
            'inventory': {
                'all_items': inventory_data,
                'low_stock_items': low_stock_items,
                'total_items': len(inventory_data),
                'items_needing_reorder': len(low_stock_items),
            },
            'historical_decisions': recent_decisions,
            'ai_learning_insights': ai_insights,
            'timestamp': None,  # Will be set during execution
        }
        
        logger.info(f"Context built: {len(inventory_data)} inventory items, "
                   f"{len(low_stock_items)} need reordering (with intelligence)")
        
        return context

    @staticmethod
    def build_inventory_context(material_id: Optional[int] = None) -> Dict[str, Any]:
        """
        Build inventory-specific context.
        
        Args:
            material_id: If provided, build context for specific material only
            
        Returns:
            Inventory context dictionary
        """
        if material_id:
            inventory = DataFetcher.get_inventory_by_material(material_id)
            if not inventory:
                return {'error': f'Material ID {material_id} not found'}
            
            return {
                'material_id': material_id,
                'inventory': inventory,
                'needs_reorder': inventory['needs_reorder'],
            }
        else:
            all_inventory = DataFetcher.get_all_inventory()
            low_stock = [inv for inv in all_inventory if inv['needs_reorder']]
            
            return {
                'all_inventory': all_inventory,
                'low_stock_items': low_stock,
                'total_items': len(all_inventory),
                'items_needing_reorder': len(low_stock),
            }

    @staticmethod
    def build_vendor_context(material_id: int) -> Dict[str, Any]:
        """
        Build vendor analysis context with historical intelligence.
        
        Args:
            material_id: The raw material ID
            
        Returns:
            Vendor context dictionary with performance history
        """
        vendors = DataFetcher.get_vendors_by_material(material_id)
        material = DataFetcher.get_raw_material_by_id(material_id)
        
        if not material:
            return {'error': f'Material ID {material_id} not found'}
        
        if not vendors:
            return {
                'error': f'No active vendors found for material: {material["name"]}',
                'material': material,
            }
        
        # Add historical intelligence for each vendor
        for vendor in vendors:
            vendor_id = vendor['vendor_id']
            
            # Get vendor performance intelligence
            performance = HistoricalIntelligence.get_vendor_intelligence(vendor_id)
            vendor['performance_history'] = performance
            
            # Get price trend analysis
            price_trends = HistoricalIntelligence.get_price_trend_analysis(vendor_id)
            vendor['price_trends'] = price_trends
        
        return {
            'material': material,
            'vendors': vendors,
            'vendor_count': len(vendors),
        }

    @staticmethod
    def build_procurement_context(
        material_id: int,
        order_quantity: float
    ) -> Dict[str, Any]:
        """
        Build procurement context with inventory, vendors, and quantity.
        
        Args:
            material_id: The raw material ID
            order_quantity: Quantity to order
            
        Returns:
            Procurement context dictionary
        """
        inventory = DataFetcher.get_inventory_by_material(material_id)
        vendors = DataFetcher.get_vendors_by_material(material_id)
        material = DataFetcher.get_raw_material_by_id(material_id)
        
        if not all([inventory, material]):
            return {'error': 'Material or inventory not found'}
        
        return {
            'material': material,
            'inventory': inventory,
            'vendors': vendors,
            'order_quantity': order_quantity,
            'required_to_restock': float(inventory['max_capacity']) - float(inventory['current_stock']),
        }

    @staticmethod
    def build_decision_memory_context(limit: int = 5) -> List[Dict[str, Any]]:
        """
        Build context from recent procurement decisions for agent memory.
        
        Args:
            limit: Number of recent decisions to include
            
        Returns:
            List of decision summaries
        """
        decisions = DataFetcher.get_recent_procurement_decisions(limit)
        
        summaries = []
        for decision in decisions:
            summaries.append({
                'material': decision['raw_material_name'],
                'vendor': decision['selected_vendor_name'],
                'quantity': decision['order_quantity'],
                'cost': decision['expected_cost'],
                'confidence': decision['confidence_score'],
                'when': decision['created_at'],
                'rationale': decision['explanation'].get('summary', '') if isinstance(decision['explanation'], dict) else '',
            })
        
        return summaries

    @staticmethod
    def extract_materials_from_inventory(inventory_context: Dict[str, Any]) -> List[int]:
        """
        Extract material IDs that need reordering from inventory context.
        
        Args:
            inventory_context: Inventory context dictionary
            
        Returns:
            List of material IDs needing reorder
        """
        low_stock = inventory_context.get('low_stock_items', [])
        return [item['raw_material_id'] for item in low_stock]

    @staticmethod
    def prepare_agent_input(
        goal: str,
        inventory_data: Dict[str, Any],
        vendors_data: Optional[Dict[str, Any]] = None,
        historical_context: Optional[List[Dict[str, Any]]] = None
    ) -> str:
        """
        Prepare formatted input string for agents.
        
        Args:
            goal: The execution goal
            inventory_data: Inventory context
            vendors_data: Optional vendor context
            historical_context: Optional historical decisions
            
        Returns:
            Formatted string for agent input
        """
        lines = [
            f"GOAL: {goal}",
            "",
            "INVENTORY STATUS:",
        ]
        
        # Add inventory information
        if 'low_stock_items' in inventory_data:
            lines.append(f"Total items: {inventory_data.get('total_items', 0)}")
            lines.append(f"Items needing reorder: {inventory_data.get('items_needing_reorder', 0)}")
            lines.append("")
            
            if inventory_data['low_stock_items']:
                lines.append("LOW STOCK ITEMS:")
                for item in inventory_data['low_stock_items']:
                    lines.append(
                        f"  - {item['raw_material_name']} ({item['raw_material_sku']}): "
                        f"{item['current_stock']}/{item['max_capacity']} "
                        f"({item['stock_percentage']:.1f}%)"
                    )
        
        # Add vendor information if provided
        if vendors_data and 'vendors' in vendors_data:
            lines.append("")
            lines.append("AVAILABLE VENDORS:")
            for vendor in vendors_data['vendors']:
                lines.append(
                    f"  - {vendor['name']}: ${vendor['price_per_unit']}/unit, "
                    f"{vendor['lead_time_days']} days, "
                    f"reliability {vendor['reliability_score']}%"
                )
        
        # Add historical context if provided
        if historical_context:
            lines.append("")
            lines.append("RECENT DECISIONS:")
            for decision in historical_context[:3]:  # Show only last 3
                lines.append(
                    f"  - {decision['material']}: {decision['vendor']}, "
                    f"qty {decision['quantity']}, cost ${decision['cost']}"
                )
        
        return "\n".join(lines)
