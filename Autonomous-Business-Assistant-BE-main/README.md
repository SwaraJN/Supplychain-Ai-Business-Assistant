# Supply Chain Management - Multi-Agent AI System

A production-ready Django application implementing a **goal-driven multi-agent Supply Chain Management system** using CrewAI. The system automatically monitors inventory levels, triggers procurement operations when stock falls below 25%, evaluates vendors, and makes explainable procurement decisions.

## 🎯 Key Features

- **Goal-Driven Execution**: Supply AI goals and let the multi-agent system determine the optimal action
- **Automatic Inventory Monitoring**: Tracks stock levels and triggers procurement at 25% threshold
- **Multi-Agent Orchestration**: 6 specialized AI agents working together:
  - **Planner Agent**: Analyzes goals and creates execution plans
  - **Inventory Monitor Agent**: Checks stock levels and identifies reorder needs
  - **Procurement Agent**: Calculates optimal order quantities
  - **Vendor Analysis Agent**: Evaluates vendors on price, lead time, and reliability
  - **Cost Optimization Agent**: Selects best vendor using weighted scoring (40% price, 30% lead time, 30% reliability)
  - **Coordinator Agent**: Validates and synthesizes final decisions
- **Explainable AI**: Every decision includes detailed reasoning and confidence scores
- **Production-Ready**: PostgreSQL, Redis caching, proper error handling, logging

## 🏗️ Tech Stack

- **Backend**: Django 4.2 + Django REST Framework
- **Database**: PostgreSQL (Django ORM)
- **Cache**: Redis (django-redis)
- **AI Orchestration**: CrewAI
- **LLM**: OpenAI-compatible API (configurable)
- **Python**: 3.10+

## 📋 Requirements

- Python 3.10 or higher
- PostgreSQL 12+
- Redis 6+
- OpenAI API key (or compatible API)

## 🚀 Installation

### 1. Clone and Setup Environment

```bash
# Navigate to project directory
cd /home/ah0061/hackathon-codeN

# Create virtual environment
python3.10 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Configure Environment Variables

```bash
# Copy example env file
cp .env.example .env

# Edit .env with your settings
nano .env
```

Required environment variables:
```env
SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Database
DB_NAME=supply_chain_db
DB_USER=postgres
DB_PASSWORD=your-postgres-password
DB_HOST=localhost
DB_PORT=5432

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_DB=0

# OpenAI (or compatible API)
OPENAI_API_KEY=your-api-key-here
OPENAI_API_BASE=https://api.openai.com/v1
OPENAI_MODEL=gpt-4

# CrewAI
CREWAI_MEMORY_ENABLED=True
```

### 3. Setup Database

```bash
# Create PostgreSQL database
sudo -u postgres psql
CREATE DATABASE supply_chain_db;
CREATE USER postgres WITH PASSWORD 'your-password';
GRANT ALL PRIVILEGES ON DATABASE supply_chain_db TO postgres;
\q

# Run migrations
python manage.py makemigrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser
```

### 4. Start Redis

```bash
# Ubuntu/Debian
sudo systemctl start redis-server
sudo systemctl enable redis-server

# macOS
brew services start redis

# Verify Redis is running
redis-cli ping  # Should return "PONG"
```

### 5. Load Sample Data (Optional)

```bash
# Create sample data via Django shell
python manage.py shell
```

```python
from supply_chain.models import RawMaterial, Inventory, Vendor
from decimal import Decimal

# Create raw materials
steel = RawMaterial.objects.create(
    name="Steel Sheets",
    sku="STEEL-001",
    unit="kg",
    reorder_threshold_percentage=25
)

aluminum = RawMaterial.objects.create(
    name="Aluminum Bars",
    sku="ALUM-001",
    unit="kg",
    reorder_threshold_percentage=25
)

# Create inventory (some below threshold)
Inventory.objects.create(
    raw_material=steel,
    current_stock=Decimal('150.00'),  # 15% of capacity
    max_capacity=Decimal('1000.00')
)

Inventory.objects.create(
    raw_material=aluminum,
    current_stock=Decimal('800.00'),  # 80% of capacity
    max_capacity=Decimal('1000.00')
)

# Create vendors for steel
Vendor.objects.create(
    name="SteelCorp Inc",
    material=steel,
    price_per_unit=Decimal('25.50'),
    lead_time_days=5,
    reliability_score=Decimal('92.00')
)

Vendor.objects.create(
    name="MetalWorks LLC",
    material=steel,
    price_per_unit=Decimal('23.00'),
    lead_time_days=10,
    reliability_score=Decimal('85.00')
)

Vendor.objects.create(
    name="Global Steel",
    material=steel,
    price_per_unit=Decimal('27.00'),
    lead_time_days=3,
    reliability_score=Decimal('95.00')
)

print("Sample data created successfully!")
```

### 6. Run the Server

```bash
# Development server
python manage.py runserver

# Production server (with Gunicorn)
gunicorn config.wsgi:application --bind 0.0.0.0:8000 --workers 4
```

The API will be available at: `http://localhost:8000`

## 📡 API Usage

### Execute Goal Endpoint

**POST** `/api/supply-chain/execute-goal/`

Execute a goal-driven supply chain workflow.

**Request:**
```json
{
  "goal": "Ensure uninterrupted production by restocking raw materials efficiently"
}
```

**Response:**
```json
{
  "goal": "Ensure uninterrupted production by restocking raw materials efficiently",
  "inventory_status": {
    "total_items": 2,
    "items_below_threshold": 1,
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
    "vendor_id": 1,
    "vendor_name": "SteelCorp Inc",
    "material_name": "Steel Sheets",
    "price_per_unit": 25.50,
    "lead_time_days": 5,
    "reliability_score": 92.0
  },
  "order_quantity": 850.0,
  "expected_cost": 21675.0,
  "confidence_score": 87.5,
  "explanation": "Analysis identified Steel Sheets at 15% capacity, triggering procurement. Evaluated 3 vendors using weighted scoring (40% price, 30% lead time, 30% reliability). SteelCorp Inc selected with highest score of 89.2, balancing competitive pricing ($25.50/unit) with strong reliability (92%) and reasonable 5-day lead time. Recommended order of 850kg will restore inventory to 100% capacity at total cost of $21,675."
}
```

### Health Check Endpoint

**GET** `/api/supply-chain/health/`

Returns service health status.

**Response:**
```json
{
  "status": "healthy",
  "service": "Supply Chain Management API",
  "version": "1.0.0"
}
```

### System Status Endpoint

**GET** `/api/supply-chain/status/`

Returns current system status including inventory summary and recent decisions.

**Response:**
```json
{
  "status": "operational",
  "inventory_summary": {
    "total_items": 2,
    "items_needing_reorder": 1,
    "low_stock_materials": [
      {
        "name": "Steel Sheets",
        "sku": "STEEL-001",
        "stock_percentage": 15.0
      }
    ]
  },
  "recent_decisions_count": 5,
  "learning_insights": {
    "total_decisions": 15,
    "average_confidence": 85.3,
    "procurement_rate": 67.5,
    "most_used_vendor": "SteelCorp Inc"
  }
}
```

## 🧪 Testing with cURL

```bash
# Execute a goal
curl -X POST http://localhost:8000/api/supply-chain/execute-goal/ \
  -H "Content-Type: application/json" \
  -d '{"goal": "Ensure uninterrupted production by restocking raw materials efficiently"}'

# Check system status
curl http://localhost:8000/api/supply-chain/status/

# Health check
curl http://localhost:8000/api/supply-chain/health/
```

## 🏛️ Architecture

### Project Structure

```
supply_chain_project/
├── supply_chain/
│   ├── agents/              # 6 CrewAI agents
│   │   ├── planner.py
│   │   ├── inventory.py
│   │   ├── procurement.py
│   │   ├── vendor_analysis.py
│   │   ├── cost_optimization.py
│   │   └── coordinator.py
│   ├── tasks/               # Agent tasks
│   │   ├── planner_task.py
│   │   ├── inventory_task.py
│   │   ├── procurement_task.py
│   │   ├── vendor_analysis_task.py
│   │   ├── cost_optimization_task.py
│   │   └── coordinator_task.py
│   ├── services/            # Service layer
│   │   ├── data_fetcher.py
│   │   ├── context_builder.py
│   │   ├── cache_utils.py
│   │   └── decision_memory.py
│   ├── models.py            # Django models
│   ├── serializers.py       # DRF serializers
│   ├── views.py             # API views
│   ├── urls.py              # URL routing
│   └── crew.py              # Crew orchestration
├── config/
│   ├── settings.py          # Django settings
│   └── urls.py              # Root URLs
└── manage.py
```

### Agent Workflow

```
User Goal
    ↓
Planner Agent (Analyze goal and create plan)
    ↓
Inventory Monitor (Check stock levels, identify reorders)
    ↓
Procurement Agent (Calculate order quantities)
    ↓
Vendor Analysis (Evaluate vendors on price/lead time/reliability)
    ↓
Cost Optimization (Select best vendor using weighted scoring)
    ↓
Coordinator (Validate and produce final decision)
    ↓
Final Decision (Saved to memory, returned to user)
```

### Database Models

- **RawMaterial**: Materials tracked in inventory
- **Inventory**: Stock levels per material (1:1 with RawMaterial)
- **Vendor**: Suppliers for materials
- **ProcurementDecision**: Historical decisions for learning

## 🎛️ Configuration

### Inventory Threshold

Default reorder threshold is **25%** of max capacity. Can be customized per material in the `RawMaterial` model:

```python
material = RawMaterial.objects.get(sku="STEEL-001")
material.reorder_threshold_percentage = 30  # Change to 30%
material.save()
```

### Vendor Scoring Weights

Default weights in Cost Optimization Agent:
- **Price**: 40%
- **Lead Time**: 30%
- **Reliability**: 30%

To modify, edit [cost_optimization.py](supply_chain/agents/cost_optimization.py).

### Cache Timeouts

Configured in [cache_utils.py](supply_chain/services/cache_utils.py):
- SHORT: 60 seconds (inventory)
- MEDIUM: 300 seconds (vendors)
- LONG: 900 seconds (raw materials)

## 🔧 Admin Interface

Access Django admin at: `http://localhost:8000/admin/`

Manage:
- Raw Materials
- Inventory Levels
- Vendors
- Procurement Decisions

## 📊 Monitoring and Logging

Logs are configured in `config/settings.py`:

```python
LOGGING = {
    'loggers': {
        'supply_chain': {
            'level': 'DEBUG',  # Change to INFO in production
        },
    },
}
```

View logs:
```bash
# In terminal where server is running
# Logs show crew execution, agent decisions, cache hits/misses
```

## 🔒 Security Considerations

### Production Checklist

- [ ] Set `DEBUG=False` in production
- [ ] Use strong `SECRET_KEY`
- [ ] Configure proper `ALLOWED_HOSTS`
- [ ] Use environment variables for all secrets
- [ ] Enable HTTPS
- [ ] Set up proper database user permissions
- [ ] Configure Redis password
- [ ] Implement rate limiting
- [ ] Set up monitoring and alerting
- [ ] Regular backups of PostgreSQL database

### API Security

```python
# Add to settings.py for production
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.TokenAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    'DEFAULT_THROTTLE_CLASSES': [
        'rest_framework.throttling.AnonRateThrottle',
        'rest_framework.throttling.UserRateThrottle'
    ],
    'DEFAULT_THROTTLE_RATES': {
        'anon': '100/hour',
        'user': '1000/hour'
    }
}
```

## 🐛 Troubleshooting

### Database Connection Issues
```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Test connection
psql -U postgres -d supply_chain_db
```

### Redis Connection Issues
```bash
# Check Redis is running
redis-cli ping

# Check Redis logs
sudo tail -f /var/log/redis/redis-server.log
```

### CrewAI/OpenAI Errors
- Verify `OPENAI_API_KEY` is set correctly
- Check API quota and rate limits
- Ensure `OPENAI_API_BASE` URL is correct
- Test API key: `curl https://api.openai.com/v1/models -H "Authorization: Bearer $OPENAI_API_KEY"`

### Import Errors
```bash
# Ensure all dependencies are installed
pip install -r requirements.txt

# Check Python version
python --version  # Should be 3.10+
```

## 📈 Performance Optimization

### Redis Caching
- Inventory queries cached for 60 seconds
- Vendor queries cached for 5 minutes
- Use `invalidate_inventory_cache()` after updates

### Database Optimization
- Models include proper indexes
- Use `select_related()` for FK queries
- Consider database connection pooling for high load

### Async Support (Future Enhancement)
```python
# Can be extended to use Django async views
async def execute_goal_async(request):
    # Async implementation
    pass
```

## 🤝 Contributing

This is a production-ready template. To customize:

1. **Add More Agents**: Create new agent files in `agents/`
2. **Extend Models**: Add fields to models as needed
3. **Custom Scoring**: Modify weighted scoring in `cost_optimization_agent`
4. **Multi-Material Support**: Extend crew to handle multiple materials simultaneously
5. **Integration**: Add webhooks, email notifications, ERP integration

## 📝 License

Proprietary - Internal Use Only

## 🙋 Support

For issues or questions:
- Check logs in console output
- Review Django admin for data integrity
- Verify all environment variables are set
- Test with sample data first

---

**Built with Django + CrewAI for intelligent, explainable supply chain automation** 🚀
