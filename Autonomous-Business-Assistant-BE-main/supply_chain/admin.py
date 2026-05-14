"""Admin configuration for supply chain models."""
from django.contrib import admin
from .models import (
    Company, RawMaterialInventory, 
    Vendor, ProcurementDecision, CustomerOrder,
    MaterialConsumptionHistory, VendorPerformanceHistory,
    SeasonalPattern, PriceHistory, AIDecisionFeedback, AgentActivity
)



@admin.register(Company)
class CompanyAdmin(admin.ModelAdmin):
    list_display = ['name', 'business_type', 'location', 'is_active', 'created_at']
    search_fields = ['name', 'location']
    list_filter = ['business_type', 'is_active', 'created_at']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(RawMaterialInventory)
class RawMaterialInventoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'current_stock', 'max_capacity', 'stock_percentage', 'needs_reorder', 'updated_at']
    search_fields = ['name']
    list_filter = ['updated_at']
    readonly_fields = ['stock_percentage', 'needs_reorder', 'created_at', 'updated_at']
    
    def stock_percentage(self, obj):
        return f"{obj.stock_percentage:.2f}%"
    stock_percentage.short_description = 'Stock %'
    
    def needs_reorder(self, obj):
        return obj.needs_reorder
    needs_reorder.boolean = True


@admin.register(Vendor)
class VendorAdmin(admin.ModelAdmin):
    list_display = ['name', 'material_supply', 'price_per_unit', 'lead_time_days', 'reliability_score', 'is_active']
    list_filter = ['is_active', 'material_supply']
    search_fields = ['name', 'material_supply__name', 'email']


@admin.register(ProcurementDecision)
class ProcurementDecisionAdmin(admin.ModelAdmin):
    list_display = ['raw_material', 'selected_vendor', 'order_quantity', 'expected_cost', 'confidence_score', 'procurement_required', 'created_at']
    list_filter = ['created_at', 'procurement_required']
    search_fields = ['raw_material__name', 'selected_vendor__name', 'goal']
    readonly_fields = ['created_at']


@admin.register(CustomerOrder)
class CustomerOrderAdmin(admin.ModelAdmin):
    list_display = ['order_number', 'company', 'customer_name', 'status', 'priority', 'total_amount', 'required_delivery_date']
    list_filter = ['status', 'priority', 'created_at']
    search_fields = ['order_number', 'customer_name', 'customer_email']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(MaterialConsumptionHistory)
class MaterialConsumptionHistoryAdmin(admin.ModelAdmin):
    list_display = ['raw_material', 'date', 'quantity_consumed', 'production_volume']
    list_filter = ['date', 'raw_material']
    search_fields = ['raw_material__name']
    date_hierarchy = 'date'
    readonly_fields = ['created_at', 'updated_at']


@admin.register(VendorPerformanceHistory)
class VendorPerformanceHistoryAdmin(admin.ModelAdmin):
    list_display = ['vendor', 'order_date', 'on_time_delivery', 'delivery_delay_days', 'quality_score', 'overall_satisfaction']
    list_filter = ['on_time_delivery', 'order_date', 'vendor']
    search_fields = ['vendor__name']
    readonly_fields = ['created_at', 'updated_at', 'delivery_delay_days']
    date_hierarchy = 'order_date'


@admin.register(SeasonalPattern)
class SeasonalPatternAdmin(admin.ModelAdmin):
    list_display = ['raw_material', 'month', 'week_of_month', 'demand_multiplier', 'confidence_level']
    list_filter = ['month', 'raw_material']
    search_fields = ['raw_material__name', 'notes']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(PriceHistory)
class PriceHistoryAdmin(admin.ModelAdmin):
    list_display = ['vendor', 'effective_date', 'price_per_unit', 'price_change_percentage']
    list_filter = ['effective_date', 'vendor']
    search_fields = ['vendor__name', 'reason']
    date_hierarchy = 'effective_date'
    readonly_fields = ['created_at', 'updated_at']


@admin.register(AIDecisionFeedback)
class AIDecisionFeedbackAdmin(admin.ModelAdmin):
    list_display = ['procurement_decision', 'decision_approved', 'actual_outcome_score', 'cost_variance_percentage', 'delivery_variance_days']
    list_filter = ['decision_approved', 'created_at']
    search_fields = ['procurement_decision__raw_material__name', 'user_feedback']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(AgentActivity)
class AgentActivityAdmin(admin.ModelAdmin):
    list_display = ['agent_type', 'status', 'activity_description_short', 'has_output', 'started_at', 'duration_seconds', 'execution_id']
    list_filter = ['agent_type', 'status', 'started_at']
    search_fields = ['activity_description', 'goal', 'execution_id', 'agent_output']
    readonly_fields = ['started_at', 'completed_at', 'duration_seconds', 'created_at', 'updated_at', 'formatted_output']
    date_hierarchy = 'started_at'
    
    def activity_description_short(self, obj):
        return obj.activity_description[:80] + '...' if len(obj.activity_description) > 80 else obj.activity_description
    activity_description_short.short_description = 'Activity'
    
    def has_output(self, obj):
        return '✅ Yes' if obj.agent_output else '❌ No'
    has_output.short_description = 'Has Output'
    
    def formatted_output(self, obj):
        """Display agent output in a readable format."""
        if not obj.agent_output:
            return "No output captured"
        
        from django.utils.html import format_html
        output_preview = obj.agent_output[:500]
        if len(obj.agent_output) > 500:
            output_preview += f"\n\n... (truncated, total length: {len(obj.agent_output)} chars)"
        
        return format_html('<pre style="white-space: pre-wrap; max-width: 800px;">{}</pre>', output_preview)
    formatted_output.short_description = 'Agent Output'
    
    fieldsets = (
        ('Agent Information', {
            'fields': ('agent_type', 'agent_id', 'status')
        }),
        ('Activity Details', {
            'fields': ('activity_description', 'goal', 'execution_id')
        }),
        ('Agent Output', {
            'fields': ('formatted_output',),
            'description': 'The actual output/result from the agent\'s execution'
        }),
        ('Timing', {
            'fields': ('started_at', 'completed_at', 'duration_seconds')
        }),
        ('Additional Data', {
            'fields': ('metadata',),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

