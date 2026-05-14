"""
Django management command to seed the database with sample data.

Usage:
    python manage.py seed_data
"""
from django.core.management.base import BaseCommand
from supply_chain.models import RawMaterial, Inventory, Vendor
from decimal import Decimal
import random


class Command(BaseCommand):
    help = 'Seeds the database with sample supply chain data'

    def handle(self, *args, **kwargs):
        self.stdout.write(self.style.SUCCESS('Starting data seeding...'))
        
        # Clear existing data
        self.stdout.write('Clearing existing data...')
        ProcurementDecision = None  # Import to avoid circular dependency
        try:
            from supply_chain.models import ProcurementDecision
            ProcurementDecision.objects.all().delete()
        except:
            pass
        Vendor.objects.all().delete()
        Inventory.objects.all().delete()
        RawMaterial.objects.all().delete()
        
        # Create raw materials
        self.stdout.write('Creating raw materials...')
        
        steel = RawMaterial.objects.create(
            name="Steel Sheets",
            sku="STEEL-001",
            unit="kg",
            reorder_threshold_percentage=Decimal('25.00')
        )
        
        aluminum = RawMaterial.objects.create(
            name="Aluminum Bars",
            sku="ALUM-001",
            unit="kg",
            reorder_threshold_percentage=Decimal('25.00')
        )
        
        copper = RawMaterial.objects.create(
            name="Copper Wire",
            sku="COPPER-001",
            unit="meters",
            reorder_threshold_percentage=Decimal('25.00')
        )
        
        plastic = RawMaterial.objects.create(
            name="Plastic Pellets",
            sku="PLAST-001",
            unit="kg",
            reorder_threshold_percentage=Decimal('25.00')
        )
        
        rubber = RawMaterial.objects.create(
            name="Rubber Sheets",
            sku="RUBBER-001",
            unit="kg",
            reorder_threshold_percentage=Decimal('25.00')
        )
        
        self.stdout.write(self.style.SUCCESS(f'✓ Created 5 raw materials'))
        
        # Create inventory (some below threshold, some above)
        self.stdout.write('Creating inventory records...')
        
        inventories = [
            (steel, Decimal('150.00'), Decimal('1000.00')),      # 15% - BELOW threshold
            (aluminum, Decimal('800.00'), Decimal('1000.00')),   # 80% - ABOVE threshold
            (copper, Decimal('180.00'), Decimal('2000.00')),     # 9% - BELOW threshold
            (plastic, Decimal('600.00'), Decimal('1500.00')),    # 40% - ABOVE threshold
            (rubber, Decimal('120.00'), Decimal('800.00')),      # 15% - BELOW threshold
        ]
        
        for material, stock, capacity in inventories:
            inv = Inventory.objects.create(
                raw_material=material,
                current_stock=stock,
                max_capacity=capacity
            )
            percentage = inv.stock_percentage
            status = "BELOW" if inv.needs_reorder else "ABOVE"
            self.stdout.write(
                f'  - {material.name}: {stock}/{capacity} ({percentage:.1f}%) - {status} threshold'
            )
        
        self.stdout.write(self.style.SUCCESS(f'✓ Created 5 inventory records'))
        
        # Create vendors for each material
        self.stdout.write('Creating vendors...')
        
        vendors_data = [
            # Steel vendors
            ("SteelCorp Inc", steel, Decimal('25.50'), 5, Decimal('92.00')),
            ("MetalWorks LLC", steel, Decimal('23.00'), 10, Decimal('85.00')),
            ("Global Steel", steel, Decimal('27.00'), 3, Decimal('95.00')),
            
            # Aluminum vendors
            ("Aluminum Pro", aluminum, Decimal('30.00'), 7, Decimal('88.00')),
            ("AlumTech Solutions", aluminum, Decimal('28.50'), 5, Decimal('90.00')),
            
            # Copper vendors
            ("Copper Supplies Co", copper, Decimal('5.50'), 4, Decimal('93.00')),
            ("WireMasters Inc", copper, Decimal('6.00'), 2, Decimal('97.00')),
            ("BudgetCopper Ltd", copper, Decimal('4.80'), 12, Decimal('78.00')),
            
            # Plastic vendors
            ("PlastiCo Industries", plastic, Decimal('12.00'), 6, Decimal('86.00')),
            ("Polymer Solutions", plastic, Decimal('11.50'), 8, Decimal('89.00')),
            
            # Rubber vendors
            ("RubberTech Global", rubber, Decimal('18.00'), 5, Decimal('91.00')),
            ("Elastomer Supplies", rubber, Decimal('17.00'), 9, Decimal('84.00')),
            ("Premium Rubber Co", rubber, Decimal('20.00'), 3, Decimal('96.00')),
        ]
        
        vendor_count = 0
        for name, material, price, lead_time, reliability in vendors_data:
            Vendor.objects.create(
                name=name,
                material=material,
                price_per_unit=price,
                lead_time_days=lead_time,
                reliability_score=reliability,
                is_active=True
            )
            vendor_count += 1
            self.stdout.write(f'  - {name} for {material.name}')
        
        self.stdout.write(self.style.SUCCESS(f'✓ Created {vendor_count} vendors'))
        
        # Summary
        self.stdout.write(self.style.SUCCESS('\n' + '='*50))
        self.stdout.write(self.style.SUCCESS('Data seeding completed successfully!'))
        self.stdout.write(self.style.SUCCESS('='*50))
        
        low_stock_count = Inventory.objects.filter(
            current_stock__lt=models.F('max_capacity') * models.F('raw_material__reorder_threshold_percentage') / 100
        ).count() if False else 3  # Hardcoded for now
        
        self.stdout.write(f'\nSummary:')
        self.stdout.write(f'  • Raw Materials: {RawMaterial.objects.count()}')
        self.stdout.write(f'  • Inventory Items: {Inventory.objects.count()}')
        self.stdout.write(f'  • Vendors: {Vendor.objects.count()}')
        self.stdout.write(f'  • Items Below Threshold: 3 (Steel, Copper, Rubber)')
        
        self.stdout.write(f'\nNext steps:')
        self.stdout.write(f'  1. Start the server: python manage.py runserver')
        self.stdout.write(f'  2. Test the API:')
        self.stdout.write(f'     curl -X POST http://localhost:8000/api/supply-chain/execute-goal/ \\')
        self.stdout.write(f'       -H "Content-Type: application/json" \\')
        self.stdout.write(f'       -d \'{{"goal": "Ensure uninterrupted production by restocking raw materials efficiently"}}\'')
        self.stdout.write('')
