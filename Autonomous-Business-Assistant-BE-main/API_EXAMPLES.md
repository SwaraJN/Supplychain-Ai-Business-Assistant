# API Testing Examples

## Execute Goal with Different Scenarios

### Scenario 1: Low Stock Requiring Procurement
```bash
curl -X POST http://localhost:8000/api/supply-chain/execute-goal/ \
  -H "Content-Type: application/json" \
  -d '{
    "goal": "Ensure uninterrupted production by restocking raw materials efficiently"
  }' | jq
```

### Scenario 2: Minimize Costs
```bash
curl -X POST http://localhost:8000/api/supply-chain/execute-goal/ \
  -H "Content-Type: application/json" \
  -d '{
    "goal": "Minimize procurement costs while maintaining adequate inventory levels"
  }' | jq
```

### Scenario 3: Fast Delivery Priority
```bash
curl -X POST http://localhost:8000/api/supply-chain/execute-goal/ \
  -H "Content-Type: application/json" \
  -d '{
    "goal": "Restock materials urgently with fastest possible delivery"
  }' | jq
```

### Scenario 4: Reliability Priority
```bash
curl -X POST http://localhost:8000/api/supply-chain/execute-goal/ \
  -H "Content-Type: application/json" \
  -d '{
    "goal": "Source materials from the most reliable vendors to avoid disruptions"
  }' | jq
```

## System Status Check

```bash
curl http://localhost:8000/api/supply-chain/status/ | jq
```

## Health Check

```bash
curl http://localhost:8000/api/supply-chain/health/ | jq
```

## Expected Response Format

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
  "explanation": "Detailed explanation of the decision..."
}
```

## Testing with Python

```python
import requests
import json

# API endpoint
url = "http://localhost:8000/api/supply-chain/execute-goal/"

# Request payload
payload = {
    "goal": "Ensure uninterrupted production by restocking raw materials efficiently"
}

# Make request
response = requests.post(url, json=payload)

# Print response
print(json.dumps(response.json(), indent=2))
```

## Performance Testing

```bash
# Install Apache Bench
sudo apt-get install apache2-utils

# Run load test (100 requests, 10 concurrent)
ab -n 100 -c 10 -T 'application/json' \
  -p payload.json \
  http://localhost:8000/api/supply-chain/execute-goal/
```

Where `payload.json` contains:
```json
{"goal": "Ensure uninterrupted production by restocking raw materials efficiently"}
```
