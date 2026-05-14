# 🧠 Historical Intelligence & Learning System

## Overview
The system now uses historical operational data to make intelligent, data-driven procurement decisions instead of relying solely on current state.

---

## 📊 New Historical Tracking Models

### 1. **MaterialConsumptionHistory**
Tracks daily consumption patterns for accurate demand forecasting.

**Fields:**
- `date`: Daily consumption date
- `quantity_consumed`: Amount used that day
- `production_volume`: Output produced
- `notes`: Special events (holidays, spikes)

**Intelligence Gained:**
- Average daily consumption rates
- Seasonal demand patterns
- Production correlation analysis
- Trend prediction (30-90 days ahead)

---

### 2. **VendorPerformanceHistory**
Tracks actual vendor performance vs promises.

**Fields:**
- `order_date`, `expected_delivery_date`, `actual_delivery_date`
- `ordered_quantity` vs `delivered_quantity`
- `quality_score` (0-100 from inspections)
- `on_time_delivery` (boolean)
- `delivery_delay_days` (calculated)
- `cost_accuracy` (quoted vs actual)
- `overall_satisfaction` (0-100)
- `issues_reported` (text)

**Intelligence Gained:**
- Real reliability scores (not just stated)
- Delivery consistency trends
- Quality track record
- Cost prediction accuracy
- Vendor performance trending (improving/declining)

---

### 3. **SeasonalPattern**
Captures known seasonal demand variations.

**Fields:**
- `month` (1-12)
- `week_of_month` (optional for finer granularity)
- `demand_multiplier` (e.g., 1.8 = 80% higher demand)
- `average_consumption`
- `confidence_level` (based on historical data)
- `notes` (e.g., "Valentine's Day spike")

**Intelligence Gained:**
- Proactive procurement before demand spikes
- Adjusted reorder points for seasonal patterns
- Budget planning for high-demand periods

**Example for Chocolate Company:**
- February: 1.8x multiplier (Valentine's Day)
- December: 2.0x multiplier (Christmas)
- October: 1.4x multiplier (Halloween)

---

### 4. **PriceHistory**
Tracks vendor price changes over time.

**Fields:**
- `effective_date`
- `price_per_unit`
- `price_change_percentage`
- `reason` (market conditions, supply issues, etc.)

**Intelligence Gained:**
- Price trend analysis (increasing/decreasing/stable)
- Optimal timing for bulk purchases
- Budget forecasting
- Vendor price volatility assessment

---

### 5. **AIDecisionFeedback**
Human feedback on AI decisions for continuous learning.

**Fields:**
- `decision_approved` (boolean)
- `actual_outcome_score` (0-100)
- `cost_variance_percentage` (predicted vs actual)
- `delivery_variance_days` (predicted vs actual)
- `user_feedback` (text)
- `lessons_learned` (JSON)

**Intelligence Gained:**
- AI accuracy metrics
- Decision approval rates
- Prediction error analysis
- Continuous improvement recommendations

---

## 🤖 Historical Intelligence Service

### Available Analytics Functions

#### 1. **get_consumption_forecast(material_id, days_ahead=30)**
```python
from supply_chain.services.historical_intelligence import HistoricalIntelligence

forecast = HistoricalIntelligence.get_consumption_forecast(material_id=1, days_ahead=30)
```

**Returns:**
```json
{
    "material_name": "Cocoa Beans",
    "forecast_available": true,
    "days_ahead": 30,
    "average_daily_consumption": 520.5,
    "seasonal_multiplier": 1.8,
    "seasonal_notes": "Valentine's Day demand spike",
    "predicted_consumption": 28116.0,
    "confidence_percentage": 87.5,
    "data_points_used": 90
}
```

---

#### 2. **get_vendor_intelligence(vendor_id)**
Analyzes vendor's actual performance vs stated reliability.

**Returns:**
```json
{
    "vendor_name": "Ghana Cocoa Exports Ltd",
    "total_orders": 12,
    "on_time_delivery_percentage": 91.67,
    "average_delay_days": 0.5,
    "average_quality_score": 94.2,
    "average_satisfaction": 93.5,
    "cost_accuracy_percentage": 99.8,
    "performance_trend": "improving",
    "current_stated_reliability": 92.0,
    "calculated_reliability_score": 93.1,
    "recommendation": "Score accurate"
}
```

---

#### 3. **get_price_trend_analysis(vendor_id)**
Tracks price movements for strategic procurement timing.

**Returns:**
```json
{
    "vendor_name": "Dutch Cocoa Processing BV",
    "current_price": 8.50,
    "trend_direction": "increasing",
    "total_change_percentage": 12.5,
    "average_change_percentage": 2.1,
    "price_history": [
        {"date": "2026-02-01", "price": 8.50, "change_percentage": 3.0},
        {"date": "2025-12-15", "price": 8.25, "change_percentage": 2.5}
    ],
    "data_points": 8
}
```

---

#### 4. **get_intelligent_reorder_point(material_id)**
Calculates optimal reorder point using consumption forecasts + lead times.

**Formula:**
```
Reorder Point = (Daily Consumption × Lead Time) + Safety Stock
Safety Stock = (Daily Consumption × Lead Time) × 1.5
```

**Returns:**
```json
{
    "material_name": "Cocoa Beans",
    "current_stock": 3000,
    "current_stock_percentage": 12.0,
    "current_reorder_threshold_percentage": 25.0,
    "recommended_reorder_percentage": 32.5,
    "recommended_reorder_quantity": 8125,
    "optimal_order_quantity": 16875,
    "average_lead_time_days": 43,
    "daily_consumption_rate": 520.5,
    "safety_stock": 5625,
    "confidence": 87.5,
    "recommendation": "Update threshold to 32.5%"
}
```

---

#### 5. **get_ai_learning_insights()**
Tracks AI decision accuracy over time.

**Returns:**
```json
{
    "total_decisions_with_feedback": 45,
    "overall_approval_rate": 88.9,
    "recent_approval_rate": 92.0,
    "performance_trend": "improving",
    "average_cost_variance_percentage": 3.2,
    "average_delivery_variance_days": 1.5,
    "recommendation": "AI performance is good - continue learning from feedback"
}
```

---

## 🎯 How Historical Intelligence Improves Decisions

### Traditional Approach (Without History)
```
IF current_stock < 25% THEN
    Order from cheapest vendor with acceptable lead time
END IF
```

**Problems:**
- No anticipation of demand spikes
- Fixed 25% threshold doesn't adapt
- Vendor selection ignores past performance
- No learning from mistakes

---

### Intelligent Approach (With History)
```
1. Forecast demand for next 30 days using historical consumption + seasonal patterns
2. Calculate intelligent reorder point based on forecast + vendor lead times + safety stock
3. Evaluate vendors using:
   - Actual performance history (not just stated scores)
   - Price trend analysis (is now a good time to buy?)
   - Quality track record
   - Recent performance trends
4. Learn from past decision outcomes
5. Adjust confidence based on historical accuracy
```

**Benefits:**
- ✅ Proactive procurement before stockouts
- ✅ Dynamic reorder points adapt to demand
- ✅ Vendor selection based on real performance
- ✅ Price-aware timing (buy before spikes)
- ✅ Continuous learning and improvement

---

## 📈 Example: Chocolate Company Before Valentine's Day

### Scenario: January 15, 2026

**Without Historical Intelligence:**
- Current cocoa beans stock: 12% (3,000 kg)
- System triggers reorder because < 25%
- Orders from cheapest vendor: Ivory Coast ($3.85/kg)
- Lead time: 50 days
- **Result:** Arrives March 5 - AFTER Valentine's rush!

**With Historical Intelligence:**
- System sees: Valentine's Day approaching (Feb 14)
- Historical data shows: 1.8x consumption spike in early February
- Forecast: Will consume 28,000 kg by Feb 14
- Current stock: Only 3,000 kg
- **Critical shortage predicted!**
- System recommends:
  - Order 22,000 kg immediately
  - Select Ecuador Fine Cocoa (35 days, fastest delivery)
  - Despite higher price ($5.10/kg), ensures Valentine's production
  - Arrives Feb 19 - meets demand!

**Intelligence Used:**
1. ✅ Consumption forecast (28,000 kg needed)
2. ✅ Seasonal pattern (1.8x multiplier for February)
3. ✅ Vendor performance (Ecuador has 95% on-time rate)
4. ✅ Lead time optimization (35 days vs 50 days)
5. ✅ Cost-benefit analysis (missed Valentine's sales >> higher cocoa cost)

---

## 🚀 Using Historical Intelligence in API

### Seed Historical Data
```bash
# Run from project root
python manage.py seed_historical_data
```

**Creates:**
- 90 days of consumption history (all materials)
- 5-15 vendor performance records per vendor
- Seasonal patterns for key months
- 6-12 price history points per vendor

---

### Execute Goal with Historical Context
```bash
curl -X POST http://localhost:8000/api/supply-chain/execute-goal/ \
  -H "Content-Type: application/json" \
  -d '{
    "goal": "Prepare for Valentine's Day production spike using historical demand patterns"
  }'
```

**AI Agents Now Consider:**
- Historical consumption trends
- Seasonal demand multipliers
- Vendor past performance
- Price trends
- Learned patterns from previous decisions

---

### View Intelligence Reports

Add these endpoints to `views.py`:

```python
@api_view(['GET'])
def material_forecast(request, material_id):
    """Get consumption forecast for a material"""
    from supply_chain.services.historical_intelligence import HistoricalIntelligence
    forecast = HistoricalIntelligence.get_consumption_forecast(material_id, days_ahead=30)
    return Response(forecast)

@api_view(['GET'])
def vendor_intelligence(request, vendor_id):
    """Get vendor intelligence report"""
    from supply_chain.services.historical_intelligence import HistoricalIntelligence
    intelligence = HistoricalIntelligence.get_vendor_intelligence(vendor_id)
    return Response(intelligence)
```

---

## 💡 Key Benefits

| Traditional System | Intelligent System |
|-------------------|-------------------|
| Reacts to current stock only | Predicts future needs |
| Fixed 25% threshold | Dynamic reorder points |
| Vendor selection by stated scores | Vendor selection by proven performance |
| No timing strategy | Price-aware timing |
| No learning | Continuous improvement |
| Treats all months the same | Seasonal awareness |
| Binary decisions | Confidence-weighted decisions |

---

## 🎓 Continuous Learning Loop

```
1. AI makes procurement decision
   ↓
2. Human approves/rejects + provides feedback
   ↓
3. System tracks actual outcomes
   - Was delivery on time?
   - Was cost accurate?
   - Was quality good?
   ↓
4. Feedback stored in AIDecisionFeedback
   ↓
5. Next decision uses learned patterns
   ↓
6. Accuracy improves over time
```

---

## 📊 Admin Dashboard Access

All historical data visible in Django Admin:

- `/admin/supply_chain/materialconsumptionhistory/` - Daily consumption
- `/admin/supply_chain/vendorperformancehistory/` - Vendor track record
- `/admin/supply_chain/seasonalpattern/` - Demand patterns
- `/admin/supply_chain/pricehistory/` - Price trends
- `/admin/supply_chain/aidecisionfeedback/` - AI learning

---

## 🎯 Next Steps

1. **Seed historical data:**
   ```bash
   python manage.py seed_historical_data
   ```

2. **Test intelligent forecasting:**
   - Check consumption predictions
   - Review vendor intelligence
   - Analyze seasonal patterns

3. **Execute goals that leverage history:**
   - "Prepare for seasonal demand spike"
   - "Optimize procurement timing based on price trends"
   - "Select vendors with proven reliability"

4. **Provide feedback on decisions:**
   - Track actual outcomes
   - Update AI decision feedback
   - System learns and improves

---

**Your supply chain system now thinks ahead, learns from experience, and makes data-driven decisions!** 🧠🚀
