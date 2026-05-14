"""
Tests for supply chain services.
"""
from django.test import TestCase
from supply_chain.models import RawMaterial, Inventory, Vendor
from supply_chain.services.data_fetcher import DataFetcher
from decimal import Decimal


class DataFetcherTestCase(TestCase):
    """Test cases for DataFetcher service."""
    
    def setUp(self):
        """Set up test data."""
        self.material = RawMaterial.objects.create(
            name="Test Material",
            sku="TEST-001",
            unit="kg",
            reorder_threshold_percentage=25
        )
        
        self.inventory = Inventory.objects.create(
            raw_material=self.material,
            current_stock=Decimal('200.00'),
            max_capacity=Decimal('1000.00')
        )
        
        self.vendor = Vendor.objects.create(
            name="Test Vendor",
            material=self.material,
            price_per_unit=Decimal('10.00'),
            lead_time_days=5,
            reliability_score=Decimal('90.00')
        )
    
    def test_get_all_inventory(self):
        """Test fetching all inventory."""
        inventory = DataFetcher.get_all_inventory()
        self.assertEqual(len(inventory), 1)
        self.assertEqual(inventory[0]['raw_material_name'], "Test Material")
    
    def test_get_low_stock_inventory(self):
        """Test fetching low stock inventory."""
        low_stock = DataFetcher.get_low_stock_inventory()
        self.assertEqual(len(low_stock), 1)  # 20% is below 25% threshold
    
    def test_get_vendors_by_material(self):
        """Test fetching vendors for a material."""
        vendors = DataFetcher.get_vendors_by_material(self.material.id)
        self.assertEqual(len(vendors), 1)
        self.assertEqual(vendors[0]['name'], "Test Vendor")
