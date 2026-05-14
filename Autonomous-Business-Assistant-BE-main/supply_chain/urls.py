"""
URL Configuration for Supply Chain API.
"""
from django.urls import path
from supply_chain.views import main_views
from supply_chain.views import agent_activity_views

app_name = 'supply_chain'

urlpatterns = [
    # Authentication endpoints
    path('auth/login/', main_views.login, name='login'),
    path('auth/register/', main_views.register, name='register'),
    path('auth/logout/', main_views.logout, name='logout'),
    
    # Main API endpoint
    path('execute-goal/', main_views.execute_goal, name='execute-goal'),
    
    # Health and status endpoints
    path('health/', main_views.health_check, name='health-check'),
    path('status/', main_views.system_status, name='system-status'),
    
    # Company Management endpoints
    path('companies/', main_views.get_companies, name='get-companies'),
    path('companies/create/', main_views.create_company, name='create-company'),
    path('companies/<int:company_id>/', main_views.get_company, name='get-company'),
    
    # Raw Material Inventory endpoints
    path('inventory/', main_views.get_inventories, name='get-inventories'),
    path('inventory/create/', main_views.create_inventory, name='create-inventory'),
    path('inventory/<int:inventory_id>/', main_views.get_inventory, name='get-inventory'),
    path('raw-materials-dropdown/', main_views.raw_materials_dropdown, name='raw-materials-dropdown'),
    
    # Vendor endpoints
    path('vendors/', main_views.get_vendors, name='get-vendors'),
    path('vendors/create/', main_views.create_vendor, name='create-vendor'),
    path('vendors/<int:vendor_id>/', main_views.get_vendor, name='get-vendor'),
    
    # Vendor Quotation endpoints
    path('quotations/', main_views.get_quotations, name='get-quotations'),
    path('quotations/create/', main_views.create_quotation, name='create-quotation'),
    path('quotations/<int:quotation_id>/', main_views.get_quotation, name='get-quotation'),
    path('quotations/<int:quotation_id>/update/', main_views.update_quotation, name='update-quotation'),
    
    # Finish Product endpoints
    path('products/', main_views.get_finish_products, name='get-finish-products'),
    path('products/create/', main_views.create_finish_product, name='create-finish-product'),
    path('products/<int:product_id>/', main_views.get_finish_product, name='get-finish-product'),
    path('products/<int:product_id>/update/', main_views.update_finish_product, name='update-finish-product'),
    
    # Customer Order endpoints
    path('orders/', main_views.get_customer_orders, name='get-customer-orders'),
    path('orders/create/', main_views.create_customer_order, name='create-customer-order'),
    path('orders/<int:order_id>/', main_views.get_customer_order, name='get-customer-order'),
    path('orders/<int:order_id>/update/', main_views.update_customer_order, name='update-customer-order'),
    path('health/', main_views.health_check, name='health-check'),
    path('status/', main_views.system_status, name='system-status'),
    
    # Live Agent Pulse endpoints
    path('agent-pulse/', agent_activity_views.live_agent_pulse, name='agent-pulse'),
    path('agent-summary/', agent_activity_views.agent_summary, name='agent-summary'),
    path('agent-history/<str:agent_type>/', agent_activity_views.agent_activity_history, name='agent-history'),
    path('execution-trace/<str:execution_id>/', agent_activity_views.execution_trace, name='execution-trace'),
    path('agent-cleanup/', agent_activity_views.cleanup_old_activities, name='agent-cleanup'),
]
