"""
Historical Intelligence Service for AI-driven decision making.
Analyzes historical data to provide intelligent insights for procurement.
"""
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta, date
from decimal import Decimal
from django.db.models import Avg, Sum, Count, Q, F
from django.utils import timezone
import logging

from supply_chain.models import (
    MaterialConsumptionHistory,
    VendorPerformanceHistory,
    SeasonalPattern,
    PriceHistory,
    AIDecisionFeedback,
    ProcurementDecision,
    Vendor,
    RawMaterialInventory
)

logger = logging.getLogger(__name__)


class HistoricalIntelligence:
    """Service for analyzing historical data and providing intelligent insights."""
    
    @staticmethod
    def get_consumption_forecast(material_id: int, days_ahead: int = 30) -> Dict[str, Any]:
        """
        Predict future consumption based on historical patterns.
        
        Args:
            material_id: Raw material ID
            days_ahead: Number of days to forecast
            
        Returns:
            Forecast dictionary with predictions
        """
        try:
            material = RawMaterialInventory.objects.get(id=material_id)
            
            # Get last 90 days of consumption history
            ninety_days_ago = timezone.now().date() - timedelta(days=90)
            history = MaterialConsumptionHistory.objects.filter(
                raw_material_id=material_id,
                date__gte=ninety_days_ago
            ).order_by('-date')
            
            if not history.exists():
                return {
                    'material_id': material_id,
                    'material_name': material.name,
                    'forecast_available': False,
                    'reason': 'Insufficient historical data',
                    'predicted_consumption': 0,
                    'confidence': 0
                }
            
            # Calculate average daily consumption
            avg_daily = history.aggregate(avg=Avg('quantity_consumed'))['avg'] or 0
            
            # Check for seasonal patterns
            current_month = timezone.now().month
            seasonal = SeasonalPattern.objects.filter(
                raw_material_id=material_id,
                month=current_month
            ).first()
            
            seasonal_multiplier = float(seasonal.demand_multiplier) if seasonal else 1.0
            seasonal_confidence = float(seasonal.confidence_level) if seasonal else 50.0
            
            # Apply seasonal adjustment
            adjusted_daily = float(avg_daily) * seasonal_multiplier
            predicted_consumption = adjusted_daily * days_ahead
            
            # Calculate confidence based on data availability and variance
            data_points = history.count()
            confidence = min(95, (data_points / 90) * 100)  # Max 95% confidence
            
            # Adjust confidence based on seasonal data
            if seasonal:
                confidence = (confidence + seasonal_confidence) / 2
            
            return {
                'material_id': material_id,
                'material_name': material.name,
                'forecast_available': True,
                'days_ahead': days_ahead,
                'average_daily_consumption': round(float(avg_daily), 2),
                'seasonal_multiplier': seasonal_multiplier,
                'seasonal_notes': seasonal.notes if seasonal else None,
                'predicted_consumption': round(predicted_consumption, 2),
                'confidence_percentage': round(confidence, 2),
                'data_points_used': data_points,
                'forecast_date': (timezone.now().date() + timedelta(days=days_ahead)).isoformat()
            }
            
        except RawMaterialInventory.DoesNotExist:
            logger.error(f"Material {material_id} not found")
            return {'forecast_available': False, 'reason': 'Material not found'}
    
    @staticmethod
    def get_vendor_intelligence(vendor_id: int) -> Dict[str, Any]:
        """
        Get comprehensive vendor intelligence based on historical performance.
        
        Args:
            vendor_id: Vendor ID
            
        Returns:
            Vendor intelligence report
        """
        try:
            vendor = Vendor.objects.get(id=vendor_id)
            
            # Get performance history
            performance = VendorPerformanceHistory.objects.filter(vendor_id=vendor_id)
            
            if not performance.exists():
                return {
                    'vendor_id': vendor_id,
                    'vendor_name': vendor.name,
                    'intelligence_available': False,
                    'reason': 'No historical performance data',
                    'current_reliability_score': float(vendor.reliability_score)
                }
            
            # Calculate key metrics
            total_orders = performance.count()
            on_time_count = performance.filter(on_time_delivery=True).count()
            on_time_percentage = (on_time_count / total_orders) * 100 if total_orders > 0 else 0
            
            avg_delay = performance.aggregate(avg=Avg('delivery_delay_days'))['avg'] or 0
            avg_quality = performance.aggregate(avg=Avg('quality_score'))['avg'] or 0
            avg_satisfaction = performance.aggregate(avg=Avg('overall_satisfaction'))['avg'] or 0
            avg_cost_accuracy = performance.aggregate(avg=Avg('cost_accuracy'))['avg'] or 100
            
            # Recent trend (last 5 orders vs overall)
            recent_performance = performance.order_by('-order_date')[:5]
            recent_on_time = recent_performance.filter(on_time_delivery=True).count()
            recent_trend = 'improving' if recent_on_time > (on_time_count / total_orders * 5) else 'stable'
            if recent_on_time < (on_time_count / total_orders * 5):
                recent_trend = 'declining'
            
            # Calculate recommended reliability score based on actual performance
            calculated_reliability = (
                (on_time_percentage * 0.4) +  # 40% weight on delivery
                (float(avg_quality or 75) * 0.3) +  # 30% weight on quality
                (float(avg_satisfaction) * 0.3)  # 30% weight on satisfaction
            )
            
            return {
                'vendor_id': vendor_id,
                'vendor_name': vendor.name,
                'intelligence_available': True,
                'total_orders': total_orders,
                'on_time_delivery_percentage': round(on_time_percentage, 2),
                'average_delay_days': round(float(avg_delay), 2),
                'average_quality_score': round(float(avg_quality or 0), 2),
                'average_satisfaction': round(float(avg_satisfaction), 2),
                'cost_accuracy_percentage': round(float(avg_cost_accuracy), 2),
                'performance_trend': recent_trend,
                'current_stated_reliability': float(vendor.reliability_score),
                'calculated_reliability_score': round(calculated_reliability, 2),
                'recommendation': 'Update reliability score' if abs(calculated_reliability - float(vendor.reliability_score)) > 10 else 'Score accurate'
            }
            
        except Vendor.DoesNotExist:
            logger.error(f"Vendor {vendor_id} not found")
            return {'intelligence_available': False, 'reason': 'Vendor not found'}
    
    @staticmethod
    def get_price_trend_analysis(vendor_id: int) -> Dict[str, Any]:
        """
        Analyze historical price trends for a vendor.
        
        Args:
            vendor_id: Vendor ID
            
        Returns:
            Price trend analysis
        """
        try:
            vendor = Vendor.objects.get(id=vendor_id)
            
            # Get price history
            history = PriceHistory.objects.filter(vendor_id=vendor_id).order_by('-effective_date')[:12]
            
            if not history.exists():
                return {
                    'vendor_id': vendor_id,
                    'vendor_name': vendor.name,
                    'trend_available': False,
                    'current_price': float(vendor.price_per_unit)
                }
            
            prices = list(history.values('effective_date', 'price_per_unit', 'price_change_percentage'))
            
            # Calculate trend
            if len(prices) >= 2:
                latest_price = float(prices[0]['price_per_unit'])
                oldest_price = float(prices[-1]['price_per_unit'])
                total_change = ((latest_price - oldest_price) / oldest_price) * 100
                
                trend_direction = 'increasing' if total_change > 5 else 'stable'
                if total_change < -5:
                    trend_direction = 'decreasing'
                    
                avg_change = sum(float(p['price_change_percentage']) for p in prices) / len(prices)
            else:
                total_change = 0
                trend_direction = 'insufficient data'
                avg_change = 0
            
            return {
                'vendor_id': vendor_id,
                'vendor_name': vendor.name,
                'material_name': vendor.material_supply.name,
                'trend_available': True,
                'current_price': float(vendor.price_per_unit),
                'price_history': [
                    {
                        'date': p['effective_date'].isoformat() if isinstance(p['effective_date'], date) else p['effective_date'],
                        'price': float(p['price_per_unit']),
                        'change_percentage': float(p['price_change_percentage'])
                    }
                    for p in prices
                ],
                'trend_direction': trend_direction,
                'total_change_percentage': round(total_change, 2),
                'average_change_percentage': round(avg_change, 2),
                'data_points': len(prices)
            }
            
        except Vendor.DoesNotExist:
            logger.error(f"Vendor {vendor_id} not found")
            return {'trend_available': False, 'reason': 'Vendor not found'}
    
    @staticmethod
    def get_ai_learning_insights() -> Dict[str, Any]:
        """
        Analyze AI decision feedback for continuous learning.
        
        Returns:
            Learning insights from past decisions
        """
        # Get all feedback
        feedback = AIDecisionFeedback.objects.all()
        
        if not feedback.exists():
            return {
                'insights_available': False,
                'reason': 'No feedback data yet',
                'total_decisions': ProcurementDecision.objects.count()
            }
        
        total_feedback = feedback.count()
        approved_count = feedback.filter(decision_approved=True).count()
        approval_rate = (approved_count / total_feedback) * 100
        
        # Analyze cost variance
        avg_cost_variance = feedback.aggregate(avg=Avg('cost_variance_percentage'))['avg'] or 0
        
        # Analyze delivery variance
        avg_delivery_variance = feedback.aggregate(avg=Avg('delivery_variance_days'))['avg'] or 0
        
        # Get common issues from user feedback
        feedback_with_comments = feedback.exclude(user_feedback='').count()
        
        # Recent performance (last 10 decisions)
        recent_feedback = feedback.order_by('-created_at')[:10]
        recent_approval = recent_feedback.filter(decision_approved=True).count()
        recent_approval_rate = (recent_approval / min(10, recent_feedback.count())) * 100
        
        trend = 'improving' if recent_approval_rate > approval_rate else 'stable'
        if recent_approval_rate < (approval_rate - 10):
            trend = 'needs attention'
        
        return {
            'insights_available': True,
            'total_decisions_with_feedback': total_feedback,
            'overall_approval_rate': round(approval_rate, 2),
            'recent_approval_rate': round(recent_approval_rate, 2),
            'performance_trend': trend,
            'average_cost_variance_percentage': round(float(avg_cost_variance), 2),
            'average_delivery_variance_days': round(float(avg_delivery_variance), 2),
            'feedback_comments_count': feedback_with_comments,
            'recommendation': self._get_learning_recommendation(
                approval_rate, 
                float(avg_cost_variance),
                float(avg_delivery_variance)
            )
        }
    
    @staticmethod
    def _get_learning_recommendation(approval_rate: float, cost_variance: float, delivery_variance: float) -> str:
        """Generate recommendation based on learning metrics."""
        issues = []
        
        if approval_rate < 70:
            issues.append("Low approval rate - review decision criteria")
        if abs(cost_variance) > 15:
            issues.append("High cost variance - improve price predictions")
        if abs(delivery_variance) > 5:
            issues.append("High delivery variance - refine lead time estimates")
        
        if not issues:
            return "AI performance is good - continue learning from feedback"
        
        return " | ".join(issues)
    
    @staticmethod
    def get_intelligent_reorder_point(material_id: int) -> Dict[str, Any]:
        """
        Calculate intelligent reorder point based on historical consumption and lead times.
        
        Args:
            material_id: Raw material ID
            
        Returns:
            Recommended reorder point and quantity
        """
        try:
            material = RawMaterialInventory.objects.get(id=material_id)
            
            # Get consumption forecast
            forecast_30_days = HistoricalIntelligence.get_consumption_forecast(material_id, 30)
            
            if not forecast_30_days.get('forecast_available'):
                # Fallback to current threshold
                return {
                    'material_id': material_id,
                    'material_name': material.name,
                    'recommendation_available': False,
                    'current_reorder_percentage': float(material.reorder_threshold_percentage),
                    'reason': 'Insufficient data for intelligent calculation'
                }
            
            # Get average vendor lead time for this material
            vendors = Vendor.objects.filter(material_supply_id=material_id, is_active=True)
            if vendors.exists():
                avg_lead_time = vendors.aggregate(avg=Avg('lead_time_days'))['avg'] or 30
            else:
                avg_lead_time = 30  # Default
            
            # Calculate buffer stock (safety stock) - 1.5x average consumption during lead time
            daily_consumption = forecast_30_days.get('average_daily_consumption', 0)
            lead_time_consumption = daily_consumption * float(avg_lead_time)
            safety_stock = lead_time_consumption * 1.5  # 50% buffer
            
            # Calculate recommended reorder point
            reorder_point = lead_time_consumption + safety_stock
            reorder_percentage = (reorder_point / float(material.max_capacity)) * 100
            
            # Calculate optimal order quantity (EOQ approximation)
            optimal_quantity = float(material.max_capacity) - reorder_point
            
            return {
                'material_id': material_id,
                'material_name': material.name,
                'recommendation_available': True,
                'current_stock': float(material.current_stock),
                'current_stock_percentage': material.stock_percentage,
                'current_reorder_threshold_percentage': float(material.reorder_threshold_percentage),
                'recommended_reorder_percentage': round(reorder_percentage, 2),
                'recommended_reorder_quantity': round(reorder_point, 2),
                'optimal_order_quantity': round(optimal_quantity, 2),
                'average_lead_time_days': round(float(avg_lead_time), 2),
                'daily_consumption_rate': round(daily_consumption, 2),
                'safety_stock': round(safety_stock, 2),
                'confidence': forecast_30_days.get('confidence_percentage', 0),
                'recommendation': 'Update threshold' if abs(reorder_percentage - float(material.reorder_threshold_percentage)) > 5 else 'Current threshold optimal'
            }
            
        except RawMaterialInventory.DoesNotExist:
            logger.error(f"Material {material_id} not found")
            return {'recommendation_available': False, 'reason': 'Material not found'}
    
    @staticmethod
    def format_historical_context_for_agents(material_id: int) -> str:
        """
        Format historical intelligence as context string for AI agents.
        
        Args:
            material_id: Raw material ID
            
        Returns:
            Formatted context string
        """
        forecast = HistoricalIntelligence.get_consumption_forecast(material_id, 30)
        reorder_intel = HistoricalIntelligence.get_intelligent_reorder_point(material_id)
        
        context = "HISTORICAL INTELLIGENCE:\n\n"
        
        if forecast.get('forecast_available'):
            context += f"Consumption Forecast (30 days):\n"
            context += f"- Predicted consumption: {forecast['predicted_consumption']} units\n"
            context += f"- Daily average: {forecast['average_daily_consumption']} units/day\n"
            context += f"- Seasonal adjustment: {forecast['seasonal_multiplier']}x\n"
            if forecast.get('seasonal_notes'):
                context += f"- Seasonal notes: {forecast['seasonal_notes']}\n"
            context += f"- Confidence: {forecast['confidence_percentage']}%\n"
            context += f"- Based on {forecast['data_points_used']} data points\n\n"
        
        if reorder_intel.get('recommendation_available'):
            context += f"Intelligent Reorder Analysis:\n"
            context += f"- Recommended reorder point: {reorder_intel['recommended_reorder_percentage']}%\n"
            context += f"- Optimal order quantity: {reorder_intel['optimal_order_quantity']} units\n"
            context += f"- Safety stock buffer: {reorder_intel['safety_stock']} units\n"
            context += f"- Average vendor lead time: {reorder_intel['average_lead_time_days']} days\n\n"
        
        return context
