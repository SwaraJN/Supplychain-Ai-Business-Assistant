"""
Django models for Supply Chain Management System.
"""
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.contrib.auth.models import AbstractUser, BaseUserManager


# ==================== Base Models ====================

class BaseModel(models.Model):
    """Abstract base model for timestamps"""
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True
        ordering = ['-created_at']


# ==================== User Management ====================

class UserManager(BaseUserManager):
    """Custom user manager for email-based authentication"""
    
    def create_user(self, email, password=None, **extra_fields):
        """Create and save a regular user with email and password"""
        if not email:
            raise ValueError('The Email field must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user
    
    def create_superuser(self, email, password=None, **extra_fields):
        """Create and save a superuser with email and password"""
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_verified', True)
        
        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')
        
        return self.create_user(email, password, **extra_fields)


# ==================== Company Management ====================

class Company(BaseModel):
    """Organization using the system"""
    BUSINESS_TYPE_CHOICES = [
        ('MANUFACTURING', 'Manufacturing'),
        ('WHOLESALE', 'Wholesale'),
        ('RETAIL', 'Retail'),
        ('LOGISTICS', 'Logistics'),
    ]
    
    name = models.CharField(max_length=255)
    address = models.TextField()
    location = models.CharField(max_length=255)
    business_type = models.CharField(max_length=50, choices=BUSINESS_TYPE_CHOICES)
    business_description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        verbose_name_plural = 'Companies'
    
    def __str__(self):
        return self.name


# ==================== Inventory Management ====================

class RawMaterialInventory(models.Model):
    """
    Represents a raw material in the supply chain with inventory tracking.
    """
    name = models.CharField(
        max_length=255, 
        unique=True, 
        db_index=True,
        help_text="Name of the raw material"
    )
    current_stock = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(0)],
        help_text="Current stock quantity"
    )
    max_capacity = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        validators=[MinValueValidator(0)],
        help_text="Maximum storage capacity",
        default=1000.00
    )
    reorder_threshold_percentage = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=25.00,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        help_text="Percentage threshold for triggering procurement"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'raw_materials_inventory'
        ordering = ['name']
        indexes = [
            models.Index(fields=['name']),
            models.Index(fields=['-updated_at']),
        ]

    def __str__(self):
        return self.name

    @property
    def stock_percentage(self) -> float:
        """Calculate current stock as percentage of max capacity."""
        if self.max_capacity > 0:
            return float((self.current_stock / self.max_capacity) * 100)
        return 0.0

    @property
    def needs_reorder(self) -> bool:
        """Check if stock is below reorder threshold."""
        return self.stock_percentage < float(self.reorder_threshold_percentage)


# ==================== Vendor Management ====================

class Vendor(models.Model):
    """
    Represents a vendor that supplies specific raw materials.
    """
    name = models.CharField(max_length=255, db_index=True)
    material_supply = models.ForeignKey(
        RawMaterialInventory,
        on_delete=models.CASCADE,
        related_name='vendors'
    )
    email = models.EmailField(max_length=255, blank=True, null=True)
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    price_per_unit = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)],
        help_text="Price per unit in currency",
        default=0.00
    )
    lead_time_days = models.IntegerField(
        validators=[MinValueValidator(1)],
        help_text="Number of days for delivery",
        default=7
    )
    reliability_score = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        help_text="Reliability score (0-100)",
        default=75.00
    )
    is_active = models.BooleanField(default=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'vendors'
        ordering = ['name']
        indexes = [
            models.Index(fields=['material_supply', 'is_active']),
            models.Index(fields=['name']),
        ]
        unique_together = [['name', 'material_supply']]

    def __str__(self):
        return f"{self.name} - {self.material_supply.name}"


# ==================== Procurement Decisions ====================

class ProcurementDecision(models.Model):
    """
    Stores procurement decisions made by the AI system.
    """
    raw_material = models.ForeignKey(
        RawMaterialInventory,
        on_delete=models.CASCADE,
        related_name='procurement_decisions'
    )
    goal = models.TextField(help_text="The goal that triggered this decision")
    selected_vendor = models.ForeignKey(
        Vendor,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='procurement_decisions'
    )
    order_quantity = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        validators=[MinValueValidator(0)]
    )
    expected_cost = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        validators=[MinValueValidator(0)]
    )
    confidence_score = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        help_text="AI confidence score (0-100)"
    )
    explanation = models.JSONField(
        help_text="Detailed explanation of the decision in JSON format"
    )
    procurement_required = models.BooleanField(default=True, db_index=True)
    inventory_status = models.JSONField(
        help_text="Snapshot of inventory status at decision time"
    )
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        db_table = 'procurement_decisions'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['-created_at']),
            models.Index(fields=['raw_material', '-created_at']),
            models.Index(fields=['procurement_required']),
        ]

    def __str__(self):
        return f"Decision for {self.raw_material.name} - {self.created_at.strftime('%Y-%m-%d %H:%M')}"


# ==================== Order Management ====================

class CustomerOrder(BaseModel):
    """Orders from customers"""
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('CONFIRMED', 'Confirmed'),
        ('PROCESSING', 'Processing'),
        ('READY', 'Ready'),
        ('SHIPPED', 'Shipped'),
        ('DELIVERED', 'Delivered'),
    ]
    PRIORITY_CHOICES = [
        ('LOW', 'Low'),
        ('NORMAL', 'Normal'),
        ('HIGH', 'High'),
        ('URGENT', 'Urgent'),
    ]

    PREFIX = 'ORD'
    
    company = models.ForeignKey(
        Company, 
        on_delete=models.CASCADE, 
        related_name='customer_orders'
    )
    order_number = models.CharField(max_length=50, unique=True)
    customer_name = models.CharField(max_length=255)
    customer_email = models.EmailField()
    shipping_address = models.TextField()
    
    status = models.CharField(
        max_length=30, 
        choices=STATUS_CHOICES, 
        default='PENDING'
    )
    priority = models.CharField(
        max_length=20, 
        choices=PRIORITY_CHOICES, 
        default='NORMAL'
    )
    required_delivery_date = models.DateTimeField()
    total_amount = models.DecimalField(
        max_digits=12, 
        decimal_places=2, 
        default=0
    )
    
    assigned_to_agent = models.CharField(max_length=100, blank=True)
    
    class Meta:
        db_table = 'customer_orders'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['order_number']),
            models.Index(fields=['status']),
            models.Index(fields=['-required_delivery_date']),
        ]
    
    def __str__(self):
        return f"Order-{self.order_number}"


# ==================== Historical Intelligence & Analytics ====================

class MaterialConsumptionHistory(BaseModel):
    """
    Tracks daily/weekly consumption patterns for predictive analytics.
    Used for demand forecasting and intelligent reorder point calculation.
    """
    raw_material = models.ForeignKey(
        RawMaterialInventory,
        on_delete=models.CASCADE,
        related_name='consumption_history'
    )
    date = models.DateField(db_index=True)
    quantity_consumed = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        validators=[MinValueValidator(0)],
        help_text="Quantity consumed on this date"
    )
    production_volume = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=0,
        help_text="Production output on this date"
    )
    notes = models.TextField(blank=True, help_text="Special events, holidays, etc.")
    
    class Meta:
        db_table = 'material_consumption_history'
        ordering = ['-date']
        unique_together = [['raw_material', 'date']]
        indexes = [
            models.Index(fields=['raw_material', '-date']),
            models.Index(fields=['date']),
        ]
    
    def __str__(self):
        return f"{self.raw_material.name} - {self.date}: {self.quantity_consumed}"


class VendorPerformanceHistory(BaseModel):
    """
    Tracks actual vendor performance for each order.
    Used to update reliability scores and make intelligent vendor selection.
    """
    vendor = models.ForeignKey(
        Vendor,
        on_delete=models.CASCADE,
        related_name='performance_history'
    )
    procurement_decision = models.ForeignKey(
        ProcurementDecision,
        on_delete=models.CASCADE,
        related_name='vendor_performance',
        null=True,
        blank=True
    )
    order_date = models.DateField()
    expected_delivery_date = models.DateField()
    actual_delivery_date = models.DateField(null=True, blank=True)
    
    ordered_quantity = models.DecimalField(max_digits=15, decimal_places=2)
    delivered_quantity = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        null=True,
        blank=True,
        help_text="Actual quantity delivered"
    )
    
    quality_score = models.DecimalField(
        max_digits=4,
        decimal_places=2,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        null=True,
        blank=True,
        help_text="Quality inspection score (0-100)"
    )
    
    on_time_delivery = models.BooleanField(
        default=False,
        help_text="Whether delivery was on time or early"
    )
    delivery_delay_days = models.IntegerField(
        default=0,
        help_text="Number of days delayed (negative if early)"
    )
    
    cost_accuracy = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=100.00,
        help_text="Percentage accuracy of quoted vs actual cost"
    )
    
    issues_reported = models.TextField(
        blank=True,
        help_text="Any quality, delivery, or other issues"
    )
    
    overall_satisfaction = models.DecimalField(
        max_digits=4,
        decimal_places=2,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        default=75.00,
        help_text="Overall satisfaction score (0-100)"
    )
    
    class Meta:
        db_table = 'vendor_performance_history'
        ordering = ['-order_date']
        indexes = [
            models.Index(fields=['vendor', '-order_date']),
            models.Index(fields=['on_time_delivery']),
            models.Index(fields=['-order_date']),
        ]
    
    def __str__(self):
        return f"{self.vendor.name} - {self.order_date}"
    
    def save(self, *args, **kwargs):
        """Calculate derived fields on save"""
        if self.actual_delivery_date and self.expected_delivery_date:
            delay = (self.actual_delivery_date - self.expected_delivery_date).days
            self.delivery_delay_days = delay
            self.on_time_delivery = delay <= 0
        super().save(*args, **kwargs)


class SeasonalPattern(BaseModel):
    """
    Tracks seasonal consumption patterns for intelligent forecasting.
    Example: Chocolate demand spikes before Valentine's Day, Christmas.
    """
    raw_material = models.ForeignKey(
        RawMaterialInventory,
        on_delete=models.CASCADE,
        related_name='seasonal_patterns'
    )
    month = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(12)],
        help_text="Month (1-12)"
    )
    week_of_month = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        null=True,
        blank=True,
        help_text="Week within month (optional for fine-grained patterns)"
    )
    
    demand_multiplier = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=1.00,
        help_text="Multiplier relative to average (1.5 = 50% higher demand)"
    )
    
    average_consumption = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        help_text="Average consumption for this period"
    )
    
    notes = models.TextField(
        blank=True,
        help_text="Reason for pattern (e.g., 'Valentine Day demand spike')"
    )
    
    confidence_level = models.DecimalField(
        max_digits=4,
        decimal_places=2,
        default=75.00,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        help_text="Confidence in this pattern based on historical data"
    )
    
    class Meta:
        db_table = 'seasonal_patterns'
        ordering = ['raw_material', 'month', 'week_of_month']
        unique_together = [['raw_material', 'month', 'week_of_month']]
        indexes = [
            models.Index(fields=['raw_material', 'month']),
        ]
    
    def __str__(self):
        week_str = f" Week {self.week_of_month}" if self.week_of_month else ""
        return f"{self.raw_material.name} - Month {self.month}{week_str}"


class PriceHistory(BaseModel):
    """
    Tracks historical pricing from vendors for trend analysis and predictions.
    """
    vendor = models.ForeignKey(
        Vendor,
        on_delete=models.CASCADE,
        related_name='price_history'
    )
    effective_date = models.DateField(db_index=True)
    price_per_unit = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)]
    )
    price_change_percentage = models.DecimalField(
        max_digits=6,
        decimal_places=2,
        default=0.00,
        help_text="Percentage change from previous price"
    )
    reason = models.TextField(
        blank=True,
        help_text="Reason for price change (market conditions, etc.)"
    )
    
    class Meta:
        db_table = 'price_history'
        ordering = ['-effective_date']
        indexes = [
            models.Index(fields=['vendor', '-effective_date']),
        ]
    
    def __str__(self):
        return f"{self.vendor.name} - {self.effective_date}: ${self.price_per_unit}"


class AIDecisionFeedback(BaseModel):
    """
    Tracks feedback on AI decisions for continuous learning.
    """
    procurement_decision = models.OneToOneField(
        ProcurementDecision,
        on_delete=models.CASCADE,
        related_name='feedback'
    )
    
    decision_approved = models.BooleanField(
        default=True,
        help_text="Was the AI decision approved by humans?"
    )
    
    actual_outcome_score = models.DecimalField(
        max_digits=4,
        decimal_places=2,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        null=True,
        blank=True,
        help_text="Actual outcome quality score (0-100)"
    )
    
    cost_variance_percentage = models.DecimalField(
        max_digits=6,
        decimal_places=2,
        default=0.00,
        help_text="Actual cost vs predicted cost variance"
    )
    
    delivery_variance_days = models.IntegerField(
        default=0,
        help_text="Actual vs predicted delivery time difference"
    )
    
    user_feedback = models.TextField(
        blank=True,
        help_text="Human feedback on the decision"
    )
    
    lessons_learned = models.JSONField(
        default=dict,
        help_text="Structured lessons for ML improvement"
    )
    
    class Meta:
        db_table = 'ai_decision_feedback'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Feedback: {self.procurement_decision.raw_material.name} - {self.created_at.date()}"

# ==================== Vendor Quotation Management ====================

class VendorQuotation(BaseModel):
    """
    Vendor quotations received from vendors (via email or API).
    Stores quotation data for agent analysis and vendor comparison.
    """
    STATUS_CHOICES = [
        ('PENDING', 'Pending Analysis'),
        ('ANALYZING', 'Being Analyzed'),
        ('REVIEWED', 'Reviewed'),
        ('APPROVED', 'Approved'),
        ('REJECTED', 'Rejected'),
    ]
    
    vendor = models.ForeignKey(
        Vendor,
        on_delete=models.CASCADE,
        related_name='quotations',
        help_text="Reference to the vendor"
    )
    raw_material = models.ForeignKey(
        RawMaterialInventory,
        on_delete=models.CASCADE,
        related_name='quotations',
        help_text="Raw material being quoted"
    )
    quantity = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        validators=[MinValueValidator(0)],
        help_text="Quantity offered by vendor"
    )
    delivery_date = models.DateField(
        help_text="Expected delivery date"
    )
    price_per_unit = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        validators=[MinValueValidator(0)],
        help_text="Price per unit from vendor"
    )
    total_price = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        validators=[MinValueValidator(0)],
        help_text="Total price (quantity * price_per_unit)"
    )
    discount = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        help_text="Discount percentage"
    )
    discount_amount = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(0)],
        help_text="Calculated discount amount"
    )
    final_price = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        validators=[MinValueValidator(0)],
        help_text="Final price after discount"
    )
    ai_score = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        help_text="Weighted AI score (0-100)"
    )
    ai_analysis = models.JSONField(
        default=dict,
        blank=True,
        help_text="Detailed analysis from AI agents"
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='PENDING',
        db_index=True
    )
    source = models.CharField(
        max_length=50,
        default='email',
        help_text="Source of quotation (email, api, manual, etc.)"
    )
    notes = models.TextField(
        blank=True,
        help_text="Additional notes about the quotation"
    )
    
    class Meta:
        db_table = 'vendor_quotations'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['vendor', '-created_at']),
            models.Index(fields=['raw_material', '-created_at']),
            models.Index(fields=['status']),
            models.Index(fields=['-ai_score']),
        ]
    
    def __str__(self):
        return f"Quotation from {self.vendor.name} for {self.raw_material.name} - {self.created_at.strftime('%Y-%m-%d')}"
    
    def save(self, *args, **kwargs):
        """Calculate derived fields before saving"""
        self.discount_amount = (self.total_price * self.discount) / 100
        self.final_price = self.total_price - self.discount_amount
        super().save(*args, **kwargs)

# ==================== Finished Product Management ====================

class FinishProduct(BaseModel):
    """
    Finished products ready for sale/delivery.
    Represents manufactured goods produced from raw materials.
    """
    STATUS_CHOICES = [
        ('READY', 'Ready for Sale'),
        ('RESERVED', 'Reserved for Order'),
        ('SOLD', 'Sold'),
        ('RETURNED', 'Returned'),
        ('QUALITY_HOLD', 'Quality Hold'),
    ]
    
    QUALITY_CHOICES = [
        ('PASSED', 'Quality Passed'),
        ('FAILED', 'Quality Failed'),
        ('PENDING', 'Pending QC'),
        ('REWORK', 'Rework Required'),
    ]
    
    name = models.CharField(
        max_length=255,
        db_index=True,
        help_text="Product name"
    )
    sku = models.CharField(
        max_length=100,
        unique=True,
        db_index=True,
        help_text="Stock Keeping Unit - unique product code"
    )
    description = models.TextField(
        blank=True,
        help_text="Detailed product description"
    )
    quantity_available = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(0)],
        help_text="Quantity available for sale"
    )
    quantity_reserved = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(0)],
        help_text="Quantity reserved for pending orders"
    )
    unit_price = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        validators=[MinValueValidator(0)],
        help_text="Selling price per unit"
    )
    total_value = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(0)],
        help_text="Total value (quantity_available * unit_price)"
    )
    raw_materials_used = models.JSONField(
        default=list,
        blank=True,
        help_text="Bill of Materials - list of raw materials used"
    )
    manufacturing_date = models.DateField(
        help_text="Date of manufacturing"
    )
    expiry_date = models.DateField(
        blank=True,
        null=True,
        help_text="Expiry date (if applicable)"
    )
    warehouse_location = models.CharField(
        max_length=255,
        blank=True,
        help_text="Storage location in warehouse"
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='READY',
        db_index=True
    )
    quality_check_status = models.CharField(
        max_length=20,
        choices=QUALITY_CHOICES,
        default='PENDING'
    )
    quality_check_notes = models.TextField(
        blank=True,
        help_text="QC inspection notes and findings"
    )
    batch_number = models.CharField(
        max_length=100,
        blank=True,
        help_text="Manufacturing batch number"
    )
    supplier_batch_number = models.CharField(
        max_length=100,
        blank=True,
        help_text="Raw material supplier batch reference"
    )
    notes = models.TextField(
        blank=True,
        help_text="Additional notes about the product"
    )
    
    class Meta:
        db_table = 'finish_products'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['sku']),
            models.Index(fields=['status']),
            models.Index(fields=['quality_check_status']),
            models.Index(fields=['-manufacturing_date']),
            models.Index(fields=['-created_at']),
        ]
    
    def __str__(self):
        return f"{self.sku} - {self.name} ({self.quantity_available} units)"
    
    def save(self, *args, **kwargs):
        """Calculate derived fields before saving"""
        self.total_value = self.quantity_available * self.unit_price
        super().save(*args, **kwargs)
    
    @property
    def total_quantity(self):
        """Total quantity (available + reserved)"""
        return self.quantity_available + self.quantity_reserved

# ==================== Agent Activity Tracking ====================

class AgentActivity(BaseModel):
    """
    Tracks real-time activity of AI agents for live monitoring dashboard.
    """
    AGENT_TYPES = [
        ('PLANNER', 'Strategic Planner'),
        ('INVENTORY', 'Inventory Monitor'),
        ('PROCUREMENT', 'Procurement Specialist'),
        ('COORDINATOR', 'Supply Chain Coordinator'),
    ]
    
    STATUS_CHOICES = [
        ('IDLE', 'Idle'),
        ('ANALYZING', 'Analyzing'),
        ('PROCESSING', 'Processing'),
        ('DECIDING', 'Deciding'),
        ('COMPLETED', 'Completed'),
        ('ERROR', 'Error'),
    ]
    
    agent_type = models.CharField(
        max_length=20,
        choices=AGENT_TYPES,
        help_text="Type of agent (Planner, Inventory, Procurement, Coordinator)"
    )
    
    agent_id = models.CharField(
        max_length=100,
        help_text="Unique identifier for the agent instance"
    )
    
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='IDLE',
        help_text="Current status of the agent"
    )
    
    activity_description = models.TextField(
        help_text="Human-readable description of what the agent is doing"
    )
    
    execution_id = models.CharField(
        max_length=100,
        blank=True,
        help_text="ID linking this activity to a specific crew execution"
    )
    
    goal = models.TextField(
        blank=True,
        help_text="The business goal the agent is working on"
    )
    
    metadata = models.JSONField(
        default=dict,
        help_text="Additional data (materials analyzed, vendors evaluated, etc.)"
    )
    
    agent_output = models.TextField(
        blank=True,
        null=True,
        help_text="The actual output/result from the agent's task execution"
    )
    
    started_at = models.DateTimeField(
        auto_now_add=True,
        help_text="When the agent started this activity"
    )
    
    completed_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text="When the agent completed this activity"
    )
    
    duration_seconds = models.FloatField(
        null=True,
        blank=True,
        help_text="How long the activity took in seconds"
    )
    
    class Meta:
        db_table = 'agent_activity'
        ordering = ['-started_at']
        verbose_name = 'Agent Activity'
        verbose_name_plural = 'Agent Activities'
        indexes = [
            models.Index(fields=['-started_at']),
            models.Index(fields=['agent_type', '-started_at']),
            models.Index(fields=['execution_id']),
        ]
    
    def __str__(self):
        return f"{self.get_agent_type_display()}: {self.activity_description[:50]}"

