# 🚀 Quick Start Guide

Get the Supply Chain Management System running in 5 minutes!

## Prerequisites

- Python 3.10+
- PostgreSQL 12+
- Redis 6+
- OpenAI API key (or compatible)

## Step 1: Install Dependencies

```bash
cd /home/ah0061/hackathon-codeN

# Run automated setup
./setup.sh

# Or manual setup:
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

## Step 2: Configure Environment

```bash
# Copy environment template
cp .env.example .env

# Edit with your settings
nano .env
```

**Required settings:**
```env
SECRET_KEY=your-django-secret-key
DEBUG=True
OPENAI_API_KEY=your-openai-api-key
DB_PASSWORD=your-postgres-password
```

## Step 3: Setup Database

```bash
# Create PostgreSQL database
sudo -u postgres psql -c "CREATE DATABASE supply_chain_db;"

# Run migrations
python manage.py makemigrations
python manage.py migrate

# Create admin user
python manage.py createsuperuser
```

## Step 4: Load Sample Data

```bash
# Seed database with sample materials, inventory, and vendors
python manage.py seed_data
```

This creates:
- 5 raw materials (Steel, Aluminum, Copper, Plastic, Rubber)
- 5 inventory records (3 below threshold, 2 above)
- 13 vendors with varying prices, lead times, and reliability

## Step 5: Start Services

```bash
# Terminal 1: Start Redis
redis-server

# Terminal 2: Start Django
python manage.py runserver
```

Server runs at: **http://localhost:8000**

## Step 6: Test the API

```bash
# Test health check
curl http://localhost:8000/api/supply-chain/health/

# Check system status
curl http://localhost:8000/api/supply-chain/status/

# Execute a goal (this triggers the multi-agent workflow)
curl -X POST http://localhost:8000/api/supply-chain/execute-goal/ \
  -H "Content-Type: application/json" \
  -d '{"goal": "Ensure uninterrupted production by restocking raw materials efficiently"}'
```

## What Happens When You Execute a Goal?

1. **Planner Agent** analyzes your goal
2. **Inventory Agent** checks all materials and finds 3 below 25% threshold:
   - Steel Sheets: 15% (needs 850kg)
   - Copper Wire: 9% (needs 1,820m)
   - Rubber Sheets: 15% (needs 680kg)
3. **Procurement Agent** calculates optimal order quantities
4. **Vendor Analysis Agent** evaluates all available vendors
5. **Cost Optimization Agent** selects best vendor using weighted scoring:
   - 40% price
   - 30% lead time
   - 30% reliability
6. **Coordinator Agent** validates and produces final decision

## Sample Response

```json
{
  "goal": "Ensure uninterrupted production by restocking raw materials efficiently",
  "inventory_status": {
    "total_items": 5,
    "items_below_threshold": 3,
    "materials_needing_reorder": [
      {
        "material_name": "Steel Sheets",
        "sku": "STEEL-001",
        "current_stock": 150.0,
        "max_capacity": 1000.0,
        "stock_percentage": 15.0
      }
    ]
  },
  "procurement_required": true,
  "selected_vendor": {
    "vendor_id": 2,
    "vendor_name": "MetalWorks LLC",
    "price_per_unit": 23.00,
    "lead_time_days": 10,
    "reliability_score": 85.0
  },
  "order_quantity": 850.0,
  "expected_cost": 19550.0,
  "confidence_score": 82.5,
  "explanation": "Analysis identified Steel Sheets at critical 15% capacity. Evaluated 3 vendors using weighted scoring. MetalWorks LLC selected with best overall value: lowest price ($23/unit) balances 10-day lead time and 85% reliability score. Order of 850kg restores inventory to 100% at total cost of $19,550."
}
```

## Access Django Admin

1. Go to: **http://localhost:8000/admin/**
2. Login with superuser credentials
3. View and manage:
   - Raw Materials
   - Inventory Levels
   - Vendors
   - Procurement Decisions

## Useful Commands

```bash
# View logs in real-time
python manage.py runserver  # Watch console output

# Clear cache
python manage.py shell
>>> from django.core.cache import cache
>>> cache.clear()

# Check database status
python manage.py dbshell
>>> SELECT COUNT(*) FROM inventory;

# Run tests
python manage.py test

# Create new superuser
python manage.py createsuperuser
```

## Troubleshooting

### "Connection refused" to PostgreSQL
```bash
# Check PostgreSQL is running
sudo systemctl status postgresql
sudo systemctl start postgresql
```

### "Connection refused" to Redis
```bash
# Check Redis is running
redis-cli ping  # Should return "PONG"
sudo systemctl start redis-server
```

### "Invalid API key" error
```bash
# Verify your OpenAI API key in .env
cat .env | grep OPENAI_API_KEY

# Test API key
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer YOUR_API_KEY"
```

### Import errors
```bash
# Reinstall dependencies
pip install -r requirements.txt

# Check Python version
python --version  # Must be 3.10+
```

## Next Steps

### Learn More
- Read [README.md](README.md) for full documentation
- Review [ARCHITECTURE.md](ARCHITECTURE.md) for system design
- Check [DEPLOYMENT.md](DEPLOYMENT.md) for production setup

### Customize the System
1. **Adjust threshold**: Change reorder percentage (default: 25%)
2. **Modify scoring weights**: Edit Cost Optimization Agent
3. **Add more materials**: Use Django admin or shell
4. **Create custom goals**: Try different goal statements

### Example Goals to Try

```bash
# Cost-focused
curl -X POST http://localhost:8000/api/supply-chain/execute-goal/ \
  -H "Content-Type: application/json" \
  -d '{"goal": "Minimize procurement costs while maintaining adequate stock"}'

# Speed-focused
curl -X POST http://localhost:8000/api/supply-chain/execute-goal/ \
  -H "Content-Type: application/json" \
  -d '{"goal": "Restock materials with fastest possible delivery"}'

# Reliability-focused
curl -X POST http://localhost:8000/api/supply-chain/execute-goal/ \
  -H "Content-Type: application/json" \
  -d '{"goal": "Source from the most reliable vendors to prevent disruptions"}'
```

## Development Tips

### Add New Material and Vendors

```python
python manage.py shell

from supply_chain.models import RawMaterial, Inventory, Vendor
from decimal import Decimal

# Create material
titanium = RawMaterial.objects.create(
    name="Titanium Sheets",
    sku="TITAN-001",
    unit="kg",
    reorder_threshold_percentage=25
)

# Create inventory (below threshold to trigger procurement)
Inventory.objects.create(
    raw_material=titanium,
    current_stock=Decimal('100.00'),  # 10% of capacity
    max_capacity=Decimal('1000.00')
)

# Add vendors
Vendor.objects.create(
    name="TitaniumPro Inc",
    material=titanium,
    price_per_unit=Decimal('150.00'),
    lead_time_days=7,
    reliability_score=Decimal('95.00')
)

Vendor.objects.create(
    name="Budget Titanium",
    material=titanium,
    price_per_unit=Decimal('120.00'),
    lead_time_days=15,
    reliability_score=Decimal('80.00')
)

print("✓ Titanium material added!")
```

### Monitor Cache Performance

```python
python manage.py shell

from django.core.cache import cache
from supply_chain.services.cache_utils import CacheKeys

# Check cache keys
print(cache.get(CacheKeys.INVENTORY_ALL))

# Clear specific cache
cache.delete(CacheKeys.INVENTORY_ALL)

# Get cache stats (Redis)
import redis
r = redis.Redis(host='localhost', port=6379, db=0)
print(r.info('stats'))
```

## Success! 🎉

You now have a fully functional AI-powered supply chain management system!

The system will:
- ✅ Monitor inventory automatically
- ✅ Detect when stock falls below 25%
- ✅ Evaluate multiple vendors
- ✅ Select optimal vendors using AI
- ✅ Provide explainable decisions
- ✅ Learn from historical decisions

---

**Ready for production?** See [DEPLOYMENT.md](DEPLOYMENT.md) for production deployment guide.

**Need help?** Check the troubleshooting section or review the full documentation in [README.md](README.md).
