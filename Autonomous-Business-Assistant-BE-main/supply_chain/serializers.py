"""
Serializers for Supply Chain Management API.
"""
from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from .models import RawMaterialInventory, Vendor, ProcurementDecision, Company, VendorQuotation, FinishProduct, CustomerOrder


class CompanySerializer(serializers.ModelSerializer):
    """Serializer for Company model."""

    class Meta:
        model = Company
        fields = [
            'id', 'name', 'address', 'location', 'business_type',
            'business_description', 'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']


# ==================== Authentication Serializers ====================

class UserSerializer(serializers.ModelSerializer):
    """Serializer for User model."""

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'is_active']
        read_only_fields = ['id', 'is_active']


class LoginSerializer(serializers.Serializer):
    """Serializer for user login."""
    email = serializers.EmailField(required=True)
    password = serializers.CharField(
        required=True, 
        write_only=True,
        min_length=6,
        help_text="User password (minimum 6 characters)"
    )
    
    def validate(self, data):
        """Validate email and password"""
        email = data.get('email')
        password = data.get('password')
        
        if not email or not password:
            raise serializers.ValidationError("Email and password are required.")
        
        # Find user by email
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            raise serializers.ValidationError("Invalid email or password.")
        
        # Authenticate using username
        authenticated_user = authenticate(username=user.username, password=password)
        
        if not authenticated_user:
            raise serializers.ValidationError("Invalid email or password.")
        
        data['user'] = authenticated_user
        return data


class LoginResponseSerializer(serializers.Serializer):
    """Serializer for login response."""
    user = UserSerializer(read_only=True)
    message = serializers.CharField(read_only=True)


class RegisterSerializer(serializers.ModelSerializer):
    """Serializer for user registration."""
    password = serializers.CharField(write_only=True, min_length=6, required=True)
    password2 = serializers.CharField(write_only=True, min_length=6, required=True)
    email = serializers.EmailField(required=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password2', 'first_name', 'last_name']
        extra_kwargs = {
            'first_name': {'required': False},
            'last_name': {'required': False}
        }

    def validate(self, data):
        """Validate passwords match"""
        if data['password'] != data.pop('password2'):
            raise serializers.ValidationError({"password": "Passwords do not match."})
        
        # Check if email already exists
        if User.objects.filter(email=data['email']).exists():
            raise serializers.ValidationError({"email": "Email already exists."})
        
        return data

    def create(self, validated_data):
        """Create new user"""
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
        )
        return user


class RawMaterialInventorySerializer(serializers.ModelSerializer):
    """Serializer for RawMaterialInventory model."""
    stock_percentage = serializers.FloatField(read_only=True)
    needs_reorder = serializers.BooleanField(read_only=True)

    class Meta:
        model = RawMaterialInventory
        fields = [
            'id', 'name', 'current_stock', 'max_capacity',
            'reorder_threshold_percentage', 'stock_percentage', 
            'needs_reorder', 'created_at', 'updated_at'
        ]
        read_only_fields = ['stock_percentage', 'needs_reorder', 'created_at', 'updated_at']


class VendorSerializer(serializers.ModelSerializer):
    """Serializer for Vendor model."""
    material_name = serializers.CharField(source='material_supply.name', read_only=True)

    class Meta:
        model = Vendor
        fields = [
            'id', 'name', 'material_supply', 'material_name', 'email', 'phone_number',
            'address', 'price_per_unit', 'lead_time_days', 'reliability_score', 
            'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['material_name', 'created_at', 'updated_at']


class VendorQuotationSerializer(serializers.ModelSerializer):
    """Serializer for VendorQuotation model."""
    vendor_name = serializers.CharField(source='vendor.name', read_only=True)
    material_name = serializers.CharField(source='raw_material.name', read_only=True)
    vendor_details = VendorSerializer(source='vendor', read_only=True)
    material_details = RawMaterialInventorySerializer(source='raw_material', read_only=True)

    class Meta:
        model = VendorQuotation
        fields = [
            'id', 'vendor', 'vendor_name', 'vendor_details', 'raw_material', 'material_name',
            'material_details', 'quantity', 'delivery_date', 'price_per_unit', 'total_price',
            'discount', 'discount_amount', 'final_price', 'ai_score', 'ai_analysis',
            'status', 'source', 'notes', 'created_at', 'updated_at'
        ]
        read_only_fields = ['vendor_name', 'material_name', 'vendor_details', 'material_details',
                           'discount_amount', 'final_price', 'ai_score', 'ai_analysis', 'created_at', 'updated_at']


class ProcurementDecisionSerializer(serializers.ModelSerializer):
    """Serializer for ProcurementDecision model."""
    raw_material = RawMaterialInventorySerializer(read_only=True)
    selected_vendor = VendorSerializer(read_only=True)

    class Meta:
        model = ProcurementDecision
        fields = [
            'id', 'raw_material', 'goal', 'selected_vendor', 'order_quantity',
            'expected_cost', 'confidence_score', 'explanation',
            'procurement_required', 'inventory_status', 'created_at'
        ]
        read_only_fields = ['created_at']


class RawMaterialReferenceField(serializers.ListField):
    """
    Custom field to handle raw materials referenced by primary key ID.
    Accepts multiple formats:
    
    Format 1 - List of IDs (simple):
        [1, 2, 3]
    
    Format 2 - List of dicts with just ID:
        [{"id": 1}, {"id": 2}]
    
    Format 3 - List of dicts with ID and quantity:
        [{"id": 1, "quantity": 200, "unit": "kg"}]
    
    Returns enriched format with ID and name:
        [{"id": 1, "name": "Steel Coils", "quantity": 200.0, "unit": "kg"}]
    """
    
    child = serializers.DictField()
    
    def to_internal_value(self, data):
        """Validate raw material IDs and enrich with material names"""
        result = []
        
        if not isinstance(data, list):
            raise serializers.ValidationError("raw_materials_used must be a list")
        
        for item in data:
            # Handle different input formats
            material_id = None
            quantity = None
            unit = 'kg'
            
            if isinstance(item, int):
                # Format: [1, 2, 3] - simple IDs
                material_id = item
            elif isinstance(item, dict):
                # Format: [{"id": 1, "quantity": 200}] or [{"id": 1}]
                if 'id' not in item:
                    raise serializers.ValidationError("Each material must have an 'id'")
                material_id = item['id']
                quantity = item.get('quantity')
                unit = item.get('unit', 'kg')
            else:
                raise serializers.ValidationError("Each raw material item must be an integer ID or a dictionary")
            
            # Validate material exists and get its name
            try:
                material = RawMaterialInventory.objects.get(id=material_id)
                material_item = {
                    'id': material.id,
                    'name': material.name,
                    'unit': unit
                }
                # Only include quantity if provided
                if quantity is not None:
                    material_item['quantity'] = float(quantity)
            except RawMaterialInventory.DoesNotExist:
                raise serializers.ValidationError(f"Raw material with ID {material_id} not found")
            
            result.append(material_item)
        
        return result
    
    def to_representation(self, data):
        """Return enriched format for API responses"""
        if not data:
            return []
        return data


class FinishProductSerializer(serializers.ModelSerializer):
    """Serializer for FinishProduct model with raw material reference handling."""
    total_quantity = serializers.DecimalField(
        read_only=True,
        max_digits=15,
        decimal_places=2
    )
    raw_materials_used = RawMaterialReferenceField(required=False)

    class Meta:
        model = FinishProduct
        fields = [
            'id', 'name', 'sku', 'description', 'quantity_available', 'quantity_reserved',
            'total_quantity', 'unit_price', 'total_value', 'raw_materials_used',
            'manufacturing_date', 'expiry_date', 'warehouse_location', 'status',
            'quality_check_status', 'quality_check_notes', 'batch_number',
            'supplier_batch_number', 'notes', 'created_at', 'updated_at'
        ]
        read_only_fields = ['total_quantity', 'total_value', 'created_at', 'updated_at']


class CustomerOrderSerializer(serializers.ModelSerializer):
    """Serializer for CustomerOrder model."""
    company_name = serializers.CharField(source='company.name', read_only=True)
    
    class Meta:
        model = CustomerOrder
        fields = [
            'id', 'order_number', 'customer_name', 'customer_email',
            'shipping_address', 'status', 'priority', 'required_delivery_date',
            'total_amount', 'company', 'company_name', 'assigned_to_agent',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['order_number', 'company_name', 'created_at', 'updated_at']


class GoalExecutionRequestSerializer(serializers.Serializer):
    """Serializer for goal execution request."""
    goal = serializers.CharField(
        required=True,
        allow_blank=False,
        help_text="The goal to execute (e.g., 'Ensure uninterrupted production by restocking raw materials efficiently')"
    )


class GoalExecutionResponseSerializer(serializers.Serializer):
    """Serializer for goal execution response."""
    goal = serializers.CharField()
    inventory_status = serializers.JSONField()
    procurement_required = serializers.BooleanField()
    selected_vendor = serializers.JSONField()
    order_quantity = serializers.DecimalField(max_digits=15, decimal_places=2)
    expected_cost = serializers.DecimalField(max_digits=15, decimal_places=2)
    confidence_score = serializers.DecimalField(max_digits=5, decimal_places=2)
    explanation = serializers.CharField()
