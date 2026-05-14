"""
Data fetcher service for accessing database via Django ORM.
All database access from agents should go through this service.
"""
from typing import List, Dict, Any, Optional
import logging
from decimal import Decimal
from django.db.models import QuerySet

from supply_chain.models import RawMaterialInventory, Vendor, ProcurementDecision
from .cache_utils import (
    CacheKeys, CacheTimeout, cache_result,
    get_cached_data, set_cached_data
)

logger = logging.getLogger(__name__)


class DataFetcher:
    """Service for fetching data from database with caching."""

    @staticmethod
    @cache_result(
        key_func=lambda: CacheKeys.RAW_MATERIALS_ALL,
        timeout=CacheTimeout.LONG
    )
    def get_all_raw_materials() -> List[Dict[str, Any]]:
        """
        Fetch all raw materials with inventory data.
        
        Returns:
            List of raw material dictionaries
        """
        materials = RawMaterialInventory.objects.all().values(
            'id', 'name', 'current_stock', 'max_capacity', 'reorder_threshold_percentage'
        )
        return list(materials)

    @staticmethod
    def get_raw_material_by_id(material_id: int) -> Optional[Dict[str, Any]]:
        """
        Fetch a specific raw material by ID.
        
        Args:
            material_id: The raw material ID
            
        Returns:
            Raw material dictionary or None
        """
        try:
            material = RawMaterialInventory.objects.filter(id=material_id).values(
                'id', 'name', 'current_stock', 'max_capacity', 'reorder_threshold_percentage'
            ).first()
            return material
        except RawMaterialInventory.DoesNotExist:
            logger.warning(f"Raw material with ID {material_id} not found")
            return None

    @staticmethod
    @cache_result(
        key_func=lambda: CacheKeys.INVENTORY_ALL,
        timeout=CacheTimeout.SHORT
    )
    def get_all_inventory() -> List[Dict[str, Any]]:
        """
        Fetch all inventory records with calculated fields.
        
        Returns:
            List of inventory dictionaries
        """
        materials = RawMaterialInventory.objects.all()
        
        result = []
        for mat in materials:
            result.append({
                'id': mat.id,
                'raw_material_id': mat.id,
                'raw_material_name': mat.name,
                'current_stock': float(mat.current_stock),
                'max_capacity': float(mat.max_capacity),
                'stock_percentage': mat.stock_percentage,
                'needs_reorder': mat.needs_reorder,
                'reorder_threshold': float(mat.reorder_threshold_percentage),
                'last_updated': mat.updated_at.isoformat(),
            })
        
        return result

    @staticmethod
    @cache_result(
        key_func=lambda: CacheKeys.INVENTORY_LOW_STOCK,
        timeout=CacheTimeout.SHORT
    )
    def get_low_stock_inventory() -> List[Dict[str, Any]]:
        """
        Fetch inventory items that need reordering.
        
        Returns:
            List of low stock inventory dictionaries
        """
        all_inventory = DataFetcher.get_all_inventory()
        return [inv for inv in all_inventory if inv['needs_reorder']]

    @staticmethod
    def get_inventory_by_material(material_id: int) -> Optional[Dict[str, Any]]:
        """
        Fetch inventory for a specific material.
        
        Args:
            material_id: The raw material ID
            
        Returns:
            Inventory dictionary or None
        """
        cache_key = CacheKeys.INVENTORY_SINGLE.format(material_id=material_id)
        cached = get_cached_data(cache_key)
        if cached:
            return cached
        
        try:
            mat = RawMaterialInventory.objects.get(id=material_id)
            
            result = {
                'id': mat.id,
                'raw_material_id': mat.id,
                'raw_material_name': mat.name,
                'current_stock': float(mat.current_stock),
                'max_capacity': float(mat.max_capacity),
                'stock_percentage': mat.stock_percentage,
                'needs_reorder': mat.needs_reorder,
                'reorder_threshold': float(mat.reorder_threshold_percentage),
                'last_updated': mat.updated_at.isoformat(),
            }
            
            set_cached_data(cache_key, result, CacheTimeout.SHORT)
            return result
            
        except RawMaterialInventory.DoesNotExist:
            logger.warning(f"Inventory for material ID {material_id} not found")
            return None

    @staticmethod
    def get_vendors_by_material(material_id: int) -> List[Dict[str, Any]]:
        """
        Fetch all active vendors for a specific material.
        
        Args:
            material_id: The raw material ID
            
        Returns:
            List of vendor dictionaries
        """
        cache_key = CacheKeys.VENDORS_BY_MATERIAL.format(material_id=material_id)
        cached = get_cached_data(cache_key)
        if cached:
            return cached
        
        vendors = Vendor.objects.filter(
            material_supply_id=material_id,
            is_active=True
        ).select_related('material_supply').values(
            'id', 'name', 'material_supply__name', 'price_per_unit',
            'lead_time_days', 'reliability_score'
        )
        
        result = [
            {
                'id': v['id'],
                'name': v['name'],
                'material_name': v['material_supply__name'],
                'price_per_unit': float(v['price_per_unit']),
                'lead_time_days': v['lead_time_days'],
                'reliability_score': float(v['reliability_score']),
            }
            for v in vendors
        ]
        
        set_cached_data(cache_key, result, CacheTimeout.MEDIUM)
        return result

    @staticmethod
    @cache_result(
        key_func=lambda: CacheKeys.VENDORS_ALL,
        timeout=CacheTimeout.MEDIUM
    )
    def get_all_vendors() -> List[Dict[str, Any]]:
        """
        Fetch all active vendors.
        
        Returns:
            List of vendor dictionaries
        """
        vendors = Vendor.objects.filter(is_active=True).select_related('material_supply').values(
            'id', 'name', 'material_supply__name', 'material_supply__id',
            'price_per_unit', 'lead_time_days', 'reliability_score'
        )
        
        return [
            {
                'id': v['id'],
                'name': v['name'],
                'material_id': v['material_supply__id'],
                'material_name': v['material_supply__name'],
                'price_per_unit': float(v['price_per_unit']),
                'lead_time_days': v['lead_time_days'],
                'reliability_score': float(v['reliability_score']),
            }
            for v in vendors
        ]

    @staticmethod
    def get_recent_procurement_decisions(limit: int = 5) -> List[Dict[str, Any]]:
        """
        Fetch recent procurement decisions for agent memory.
        
        Args:
            limit: Number of recent decisions to fetch
            
        Returns:
            List of procurement decision dictionaries
        """
        decisions = ProcurementDecision.objects.select_related(
            'raw_material', 'selected_vendor'
        ).order_by('-created_at')[:limit]
        
        result = []
        for decision in decisions:
            result.append({
                'id': decision.id,
                'raw_material_name': decision.raw_material.name,
                'goal': decision.goal,
                'selected_vendor_name': decision.selected_vendor.name if decision.selected_vendor else None,
                'order_quantity': float(decision.order_quantity),
                'expected_cost': float(decision.expected_cost),
                'confidence_score': float(decision.confidence_score),
                'explanation': decision.explanation,
                'procurement_required': decision.procurement_required,
                'created_at': decision.created_at.isoformat(),
            })
        
        return result

    @staticmethod
    def save_procurement_decision(decision_data: Dict[str, Any]) -> int:
        """
        Save a procurement decision to the database.
        
        Args:
            decision_data: Dictionary containing decision data
            
        Returns:
            ID of the created decision
        """
        decision = ProcurementDecision.objects.create(
            raw_material_id=decision_data['raw_material_id'],
            goal=decision_data['goal'],
            selected_vendor_id=decision_data.get('selected_vendor_id'),
            order_quantity=Decimal(str(decision_data['order_quantity'])),
            expected_cost=Decimal(str(decision_data['expected_cost'])),
            confidence_score=Decimal(str(decision_data['confidence_score'])),
            explanation=decision_data['explanation'],
            procurement_required=decision_data['procurement_required'],
            inventory_status=decision_data['inventory_status'],
        )
        
        logger.info(f"Saved procurement decision with ID {decision.id}")
        return decision.id
