"""
API Views for Supply Chain Management.
Thin views that delegate to service layer and crew orchestration.
"""
import logging
from rest_framework import status, serializers
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from rest_framework.permissions import AllowAny
from drf_spectacular.utils import extend_schema

from supply_chain.serializers import (
    GoalExecutionRequestSerializer,
    GoalExecutionResponseSerializer,
    CompanySerializer,
    LoginSerializer,
    LoginResponseSerializer,
    RegisterSerializer,
    UserSerializer,
    RawMaterialInventorySerializer,
    VendorSerializer,
    VendorQuotationSerializer,
    FinishProductSerializer,
    CustomerOrderSerializer
)
from supply_chain.models import Company, RawMaterialInventory, VendorQuotation, Vendor, FinishProduct, CustomerOrder
from supply_chain.crew import SupplyChainCrew

logger = logging.getLogger(__name__)


@extend_schema(
    request=GoalExecutionRequestSerializer,
    responses={200: GoalExecutionResponseSerializer},
    description="Execute a goal-driven supply chain workflow with multi-agent AI system"
)
@api_view(['POST'])
def execute_goal(request):
    """
    Execute a goal-driven supply chain management workflow.
    
    This endpoint triggers the multi-agent CrewAI system to:
    1. Analyze the provided goal
    2. Monitor inventory levels
    3. Identify materials below reorder threshold (25%)
    4. Evaluate available vendors
    5. Select optimal vendor using weighted scoring
    6. Produce an explainable procurement decision
    
    Request Body:
        {
            "goal": "Ensure uninterrupted production by restocking raw materials efficiently"
        }
    
    Response:
        {
            "goal": "...",
            "inventory_status": {...},
            "procurement_required": true/false,
            "selected_vendor": {...} or null,
            "order_quantity": number,
            "expected_cost": number,
            "confidence_score": number,
            "explanation": "..."
        }
    """
    logger.info("Received execute-goal request")
    
    # Validate request
    serializer = GoalExecutionRequestSerializer(data=request.data)
    if not serializer.is_valid():
        logger.warning(f"Invalid request: {serializer.errors}")
        return Response(
            {'error': 'Invalid request', 'details': serializer.errors},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    goal = serializer.validated_data['goal']
    logger.info(f"Executing goal: {goal}")
    
    try:
        # Create crew and execute workflow
        crew = SupplyChainCrew()
        result = crew.execute(goal)
        
        logger.info("Goal execution completed successfully")
        
        # Return result
        return Response(result, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Error executing goal: {str(e)}", exc_info=True)
        return Response(
            {
                'error': 'Internal server error during goal execution',
                'message': str(e),
                'goal': goal,
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    """
    Health check endpoint.
    
    Returns system status and basic information.
    """
    return Response({
        'status': 'healthy',
        'service': 'Supply Chain Management API',
        'version': '1.0.0',
    }, status=status.HTTP_200_OK)


@api_view(['GET'])
def system_status(request):
    """
    Get system status including inventory summary.
    
    Provides a quick overview of:
    - Total inventory items
    - Items needing reorder
    - Recent decisions
    """
    try:
        from supply_chain.services.data_fetcher import DataFetcher
        from supply_chain.services.decision_memory import DecisionMemory
        
        # Get inventory summary
        all_inventory = DataFetcher.get_all_inventory()
        low_stock = [inv for inv in all_inventory if inv['needs_reorder']]
        
        # Get recent decisions
        recent_decisions = DecisionMemory.get_recent_decisions(limit=5)
        
        # Get learning insights
        insights = DecisionMemory.get_learning_insights()
        
        return Response({
            'status': 'operational',
            'inventory_summary': {
                'total_items': len(all_inventory),
                'items_needing_reorder': len(low_stock),
                'low_stock_materials': [
                    {
                        'name': item['raw_material_name'],
                        'sku': item['raw_material_sku'],
                        'stock_percentage': round(item['stock_percentage'], 2),
                    }
                    for item in low_stock
                ],
            },
            'recent_decisions_count': len(recent_decisions),
            'learning_insights': insights,
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Error getting system status: {str(e)}", exc_info=True)
        return Response(
            {'error': 'Error retrieving system status', 'message': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


# ==================== Authentication APIs ====================

@extend_schema(
    request=LoginSerializer,
    responses={200: LoginResponseSerializer},
    description="User login with email and password"
)
@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    """
    User login endpoint.
    
    Authenticates user with email and password, returns user details and token.
    
    Request Body:
        {
            "email": "user@example.com",
            "password": "password123"
        }
    
    Response:
        {
            "user": {
                "id": 1,
                "username": "john_doe",
                "email": "user@example.com",
                "first_name": "John",
                "last_name": "Doe",
                "is_active": true
            },
            "message": "Login successful"
        }
    """
    try:
        serializer = LoginSerializer(data=request.data)
        if not serializer.is_valid():
            logger.warning(f"Invalid login attempt: {serializer.errors}")
            return Response(
                {'error': 'Invalid credentials', 'details': serializer.errors},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        user = serializer.validated_data['user']
        logger.info(f"User logged in: {user.email}")
        
        # Get or create token for the user
        token, created = Token.objects.get_or_create(user=user)
        
        response_data = {
            'user': UserSerializer(user).data,
            'token': token.key,
            'message': 'Login successful'
        }
        
        return Response(response_data, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Error during login: {str(e)}", exc_info=True)
        return Response(
            {'error': 'Error during login', 'message': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@extend_schema(
    request=RegisterSerializer,
    responses={201: UserSerializer},
    description="Register a new user account"
)
@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    """
    User registration endpoint.
    
    Creates a new user account with email, username, and password.
    
    Request Body:
        {
            "username": "john_doe",
            "email": "user@example.com",
            "password": "password123",
            "password2": "password123",
            "first_name": "John",
            "last_name": "Doe"
        }
    
    Response:
        {
            "id": 1,
            "username": "john_doe",
            "email": "user@example.com",
            "first_name": "John",
            "last_name": "Doe",
            "is_active": true
        }
    """
    try:
        serializer = RegisterSerializer(data=request.data)
        if not serializer.is_valid():
            logger.warning(f"Invalid registration data: {serializer.errors}")
            return Response(
                {'error': 'Invalid registration data', 'details': serializer.errors},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        user = serializer.save()
        logger.info(f"New user registered: {user.email}")
        
        # Create token for the new user
        token, created = Token.objects.get_or_create(user=user)
        
        response_data = {
            **UserSerializer(user).data,
            'token': token.key,
            'message': 'Registration successful'
        }
        
        return Response(response_data, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        logger.error(f"Error during registration: {str(e)}", exc_info=True)
        return Response(
            {'error': 'Error during registration', 'message': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([AllowAny])
def logout(request):
    """
    User logout endpoint.
    
    Deletes the authentication token for the user.
    
    Response:
        {
            "message": "Logout successful"
        }
    """
    try:
        # Delete token if it exists
        if hasattr(request.user, 'auth_token'):
            request.user.auth_token.delete()
            logger.info(f"User logged out: {request.user.email}")
            return Response(
                {'message': 'Logout successful'},
                status=status.HTTP_200_OK
            )
        else:
            return Response(
                {'message': 'No active token found'},
                status=status.HTTP_200_OK
            )
    except Exception as e:
        logger.error(f"Error during logout: {str(e)}", exc_info=True)
        return Response(
            {'error': 'Error during logout', 'message': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )




@extend_schema(
    responses={200: CompanySerializer(many=True)},
    description="Get all companies"
)
@api_view(['GET'])
def get_companies(request):
    """
    Get all companies.
    
    Returns a list of all active companies in the system.
    """
    try:
        companies = Company.objects.all()
        serializer = CompanySerializer(companies, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Exception as e:
        logger.error(f"Error fetching companies: {str(e)}", exc_info=True)
        return Response(
            {'error': 'Error fetching companies', 'message': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@extend_schema(
    responses={200: CompanySerializer},
    description="Get a specific company by ID"
)
@api_view(['GET'])
def get_company(request, company_id):
    """
    Get a specific company by ID.
    
    Args:
        company_id: The ID of the company to retrieve
    
    Response:
        {
            "id": 1,
            "name": "ABC Manufacturing",
            "address": "123 Main St",
            "location": "New York",
            "business_type": "MANUFACTURING",
            "business_description": "...",
            "is_active": true,
            "created_at": "2026-02-21T10:00:00Z",
            "updated_at": "2026-02-21T10:00:00Z"
        }
    """
    try:
        company = Company.objects.get(id=company_id)
        serializer = CompanySerializer(company)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Company.DoesNotExist:
        logger.warning(f"Company with ID {company_id} not found")
        return Response(
            {'error': 'Company not found', 'id': company_id},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        logger.error(f"Error fetching company: {str(e)}", exc_info=True)
        return Response(
            {'error': 'Error fetching company', 'message': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@extend_schema(
    request=CompanySerializer,
    responses={201: CompanySerializer},
    description="Create a new company"
)
@api_view(['POST'])
def create_company(request):
    """
    Create a new company.
    
    Request Body:
        {
            "name": "ABC Manufacturing",
            "address": "123 Main St",
            "location": "New York",
            "business_type": "MANUFACTURING",
            "business_description": "Automotive parts manufacturing",
            "is_active": true
        }
    
    Response:
        {
            "id": 1,
            "name": "ABC Manufacturing",
            "address": "123 Main St",
            "location": "New York",
            "business_type": "MANUFACTURING",
            "business_description": "Automotive parts manufacturing",
            "is_active": true,
            "created_at": "2026-02-21T10:00:00Z",
            "updated_at": "2026-02-21T10:00:00Z"
        }
    """
    try:
        serializer = CompanySerializer(data=request.data)
        if not serializer.is_valid():
            logger.warning(f"Invalid company data: {serializer.errors}")
            return Response(
                {'error': 'Invalid company data', 'details': serializer.errors},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        company = serializer.save()
        logger.info(f"Company created: {company.name} (ID: {company.id})")
        return Response(
            CompanySerializer(company).data,
            status=status.HTTP_201_CREATED
        )
    except Exception as e:
        logger.error(f"Error creating company: {str(e)}", exc_info=True)
        return Response(
            {'error': 'Error creating company', 'message': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


# ==================== Raw Material Inventory APIs ====================

@extend_schema(
    responses={200: RawMaterialInventorySerializer(many=True)},
    description="Get all raw materials inventory"
)
@api_view(['GET'])
def get_inventories(request):
    """
    Get all raw materials in inventory.
    
    Returns a list of all raw materials with their current stock levels,
    capacity, and reorder status.
    
    Response:
        [
            {
                "id": 1,
                "name": "Steel Coils",
                "current_stock": 500.00,
                "max_capacity": 1000.00,
                "reorder_threshold_percentage": 25.00,
                "stock_percentage": 50.00,
                "needs_reorder": false,
                "created_at": "2026-02-21T10:00:00Z",
                "updated_at": "2026-02-21T10:00:00Z"
            },
            ...
        ]
    """
    try:
        inventories = RawMaterialInventory.objects.all()
        serializer = RawMaterialInventorySerializer(inventories, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Exception as e:
        logger.error(f"Error fetching inventories: {str(e)}", exc_info=True)
        return Response(
            {'error': 'Error fetching inventories', 'message': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@extend_schema(
    responses={200: RawMaterialInventorySerializer},
    description="Get a specific raw material by ID"
)
@api_view(['GET'])
def get_inventory(request, inventory_id):
    """
    Get a specific raw material by ID.
    
    Args:
        inventory_id: The ID of the raw material to retrieve
    
    Response:
        {
            "id": 1,
            "name": "Steel Coils",
            "current_stock": 500.00,
            "max_capacity": 1000.00,
            "reorder_threshold_percentage": 25.00,
            "stock_percentage": 50.00,
            "needs_reorder": false,
            "created_at": "2026-02-21T10:00:00Z",
            "updated_at": "2026-02-21T10:00:00Z"
        }
    """
    try:
        inventory = RawMaterialInventory.objects.get(id=inventory_id)
        serializer = RawMaterialInventorySerializer(inventory)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except RawMaterialInventory.DoesNotExist:
        logger.warning(f"Raw material inventory with ID {inventory_id} not found")
        return Response(
            {'error': 'Inventory not found', 'id': inventory_id},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        logger.error(f"Error fetching inventory: {str(e)}", exc_info=True)
        return Response(
            {'error': 'Error fetching inventory', 'message': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@extend_schema(
    responses={200: serializers.ListSerializer(child=serializers.DictField())},
    description="Get available raw materials for dropdown selection"
)
@api_view(['GET'])
def raw_materials_dropdown(request):
    """
    Get list of all raw materials for UI dropdown selection.
    
    Used when creating finish products to select which raw materials are used.
    
    Response:
        [
            {
                "id": 1,
                "name": "Steel Coils"
            },
            {
                "id": 2,
                "name": "Nickel Alloy"
            },
            ...
        ]
    """
    try:
        materials = RawMaterialInventory.objects.all().values('id', 'name').order_by('name')
        data = list(materials)
        return Response(data, status=status.HTTP_200_OK)
    except Exception as e:
        logger.error(f"Error fetching raw materials dropdown: {str(e)}", exc_info=True)
        return Response(
            {'error': 'Error fetching raw materials', 'message': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@extend_schema(
    request=RawMaterialInventorySerializer,
    responses={201: RawMaterialInventorySerializer},
    description="Create a new raw material inventory"
)
@api_view(['POST'])
def create_inventory(request):
    """
    Create a new raw material inventory entry.
    
    Request Body:
        {
            "name": "Steel Coils",
            "current_stock": 500.00,
            "max_capacity": 1000.00,
            "reorder_threshold_percentage": 25.00
        }
    
    Response:
        {
            "id": 1,
            "name": "Steel Coils",
            "current_stock": 500.00,
            "max_capacity": 1000.00,
            "reorder_threshold_percentage": 25.00,
            "stock_percentage": 50.00,
            "needs_reorder": false,
            "created_at": "2026-02-21T10:00:00Z",
            "updated_at": "2026-02-21T10:00:00Z"
        }
    """
    try:
        serializer = RawMaterialInventorySerializer(data=request.data)
        if not serializer.is_valid():
            logger.warning(f"Invalid inventory data: {serializer.errors}")
            return Response(
                {'error': 'Invalid inventory data', 'details': serializer.errors},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        inventory = serializer.save()
        logger.info(f"Raw material inventory created: {inventory.name} (ID: {inventory.id})")
        return Response(
            RawMaterialInventorySerializer(inventory).data,
            status=status.HTTP_201_CREATED
        )
    except Exception as e:
        logger.error(f"Error creating inventory: {str(e)}", exc_info=True)
        return Response(
            {'error': 'Error creating inventory', 'message': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

# ==================== Vendor Quotation APIs ====================

@extend_schema(
    responses={200: VendorQuotationSerializer(many=True)},
    description="Get all vendor quotations"
)
@api_view(['GET'])
def get_quotations(request):
    """
    Get all vendor quotations.
    
    Returns a list of all quotations received from vendors,
    with AI analysis and scoring.
    
    Query Parameters:
        - status: Filter by status (pending, analyzing, reviewed, approved, rejected)
        - vendor_id: Filter by vendor ID
        - material_id: Filter by raw material ID
        - ordering: Sort by field (default: -created_at)
    
    Response:
        [
            {
                "id": 1,
                "vendor": 1,
                "vendor_name": "SteelCo Ltd.",
                "raw_material": 1,
                "material_name": "Steel Coils",
                "quantity": 500.00,
                "delivery_date": "2026-03-15",
                "price_per_unit": 45.00,
                "total_price": 22500.00,
                "discount": 5.00,
                "discount_amount": 1125.00,
                "final_price": 21375.00,
                "ai_score": 87.9,
                "status": "reviewed",
                "created_at": "2026-02-21T10:00:00Z"
            },
            ...
        ]
    """
    try:
        quotations = VendorQuotation.objects.all()
        
        # Filter by status
        status_filter = request.query_params.get('status', None)
        if status_filter:
            quotations = quotations.filter(status=status_filter)
        
        # Filter by vendor
        vendor_id = request.query_params.get('vendor_id', None)
        if vendor_id:
            quotations = quotations.filter(vendor_id=vendor_id)
        
        # Filter by material
        material_id = request.query_params.get('material_id', None)
        if material_id:
            quotations = quotations.filter(raw_material_id=material_id)
        
        serializer = VendorQuotationSerializer(quotations, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Exception as e:
        logger.error(f"Error fetching quotations: {str(e)}", exc_info=True)
        return Response(
            {'error': 'Error fetching quotations', 'message': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@extend_schema(
    responses={200: VendorQuotationSerializer},
    description="Get a specific vendor quotation by ID"
)
@api_view(['GET'])
def get_quotation(request, quotation_id):
    """
    Get a specific vendor quotation by ID.
    
    Args:
        quotation_id: The ID of the quotation to retrieve
    
    Response:
        {
            "id": 1,
            "vendor": 1,
            "vendor_name": "SteelCo Ltd.",
            "vendor_details": {...},
            "raw_material": 1,
            "material_name": "Steel Coils",
            "material_details": {...},
            "quantity": 500.00,
            "delivery_date": "2026-03-15",
            "price_per_unit": 45.00,
            "total_price": 22500.00,
            "discount": 5.00,
            "discount_amount": 1125.00,
            "final_price": 21375.00,
            "ai_score": 87.9,
            "ai_analysis": {
                "delivery_score": 88,
                "price_score": 82,
                "rating_score": 96,
                "recommendation": "APPROVED"
            },
            "status": "reviewed",
            "source": "email",
            "notes": "Received via vendor email",
            "created_at": "2026-02-21T10:00:00Z",
            "updated_at": "2026-02-21T10:00:00Z"
        }
    """
    try:
        quotation = VendorQuotation.objects.get(id=quotation_id)
        serializer = VendorQuotationSerializer(quotation)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except VendorQuotation.DoesNotExist:
        logger.warning(f"Quotation with ID {quotation_id} not found")
        return Response(
            {'error': 'Quotation not found', 'id': quotation_id},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        logger.error(f"Error fetching quotation: {str(e)}", exc_info=True)
        return Response(
            {'error': 'Error fetching quotation', 'message': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@extend_schema(
    request=VendorQuotationSerializer,
    responses={201: VendorQuotationSerializer},
    description="Create a new vendor quotation"
)
@api_view(['POST'])
def create_quotation(request):
    """
    Create a new vendor quotation.
    
    This can be called when:
    1. Email parser extracts quotation data
    2. Vendor submits quotation via API
    3. Manual quotation entry
    
    Request Body:
        {
            "vendor": 1,
            "raw_material": 1,
            "quantity": 500.00,
            "delivery_date": "2026-03-15",
            "price_per_unit": 45.00,
            "total_price": 22500.00,
            "discount": 5.00,
            "source": "email",
            "notes": "Received from vendor quotation email"
        }
    
    Response:
        {
            "id": 1,
            "vendor": 1,
            "vendor_name": "SteelCo Ltd.",
            "raw_material": 1,
            "material_name": "Steel Coils",
            "quantity": 500.00,
            "delivery_date": "2026-03-15",
            "price_per_unit": 45.00,
            "total_price": 22500.00,
            "discount": 5.00,
            "discount_amount": 1125.00,
            "final_price": 21375.00,
            "ai_score": 0.00,
            "status": "pending",
            "created_at": "2026-02-21T10:00:00Z",
            "updated_at": "2026-02-21T10:00:00Z"
        }
    """
    try:
        serializer = VendorQuotationSerializer(data=request.data)
        if not serializer.is_valid():
            logger.warning(f"Invalid quotation data: {serializer.errors}")
            return Response(
                {'error': 'Invalid quotation data', 'details': serializer.errors},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        quotation = serializer.save()
        logger.info(f"Vendor quotation created: From {quotation.vendor.name} for {quotation.raw_material.name} (ID: {quotation.id})")
        return Response(
            VendorQuotationSerializer(quotation).data,
            status=status.HTTP_201_CREATED
        )
    except Exception as e:
        logger.error(f"Error creating quotation: {str(e)}", exc_info=True)
        return Response(
            {'error': 'Error creating quotation', 'message': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@extend_schema(
    request=VendorQuotationSerializer,
    responses={200: VendorQuotationSerializer},
    description="Update a vendor quotation with AI analysis"
)
@api_view(['PUT'])
def update_quotation(request, quotation_id):
    """
    Update a vendor quotation, typically with AI analysis results.
    
    Used for:
    1. Adding AI analysis scores
    2. Updating status after agent review
    3. Adding notes and recommendations
    
    Args:
        quotation_id: The ID of the quotation to update
    
    Request Body:
        {
            "ai_score": 87.9,
            "ai_analysis": {
                "delivery_score": 88,
                "delivery_weight": 0.4,
                "price_score": 82,
                "price_weight": 0.35,
                "rating_score": 96,
                "rating_weight": 0.25,
                "final_score": 87.9,
                "recommendation": "APPROVED"
            },
            "status": "reviewed",
            "notes": "Agent analysis complete - Recommended for procurement"
        }
    
    Response:
        {
            "id": 1,
            "vendor": 1,
            "ai_score": 87.9,
            "status": "reviewed",
            "notes": "Agent analysis complete - Recommended for procurement"
        }
    """
    try:
        quotation = VendorQuotation.objects.get(id=quotation_id)
        serializer = VendorQuotationSerializer(quotation, data=request.data, partial=True)
        
        if not serializer.is_valid():
            logger.warning(f"Invalid quotation update data: {serializer.errors}")
            return Response(
                {'error': 'Invalid update data', 'details': serializer.errors},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        quotation = serializer.save()
        logger.info(f"Quotation updated (ID: {quotation.id}) - Status: {quotation.status}, AI Score: {quotation.ai_score}")
        return Response(
            VendorQuotationSerializer(quotation).data,
            status=status.HTTP_200_OK
        )
    except VendorQuotation.DoesNotExist:
        logger.warning(f"Quotation with ID {quotation_id} not found")
        return Response(
            {'error': 'Quotation not found', 'id': quotation_id},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        logger.error(f"Error updating quotation: {str(e)}", exc_info=True)
        return Response(
            {'error': 'Error updating quotation', 'message': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


# ==================== Vendor Management APIs ====================

@extend_schema(
    responses={200: VendorSerializer(many=True)},
    description="Get all vendors"
)
@api_view(['GET'])
def get_vendors(request):
    """
    Get all vendors in the system.
    
    Returns a list of all vendors with their contact info,
    pricing, lead times, and reliability scores.
    
    Query Parameters:
        - is_active: Filter by active status (true/false)
        - material_id: Filter by raw material ID
        - ordering: Sort by field (default: -created_at)
    
    Response:
        [
            {
                "id": 1,
                "name": "SteelCo Ltd.",
                "material_supply": 1,
                "material_name": "Steel Coils",
                "email": "steelco@vendor.in",
                "phone_number": "+91-9876543210",
                "address": "123 Industrial Park, Mumbai",
                "price_per_unit": 45.00,
                "lead_time_days": 4,
                "reliability_score": 87.9,
                "is_active": true,
                "created_at": "2026-02-21T10:00:00Z",
                "updated_at": "2026-02-21T10:00:00Z"
            },
            ...
        ]
    """
    try:
        vendors = Vendor.objects.all()
        
        # Filter by active status
        is_active = request.query_params.get('is_active', None)
        if is_active is not None:
            is_active_bool = is_active.lower() == 'true'
            vendors = vendors.filter(is_active=is_active_bool)
        
        # Filter by material
        material_id = request.query_params.get('material_id', None)
        if material_id:
            vendors = vendors.filter(material_supply_id=material_id)
        
        serializer = VendorSerializer(vendors, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Exception as e:
        logger.error(f"Error fetching vendors: {str(e)}", exc_info=True)
        return Response(
            {'error': 'Error fetching vendors', 'message': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@extend_schema(
    responses={200: VendorSerializer},
    description="Get a specific vendor by ID"
)
@api_view(['GET'])
def get_vendor(request, vendor_id):
    """
    Get a specific vendor by ID.
    
    Args:
        vendor_id: The ID of the vendor to retrieve
    
    Response:
        {
            "id": 1,
            "name": "SteelCo Ltd.",
            "material_supply": 1,
            "material_name": "Steel Coils",
            "email": "steelco@vendor.in",
            "phone_number": "+91-9876543210",
            "address": "123 Industrial Park, Mumbai",
            "price_per_unit": 45.00,
            "lead_time_days": 4,
            "reliability_score": 87.9,
            "is_active": true,
            "created_at": "2026-02-21T10:00:00Z",
            "updated_at": "2026-02-21T10:00:00Z"
        }
    """
    try:
        vendor = Vendor.objects.get(id=vendor_id)
        serializer = VendorSerializer(vendor)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Vendor.DoesNotExist:
        logger.warning(f"Vendor with ID {vendor_id} not found")
        return Response(
            {'error': 'Vendor not found', 'id': vendor_id},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        logger.error(f"Error fetching vendor: {str(e)}", exc_info=True)
        return Response(
            {'error': 'Error fetching vendor', 'message': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@extend_schema(
    request=VendorSerializer,
    responses={201: VendorSerializer},
    description="Create a new vendor"
)
@api_view(['POST'])
def create_vendor(request):
    """
    Create a new vendor.
    
    Request Body:
        {
            "name": "SteelCo Ltd.",
            "material_supply": 1,
            "email": "steelco@vendor.in",
            "phone_number": "+91-9876543210",
            "address": "123 Industrial Park, Mumbai",
            "price_per_unit": 45.00,
            "lead_time_days": 4,
            "reliability_score": 87.9,
            "is_active": true
        }
    
    Response:
        {
            "id": 1,
            "name": "SteelCo Ltd.",
            "material_supply": 1,
            "material_name": "Steel Coils",
            "email": "steelco@vendor.in",
            "phone_number": "+91-9876543210",
            "address": "123 Industrial Park, Mumbai",
            "price_per_unit": 45.00,
            "lead_time_days": 4,
            "reliability_score": 87.9,
            "is_active": true,
            "created_at": "2026-02-21T10:00:00Z",
            "updated_at": "2026-02-21T10:00:00Z"
        }
    """
    try:
        serializer = VendorSerializer(data=request.data)
        if not serializer.is_valid():
            logger.warning(f"Invalid vendor data: {serializer.errors}")
            return Response(
                {'error': 'Invalid vendor data', 'details': serializer.errors},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        vendor = serializer.save()
        logger.info(f"Vendor created: {vendor.name} (ID: {vendor.id})")
        return Response(
            VendorSerializer(vendor).data,
            status=status.HTTP_201_CREATED
        )
    except Exception as e:
        logger.error(f"Error creating vendor: {str(e)}", exc_info=True)
        return Response(
            {'error': 'Error creating vendor', 'message': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


# ==================== Finish Product APIs ====================

@extend_schema(
    responses={200: FinishProductSerializer(many=True)},
    description="Get all finished products"
)
@api_view(['GET'])
def get_finish_products(request):
    """
    Get all finished products.
    
    Returns a list of all manufactured products ready for sale/delivery
    with inventory and quality status.
    
    Query Parameters:
        - status: Filter by status (ready, reserved, sold, returned, quality_hold)
        - quality_check_status: Filter by QC status (passed, failed, pending, rework)
        - sku: Search by product SKU
        - ordering: Sort by field (default: -created_at)
    
    Response:
        [
            {
                "id": 1,
                "name": "Steel Engineered Component",
                "sku": "SEC-2026-001",
                "description": "High-grade steel component",
                "quantity_available": 150.00,
                "quantity_reserved": 25.00,
                "total_quantity": 175.00,
                "unit_price": 125.50,
                "total_value": 18825.00,
                "raw_materials_used": [
                    {"id": 1, "name": "Steel Coils", "quantity": 200.0, "unit": "kg"},
                    {"id": 2, "name": "Nickel Alloy", "quantity": 50.0, "unit": "kg"}
                ],
                "manufacturing_date": "2026-02-20",
                "expiry_date": "2027-02-20",
                "status": "ready",
                "quality_check_status": "passed",
                "batch_number": "BATCH-2026-FEB-001",
                "created_at": "2026-02-21T10:00:00Z",
                "updated_at": "2026-02-21T10:00:00Z"
            },
            ...
        ]
    """
    try:
        products = FinishProduct.objects.all()
        
        # Filter by status
        status_filter = request.query_params.get('status', None)
        if status_filter:
            products = products.filter(status=status_filter)
        
        # Filter by quality check status
        qc_filter = request.query_params.get('quality_check_status', None)
        if qc_filter:
            products = products.filter(quality_check_status=qc_filter)
        
        # Search by SKU
        sku_search = request.query_params.get('sku', None)
        if sku_search:
            products = products.filter(sku__icontains=sku_search)
        
        serializer = FinishProductSerializer(products, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Exception as e:
        logger.error(f"Error fetching finish products: {str(e)}", exc_info=True)
        return Response(
            {'error': 'Error fetching finish products', 'message': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@extend_schema(
    responses={200: FinishProductSerializer},
    description="Get a specific finished product by ID"
)
@api_view(['GET'])
def get_finish_product(request, product_id):
    """
    Get a specific finished product by ID.
    
    Args:
        product_id: The ID of the product to retrieve
    
    Response:
        {
            "id": 1,
            "name": "Steel Engineered Component",
            "sku": "SEC-2026-001",
            "description": "High-grade steel component",
            "quantity_available": 150.00,
            "quantity_reserved": 25.00,
            "total_quantity": 175.00,
            "unit_price": 125.50,
            "total_value": 18825.00,
            "raw_materials_used": [
                {"id": 1, "name": "Steel Coils", "quantity": 200.0, "unit": "kg"},
                {"id": 2, "name": "Nickel Alloy", "quantity": 50.0, "unit": "kg"}
            ],
            "manufacturing_date": "2026-02-20",
            "expiry_date": "2027-02-20",
            "status": "ready",
            "quality_check_status": "passed",
            "quality_check_notes": "All tests passed",
            "batch_number": "BATCH-2026-FEB-001",
            "supplier_batch_number": "SUP-12345",
            "notes": "Production complete",
            "created_at": "2026-02-21T10:00:00Z",
            "updated_at": "2026-02-21T10:00:00Z"
        }
    """
    try:
        product = FinishProduct.objects.get(id=product_id)
        serializer = FinishProductSerializer(product)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except FinishProduct.DoesNotExist:
        logger.warning(f"Finish product with ID {product_id} not found")
        return Response(
            {'error': 'Finish product not found', 'id': product_id},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        logger.error(f"Error fetching finish product: {str(e)}", exc_info=True)
        return Response(
            {'error': 'Error fetching finish product', 'message': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@extend_schema(
    request=FinishProductSerializer,
    responses={201: FinishProductSerializer},
    description="Create a new finished product"
)
@api_view(['POST'])
def create_finish_product(request):
    """
    Create a new finished product record.
    
    Called when products complete manufacturing and are ready for inventory.
    Supply raw material IDs (get available materials from /api/raw-materials-dropdown/).
    
    Request Body (Format 1 - Simple IDs):
        {
            "name": "Aluminium Component",
            "sku": "SC-002",
            "quantity_available": 150.00,
            "unit_price": 125.50,
            "raw_materials_used": [1, 2],
            "manufacturing_date": "2026-02-20"
        }
    
    Request Body (Format 2 - IDs only in dict):
        {
            "name": "Steel Component",
            "sku": "SC-001",
            "quantity_available": 150.00,
            "unit_price": 125.50,
            "raw_materials_used": [{"id": 1}, {"id": 2}],
            "manufacturing_date": "2026-02-20"
        }
    
    Request Body (Format 3 - With quantities and units):
        {
            "name": "Steel Engineered Component",
            "sku": "SEC-2026-001",
            "quantity_available": 150.00,
            "unit_price": 125.50,
            "raw_materials_used": [
                {"id": 1, "quantity": 200.00, "unit": "kg"},
                {"id": 2, "quantity": 50.00, "unit": "kg"}
            ],
            "manufacturing_date": "2026-02-20",
            "batch_number": "BATCH-2026-FEB-001"
        }
    
    Response (raw materials enriched with ID and name):
        {
            "id": 1,
            "name": "Steel Engineered Component",
            "sku": "SEC-2026-001",
            "quantity_available": 150.00,
            "unit_price": 125.50,
            "total_value": 18825.00,
            "raw_materials_used": [
                {"id": 1, "name": "Steel Coils", "quantity": 200.0, "unit": "kg"},
                {"id": 2, "name": "Nickel Alloy", "quantity": 50.0, "unit": "kg"}
            ],
            "created_at": "2026-02-21T10:00:00Z",
            "updated_at": "2026-02-21T10:00:00Z"
        }
    """
    try:
        serializer = FinishProductSerializer(data=request.data)
        if not serializer.is_valid():
            logger.warning(f"Invalid finish product data: {serializer.errors}")
            return Response(
                {'error': 'Invalid finish product data', 'details': serializer.errors},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        product = serializer.save()
        logger.info(f"Finish product created: {product.name} (SKU: {product.sku}, ID: {product.id})")
        return Response(
            FinishProductSerializer(product).data,
            status=status.HTTP_201_CREATED
        )
    except Exception as e:
        logger.error(f"Error creating finish product: {str(e)}", exc_info=True)
        return Response(
            {'error': 'Error creating finish product', 'message': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@extend_schema(
    request=FinishProductSerializer,
    responses={200: FinishProductSerializer},
    description="Update a finished product"
)
@api_view(['PUT'])
def update_finish_product(request, product_id):
    """
    Update an existing finished product.
    
    Used for:
    1. Updating inventory (quantity_available, quantity_reserved)
    2. Updating status (after sale, return, etc.)
    3. Adding QC results
    4. Updating warehouse location
    
    Args:
        product_id: The ID of the product to update
    
    Request Body (partial update):
        {
            "quantity_available": 145.00,
            "quantity_reserved": 30.00,
            "status": "reserved",
            "quality_check_status": "passed",
            "quality_check_notes": "All inspections completed successfully"
        }
    
    Response:
        {
            "id": 1,
            "name": "Steel Engineered Component",
            "sku": "SEC-2026-001",
            "quantity_available": 145.00,
            "quantity_reserved": 30.00,
            "status": "reserved",
            "quality_check_status": "passed",
            "updated_at": "2026-02-21T11:30:00Z"
        }
    """
    try:
        product = FinishProduct.objects.get(id=product_id)
        serializer = FinishProductSerializer(product, data=request.data, partial=True)
        
        if not serializer.is_valid():
            logger.warning(f"Invalid finish product update data: {serializer.errors}")
            return Response(
                {'error': 'Invalid update data', 'details': serializer.errors},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        product = serializer.save()
        logger.info(f"Finish product updated (ID: {product.id}, SKU: {product.sku})")
        return Response(
            FinishProductSerializer(product).data,
            status=status.HTTP_200_OK
        )
    except FinishProduct.DoesNotExist:
        logger.warning(f"Finish product with ID {product_id} not found")
        return Response(
            {'error': 'Finish product not found', 'id': product_id},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        logger.error(f"Error updating finish product: {str(e)}", exc_info=True)
        return Response(
            {'error': 'Error updating finish product', 'message': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


# ==================== CUSTOMER ORDER ENDPOINTS ====================

@extend_schema(
    responses={200: serializers.ListSerializer(child=CustomerOrderSerializer())},
    description="Get all customer orders with optional filters"
)
@api_view(['GET'])
def get_customer_orders(request):
    """
    Get all customer orders with optional filters for status, priority, etc.
    
    Query Parameters:
    - status: Filter by order status (PENDING, CONFIRMED, PROCESSING, READY, SHIPPED, DELIVERED)
    - priority: Filter by priority (LOW, NORMAL, HIGH, URGENT)
    - customer_name: Search by customer name (partial match)
    - order_number: Search by order number
    
    Response:
        [
            {
                "id": 1,
                "order_number": "ORD-2026-001",
                "customer_name": "TechBuild Co.",
                "customer_email": "orders@techbuild.com",
                "shipping_address": "123 Main St",
                "status": "PROCESSING",
                "priority": "HIGH",
                "required_delivery_date": "2026-02-25T00:00:00Z",
                "total_amount": 1240.00,
                "company": 1,
                "company_name": "SupplyChain Inc",
                "assigned_to_agent": "order_processor_1",
                "created_at": "2026-02-21T10:00:00Z",
                "updated_at": "2026-02-21T10:00:00Z"
            },
            ...
        ]
    """
    try:
        orders = CustomerOrder.objects.all()
        
        # Filter by status
        status_filter = request.query_params.get('status')
        if status_filter:
            orders = orders.filter(status__iexact=status_filter)
        
        # Filter by priority
        priority_filter = request.query_params.get('priority')
        if priority_filter:
            orders = orders.filter(priority__iexact=priority_filter)
        
        # Search by customer name
        customer_name = request.query_params.get('customer_name')
        if customer_name:
            orders = orders.filter(customer_name__icontains=customer_name)
        
        # Search by order number
        order_number = request.query_params.get('order_number')
        if order_number:
            orders = orders.filter(order_number__icontains=order_number)
        
        serializer = CustomerOrderSerializer(orders, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Exception as e:
        logger.error(f"Error fetching customer orders: {str(e)}", exc_info=True)
        return Response(
            {'error': 'Error fetching customer orders', 'message': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@extend_schema(
    responses={200: CustomerOrderSerializer()},
    description="Get a specific customer order by ID"
)
@api_view(['GET'])
def get_customer_order(request, order_id):
    """
    Get a specific customer order by ID.
    
    Args:
        order_id: The ID of the order to retrieve
    
    Response:
        {
            "id": 1,
            "order_number": "ORD-2026-001",
            "customer_name": "TechBuild Co.",
            "customer_email": "orders@techbuild.com",
            "shipping_address": "123 Main St, City",
            "status": "PROCESSING",
            "priority": "HIGH",
            "required_delivery_date": "2026-02-25T00:00:00Z",
            "total_amount": 1240.00,
            "company": 1,
            "company_name": "SupplyChain Inc",
            "assigned_to_agent": "order_processor_1",
            "created_at": "2026-02-21T10:00:00Z",
            "updated_at": "2026-02-21T10:00:00Z"
        }
    """
    try:
        order = CustomerOrder.objects.get(id=order_id)
        serializer = CustomerOrderSerializer(order)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except CustomerOrder.DoesNotExist:
        logger.warning(f"Customer order with ID {order_id} not found")
        return Response(
            {'error': 'Customer order not found', 'id': order_id},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        logger.error(f"Error fetching customer order: {str(e)}", exc_info=True)
        return Response(
            {'error': 'Error fetching customer order', 'message': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@extend_schema(
    request=CustomerOrderSerializer,
    responses={201: CustomerOrderSerializer()},
    description="Create a new customer order"
)
@api_view(['POST'])
def create_customer_order(request):
    """
    Create a new customer order.
    
    Request Body:
        {
            "customer_name": "TechBuild Co.",
            "customer_email": "orders@techbuild.com",
            "shipping_address": "123 Main St, City, Country",
            "required_delivery_date": "2026-02-25T00:00:00Z",
            "total_amount": 1240.00,
            "company": 1,
            "priority": "HIGH",
            "assigned_to_agent": "order_processor_1"
        }
    
    Response:
        {
            "id": 1,
            "order_number": "ORD-2026-0001",
            "customer_name": "TechBuild Co.",
            "customer_email": "orders@techbuild.com",
            "shipping_address": "123 Main St, City, Country",
            "status": "PENDING",
            "priority": "HIGH",
            "required_delivery_date": "2026-02-25T00:00:00Z",
            "total_amount": 1240.00,
            "company": 1,
            "company_name": "SupplyChain Inc",
            "assigned_to_agent": "order_processor_1",
            "created_at": "2026-02-22T10:00:00Z",
            "updated_at": "2026-02-22T10:00:00Z"
        }
    """
    try:
        serializer = CustomerOrderSerializer(data=request.data)
        if not serializer.is_valid():
            logger.warning(f"Invalid customer order data: {serializer.errors}")
            return Response(
                {'error': 'Invalid customer order data', 'details': serializer.errors},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Generate unique order number
        from datetime import datetime
        last_order = CustomerOrder.objects.all().order_by('-id').first()
        order_number = f"ORD-{datetime.now().year}-{(last_order.id + 1) if last_order else 1:04d}"
        
        order = serializer.save(order_number=order_number)
        logger.info(f"Customer order created: {order.customer_name} (Order: {order.order_number}, ID: {order.id})")
        return Response(
            CustomerOrderSerializer(order).data,
            status=status.HTTP_201_CREATED
        )
    except Exception as e:
        logger.error(f"Error creating customer order: {str(e)}", exc_info=True)
        return Response(
            {'error': 'Error creating customer order', 'message': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@extend_schema(
    request=CustomerOrderSerializer,
    responses={200: CustomerOrderSerializer()},
    description="Update a customer order"
)
@api_view(['PUT'])
def update_customer_order(request, order_id):
    """
    Update an existing customer order.
    
    Used for:
    1. Updating order status (PENDING → CONFIRMED → PROCESSING → READY → SHIPPED → DELIVERED)
    2. Changing priority
    3. Updating shipping address or delivery date
    4. Assigning to processing agent
    
    Args:
        order_id: The ID of the order to update
    
    Request Body (partial update):
        {
            "status": "PROCESSING",
            "priority": "URGENT",
            "assigned_to_agent": "order_processor_2"
        }
    
    Response:
        {
            "id": 1,
            "order_number": "ORD-2026-0001",
            "customer_name": "TechBuild Co.",
            "status": "PROCESSING",
            "priority": "URGENT",
            "total_amount": 1240.00,
            "assigned_to_agent": "order_processor_2",
            "updated_at": "2026-02-22T11:00:00Z"
        }
    """
    try:
        order = CustomerOrder.objects.get(id=order_id)
        serializer = CustomerOrderSerializer(order, data=request.data, partial=True)
        
        if not serializer.is_valid():
            logger.warning(f"Invalid order update data: {serializer.errors}")
            return Response(
                {'error': 'Invalid update data', 'details': serializer.errors},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        order = serializer.save()
        logger.info(f"Customer order updated (ID: {order.id}, Status: {order.status})")
        return Response(
            CustomerOrderSerializer(order).data,
            status=status.HTTP_200_OK
        )
    except CustomerOrder.DoesNotExist:
        logger.warning(f"Customer order with ID {order_id} not found")
        return Response(
            {'error': 'Customer order not found', 'id': order_id},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        logger.error(f"Error updating customer order: {str(e)}", exc_info=True)
        return Response(
            {'error': 'Error updating customer order', 'message': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
