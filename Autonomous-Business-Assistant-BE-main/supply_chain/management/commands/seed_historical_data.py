"""
Seed historical data for chocolate company including:
- Consumption history (90 days)
- Vendor performance history
- Seasonal patterns
- Price history
"""
from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import date, timedelta
from decimal import Decimal
import random

from supply_chain.models import (
    RawMaterialInventory,
    Vendor,
    MaterialConsumptionHistory,
    VendorPerformanceHistory,
    SeasonalPattern,
    PriceHistory
)


class Command(BaseCommand):
    help = 'Seed historical data for chocolate company'

    def handle(self, *args, **kwargs):
        self.stdout.write('Seeding historical data for chocolate company...\n')
        
        # Get or create materials first
        self._ensure_materials_exist()
        
        # Seed consumption history
        self._seed_consumption_history()
        
        # Seed vendor performance history
        self._seed_vendor_performance()
        
        # Seed seasonal patterns
        self._seed_seasonal_patterns()
        
        # Seed price history
        self._seed_price_history()
        
        self.stdout.write(self.style.SUCCESS('\n✅ Successfully seeded historical data!'))
    
    def _ensure_materials_exist(self):
        """Ensure base materials exist"""
        materials_data = [
            ('Cocoa Beans', Decimal('3000'), Decimal('25000')),
            ('Cocoa Butter', Decimal('1800'), Decimal('10000')),
            ('Refined Sugar', Decimal('8500'), Decimal('30000')),
            ('Milk Powder', Decimal('2200'), Decimal('15000')),
            ('Vanilla Extract', Decimal('85'), Decimal('500')),
        ]
        
        for name, current_stock, max_capacity in materials_data:
            RawMaterialInventory.objects.get_or_create(
                name=name,
                defaults={
                    'current_stock': current_stock,
                    'max_capacity': max_capacity,
                    'reorder_threshold_percentage': 25
                }
            )
    
    def _seed_consumption_history(self):
        """Seed 90 days of consumption history with realistic patterns"""
        self.stdout.write('📊 Seeding consumption history...')
        
        materials = RawMaterialInventory.objects.all()
        today = timezone.now().date()
        
        # Base daily consumption rates (kg/day or liters/day)
        base_consumption = {
            'Cocoa Beans': 500,
            'Cocoa Butter': 200,
            'Refined Sugar': 600,
            'Milk Powder': 300,
            'Vanilla Extract': 10,
        }
        
        count = 0
        for material in materials:
            base_rate = base_consumption.get(material.name, 100)
            
            for days_ago in range(90, 0, -1):
                consumption_date = today - timedelta(days=days_ago)
                
                # Add seasonal variations
                month = consumption_date.month
                seasonal_multiplier = 1.0
                
                # Valentine's (Feb) and Christmas (Dec) spikes
                if month == 2:  # Valentine's
                    seasonal_multiplier = 1.8 if consumption_date.day < 15 else 1.3
                elif month == 12:  # Christmas
                    seasonal_multiplier = 2.0
                elif month in [10, 11]:  # Halloween, Thanksgiving
                    seasonal_multiplier = 1.4
                
                # Weekend reduction (less production)
                if consumption_date.weekday() >= 5:  # Saturday or Sunday
                    seasonal_multiplier *= 0.3
                
                # Add random variance ±15%
                variance = random.uniform(0.85, 1.15)
                daily_consumption = base_rate * seasonal_multiplier * variance
                
                # Production volume correlates with consumption
                production = daily_consumption * random.uniform(2.5, 3.5)
                
                MaterialConsumptionHistory.objects.get_or_create(
                    raw_material=material,
                    date=consumption_date,
                    defaults={
                        'quantity_consumed': Decimal(str(round(daily_consumption, 2))),
                        'production_volume': Decimal(str(round(production, 2))),
                        'notes': self._get_special_notes(consumption_date)
                    }
                )
                count += 1
        
        self.stdout.write(f'   Created {count} consumption records')
    
    def _get_special_notes(self, date_obj):
        """Get special notes for certain dates"""
        if date_obj.month == 2 and date_obj.day == 14:
            return "Valentine's Day - Peak chocolate demand"
        elif date_obj.month == 12 and 20 <= date_obj.day <= 25:
            return "Christmas season - High production"
        elif date_obj.month == 10 and date_obj.day == 31:
            return "Halloween - Increased candy production"
        return ""
    
    def _seed_vendor_performance(self):
        """Seed vendor performance history"""
        self.stdout.write('📊 Seeding vendor performance history...')
        
        vendors = Vendor.objects.all()
        today = timezone.now().date()
        
        count = 0
        for vendor in vendors:
            # Create 5-15 historical orders per vendor
            num_orders = random.randint(5, 15)
            
            for i in range(num_orders):
                # Orders spread over last 180 days
                days_ago = random.randint(30, 180)
                order_date = today - timedelta(days=days_ago)
                expected_delivery = order_date + timedelta(days=vendor.lead_time_days)
                
                # Simulate delivery variance
                base_reliability = float(vendor.reliability_score)
                if random.random() * 100 < base_reliability:
                    # On-time or early
                    actual_delivery = expected_delivery - timedelta(days=random.randint(0, 2))
                else:
                    # Delayed
                    actual_delivery = expected_delivery + timedelta(days=random.randint(1, 7))
                
                # Order quantities
                ordered = Decimal(str(random.randint(1000, 5000)))
                delivered = ordered * Decimal(str(random.uniform(0.98, 1.0)))  # Slight variance
                
                # Quality scores correlate with reliability
                quality = base_reliability + random.uniform(-10, 5)
                quality = max(60, min(100, quality))
                
                # Satisfaction correlates with on-time delivery and quality
                satisfaction = (quality + base_reliability) / 2 + random.uniform(-5, 5)
                satisfaction = max(60, min(100, satisfaction))
                
                VendorPerformanceHistory.objects.get_or_create(
                    vendor=vendor,
                    order_date=order_date,
                    defaults={
                        'expected_delivery_date': expected_delivery,
                        'actual_delivery_date': actual_delivery,
                        'ordered_quantity': ordered,
                        'delivered_quantity': delivered,
                        'quality_score': Decimal(str(round(quality, 2))),
                        'cost_accuracy': Decimal(str(random.uniform(98, 102))),
                        'overall_satisfaction': Decimal(str(round(satisfaction, 2))),
                        'issues_reported': '' if random.random() > 0.2 else self._get_random_issue()
                    }
                )
                count += 1
        
        self.stdout.write(f'   Created {count} vendor performance records')
    
    def _get_random_issue(self):
        """Get random vendor issue"""
        issues = [
            "Minor packaging damage",
            "Delayed by 1 day due to weather",
            "Quality inspection passed with minor notes",
            "Delivery truck breakdown - reshipped",
            ""
        ]
        return random.choice(issues)
    
    def _seed_seasonal_patterns(self):
        """Seed seasonal patterns for key materials"""
        self.stdout.write('📊 Seeding seasonal patterns...')
        
        materials = RawMaterialInventory.objects.filter(
            name__in=['Cocoa Beans', 'Cocoa Butter', 'Milk Powder', 'Vanilla Extract']
        )
        
        # Seasonal patterns for chocolate industry
        patterns = {
            2: (1.8, 15000, "Valentine's Day demand spike"),  # February
            10: (1.4, 12000, "Halloween season increase"),    # October
            11: (1.5, 13000, "Thanksgiving preparation"),     # November
            12: (2.0, 18000, "Christmas peak demand"),        # December
            1: (1.2, 10000, "Post-holiday recovery"),         # January
        }
        
        count = 0
        for material in materials:
            for month, (multiplier, avg_consumption, notes) in patterns.items():
                # Adjust consumption based on material type
                if 'Vanilla' in material.name:
                    avg_consumption = avg_consumption / 500  # Vanilla is in liters
                elif 'Butter' in material.name:
                    avg_consumption = avg_consumption * 0.4
                elif 'Milk' in material.name:
                    avg_consumption = avg_consumption * 0.6
                
                SeasonalPattern.objects.get_or_create(
                    raw_material=material,
                    month=month,
                    defaults={
                        'demand_multiplier': Decimal(str(multiplier)),
                        'average_consumption': Decimal(str(round(avg_consumption, 2))),
                        'notes': notes,
                        'confidence_level': Decimal(str(random.uniform(75, 95)))
                    }
                )
                count += 1
        
        self.stdout.write(f'   Created {count} seasonal patterns')
    
    def _seed_price_history(self):
        """Seed price history showing trends"""
        self.stdout.write('📊 Seeding price history...')
        
        vendors = Vendor.objects.all()
        today = timezone.now().date()
        
        count = 0
        for vendor in vendors:
            current_price = float(vendor.price_per_unit)
            
            # Create 6-12 price points over last year
            num_changes = random.randint(6, 12)
            
            previous_price = None
            for i in range(num_changes, 0, -1):
                # Price changes every 1-2 months
                days_ago = i * random.randint(30, 60)
                effective_date = today - timedelta(days=days_ago)
                
                # Calculate historical price with realistic trend
                # Prices generally trend upward (inflation) with some volatility
                if previous_price is None:
                    # Oldest price - start lower
                    historical_price = current_price * random.uniform(0.85, 0.95)
                    price_change = 0
                else:
                    # Gradual increase with volatility
                    trend = random.uniform(1.02, 1.08)  # 2-8% increase
                    volatility = random.uniform(0.95, 1.05)  # ±5% random
                    historical_price = previous_price * trend * volatility
                    price_change = ((historical_price - previous_price) / previous_price) * 100 if previous_price > 0 else 0
                
                # Get reason for price change
                reason = self._get_price_change_reason(price_change)
                
                PriceHistory.objects.get_or_create(
                    vendor=vendor,
                    effective_date=effective_date,
                    defaults={
                        'price_per_unit': Decimal(str(round(historical_price, 2))),
                        'price_change_percentage': Decimal(str(round(price_change, 2))),
                        'reason': reason
                    }
                )
                
                previous_price = historical_price
                count += 1
        
        self.stdout.write(f'   Created {count} price history records')
    
    def _get_price_change_reason(self, change_percentage):
        """Get reason for price change"""
        if abs(change_percentage) < 2:
            return "Minor market adjustment"
        elif change_percentage > 5:
            reasons = [
                "Raw material shortage",
                "Increased transportation costs",
                "Currency exchange rate impact",
                "Supply chain disruption"
            ]
            return random.choice(reasons)
        elif change_percentage < -2:
            reasons = [
                "Competitive pricing adjustment",
                "Bulk purchase agreement",
                "Market oversupply",
                "Promotional pricing"
            ]
            return random.choice(reasons)
        else:
            return "Standard market adjustment"
