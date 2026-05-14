"""
Decision memory service for storing and retrieving procurement decisions.
Supports agent memory and learning from past decisions.
"""
from typing import List, Dict, Any, Optional
import logging
from datetime import datetime, timedelta

from .data_fetcher import DataFetcher

logger = logging.getLogger(__name__)


class DecisionMemory:
    """Service for managing procurement decision history and memory."""

    @staticmethod
    def save_decision(
        goal: str,
        raw_material_id: int,
        inventory_status: Dict[str, Any],
        procurement_required: bool,
        selected_vendor_id: Optional[int],
        order_quantity: float,
        expected_cost: float,
        confidence_score: float,
        explanation: Dict[str, Any]
    ) -> int:
        """
        Save a procurement decision to memory.
        
        Args:
            goal: The goal that triggered this decision
            raw_material_id: Material ID
            inventory_status: Snapshot of inventory at decision time
            procurement_required: Whether procurement was needed
            selected_vendor_id: Chosen vendor ID (if any)
            order_quantity: Quantity to order
            expected_cost: Total expected cost
            confidence_score: AI confidence score
            explanation: Detailed explanation dictionary
            
        Returns:
            Decision ID
        """
        decision_data = {
            'goal': goal,
            'raw_material_id': raw_material_id,
            'selected_vendor_id': selected_vendor_id,
            'order_quantity': order_quantity,
            'expected_cost': expected_cost,
            'confidence_score': confidence_score,
            'explanation': explanation,
            'procurement_required': procurement_required,
            'inventory_status': inventory_status,
        }
        
        decision_id = DataFetcher.save_procurement_decision(decision_data)
        logger.info(f"Decision saved to memory with ID: {decision_id}")
        
        return decision_id

    @staticmethod
    def get_recent_decisions(limit: int = 5) -> List[Dict[str, Any]]:
        """
        Retrieve recent procurement decisions.
        
        Args:
            limit: Number of decisions to retrieve
            
        Returns:
            List of recent decisions
        """
        return DataFetcher.get_recent_procurement_decisions(limit)

    @staticmethod
    def get_decisions_by_material(
        material_id: int,
        limit: int = 10
    ) -> List[Dict[str, Any]]:
        """
        Get procurement decisions for a specific material.
        
        Args:
            material_id: Material ID
            limit: Maximum number of decisions to retrieve
            
        Returns:
            List of decisions for the material
        """
        all_decisions = DataFetcher.get_recent_procurement_decisions(limit * 2)
        material_decisions = [
            d for d in all_decisions
            if d.get('raw_material_id') == material_id
        ]
        
        return material_decisions[:limit]

    @staticmethod
    def get_successful_patterns(min_confidence: float = 75.0) -> List[Dict[str, Any]]:
        """
        Extract patterns from high-confidence decisions.
        
        Args:
            min_confidence: Minimum confidence score to consider
            
        Returns:
            List of successful decision patterns
        """
        recent_decisions = DataFetcher.get_recent_procurement_decisions(20)
        
        successful = [
            d for d in recent_decisions
            if d['confidence_score'] >= min_confidence
        ]
        
        patterns = []
        for decision in successful:
            patterns.append({
                'material': decision['raw_material_name'],
                'vendor': decision['selected_vendor_name'],
                'avg_quantity': decision['order_quantity'],
                'avg_cost': decision['expected_cost'],
                'confidence': decision['confidence_score'],
                'reasoning': decision['explanation'].get('summary', '') if isinstance(decision['explanation'], dict) else '',
            })
        
        logger.info(f"Found {len(patterns)} successful patterns with confidence >= {min_confidence}")
        return patterns

    @staticmethod
    def format_memory_for_agent(limit: int = 5) -> str:
        """
        Format recent decisions as a string for agent context.
        
        Args:
            limit: Number of recent decisions to include
            
        Returns:
            Formatted string of decision history
        """
        decisions = DecisionMemory.get_recent_decisions(limit)
        
        if not decisions:
            return "No previous procurement decisions available."
        
        lines = ["PREVIOUS PROCUREMENT DECISIONS:"]
        for i, decision in enumerate(decisions, 1):
            lines.append(
                f"{i}. {decision['raw_material_name']}: "
                f"Ordered {decision['order_quantity']} units from {decision['selected_vendor_name']} "
                f"at ${decision['expected_cost']} "
                f"(confidence: {decision['confidence_score']}%)"
            )
            
            if isinstance(decision['explanation'], dict) and 'summary' in decision['explanation']:
                lines.append(f"   Reasoning: {decision['explanation']['summary']}")
        
        return "\n".join(lines)

    @staticmethod
    def analyze_vendor_performance(vendor_name: str) -> Dict[str, Any]:
        """
        Analyze historical performance of a vendor.
        
        Args:
            vendor_name: Name of the vendor to analyze
            
        Returns:
            Vendor performance metrics
        """
        all_decisions = DataFetcher.get_recent_procurement_decisions(50)
        vendor_decisions = [
            d for d in all_decisions
            if d['selected_vendor_name'] == vendor_name
        ]
        
        if not vendor_decisions:
            return {
                'vendor_name': vendor_name,
                'total_orders': 0,
                'message': 'No historical data available'
            }
        
        total_cost = sum(d['expected_cost'] for d in vendor_decisions)
        avg_confidence = sum(d['confidence_score'] for d in vendor_decisions) / len(vendor_decisions)
        
        return {
            'vendor_name': vendor_name,
            'total_orders': len(vendor_decisions),
            'total_cost': total_cost,
            'average_confidence': avg_confidence,
            'materials_supplied': list(set(d['raw_material_name'] for d in vendor_decisions)),
        }

    @staticmethod
    def get_learning_insights() -> Dict[str, Any]:
        """
        Extract learning insights from decision history.
        
        Returns:
            Dictionary of insights and patterns
        """
        decisions = DataFetcher.get_recent_procurement_decisions(30)
        
        if not decisions:
            return {'insights': 'Insufficient data for insights'}
        
        # Calculate statistics
        avg_confidence = sum(d['confidence_score'] for d in decisions) / len(decisions)
        procurement_rate = sum(1 for d in decisions if d['procurement_required']) / len(decisions) * 100
        
        # Most frequent vendors
        vendor_counts = {}
        for d in decisions:
            vendor = d.get('selected_vendor_name')
            if vendor:
                vendor_counts[vendor] = vendor_counts.get(vendor, 0) + 1
        
        most_used_vendor = max(vendor_counts.items(), key=lambda x: x[1])[0] if vendor_counts else None
        
        return {
            'total_decisions': len(decisions),
            'average_confidence': round(avg_confidence, 2),
            'procurement_rate': round(procurement_rate, 2),
            'most_used_vendor': most_used_vendor,
            'insights': f"System has made {len(decisions)} decisions with {avg_confidence:.1f}% average confidence. "
                       f"Procurement was required in {procurement_rate:.1f}% of cases."
        }
