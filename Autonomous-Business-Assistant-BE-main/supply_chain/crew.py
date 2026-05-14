"""
CrewAI orchestration for Supply Chain Management.
Coordinates all agents in a sequential workflow to make procurement decisions.
"""
import json
import logging
import uuid
from typing import Dict, Any
from datetime import datetime
from crewai import Crew, Process

from supply_chain.agents.planner import create_planner_agent
from supply_chain.agents.inventory import create_inventory_agent
from supply_chain.agents.procurement import create_procurement_agent
from supply_chain.agents.coordinator import create_coordinator_agent

from supply_chain.tasks.planner_task import create_planner_task
from supply_chain.tasks.inventory_task import create_inventory_task
from supply_chain.tasks.procurement_task import create_procurement_task
from supply_chain.tasks.coordinator_task import create_coordinator_task

from supply_chain.services.context_builder import ContextBuilder
from supply_chain.services.data_fetcher import DataFetcher
from supply_chain.services.decision_memory import DecisionMemory
from supply_chain.services.agent_activity_logger import AgentActivityLogger

logger = logging.getLogger(__name__)


class SupplyChainCrew:
    """
    Orchestrates the intelligent 4-agent supply chain management workflow.
    
    Execution flow:
    1. Planner - Creates strategic plan with predictive intelligence
    2. Inventory Monitor - Forecasts demand and identifies reorder needs
    3. Procurement - Evaluates vendors, optimizes costs, selects best option
    4. Coordinator - Validates decision using historical intelligence
    
    Intelligence Integration:
    - Historical consumption patterns (90+ days)
    - Vendor performance history
    - Seasonal demand forecasting
    - Price trend analysis
    - AI learning insights
    """

    def __init__(self):
        """Initialize the supply chain crew with 4 intelligent agents."""
        logger.info("Initializing Intelligent Supply Chain Crew (4 agents)")
        
        # Create 4 intelligent agents
        self.planner_agent = create_planner_agent()
        self.inventory_agent = create_inventory_agent()
        self.procurement_agent = create_procurement_agent()  # Now includes vendor analysis & cost optimization
        self.coordinator_agent = create_coordinator_agent()
        
        logger.info("All 4 intelligent agents created successfully")

    def execute(self, goal: str) -> Dict[str, Any]:
        """
        Execute the goal-driven supply chain workflow with live activity tracking.
        
        Args:
            goal: The business goal to achieve
            
        Returns:
            Dictionary containing the final procurement decision
        """
        # Generate unique execution ID for tracking
        execution_id = f"exec_{uuid.uuid4().hex[:12]}"
        
        logger.info(f"Starting crew execution [{execution_id}] for goal: {goal}")
        
        try:
            # Build context
            context = ContextBuilder.build_full_context(goal)
            context['timestamp'] = datetime.utcnow().isoformat()
            context['execution_id'] = execution_id
            
            logger.info(f"Context built: {context['inventory']['items_needing_reorder']} items need reordering")
            
            # Log crew initialization activity
            crew_activity = AgentActivityLogger.start_activity(
                agent_type='COORDINATOR',
                activity_description=f"Initializing 4-agent workflow for: {goal[:80]}",
                execution_id=execution_id,
                goal=goal,
                metadata={'items_needing_reorder': context['inventory']['items_needing_reorder']}
            )
            
            # Create tasks and track activities
            tasks, task_activities = self._create_tasks(context)
            
            # Create and run crew with 4 intelligent agents
            crew = Crew(
                agents=[
                    self.planner_agent,
                    self.inventory_agent,
                    self.procurement_agent,  # Handles vendor analysis & cost optimization
                    self.coordinator_agent,
                ],
                tasks=tasks,
                process=Process.sequential,
                verbose=True,
            )
            
            logger.info("Crew created, starting execution...")
            
            # Update crew activity
            AgentActivityLogger.update_activity(
                crew_activity,
                status='PROCESSING',
                activity_description=f"Executing 4-agent workflow: Planner → Inventory → Procurement → Coordinator"
            )
            
            result = crew.kickoff()
            
            logger.info("Crew execution completed - Updating agent activities")
            
            # Extract individual task outputs with full details
            task_outputs = {}
            if hasattr(result, 'tasks_output'):
                for i, task_output in enumerate(result.tasks_output):
                    # Extract the most detailed output available
                    if hasattr(task_output, 'raw'):
                        # Get raw output (most detailed)
                        detailed_output = task_output.raw
                    elif hasattr(task_output, 'json_dict'):
                        # Get structured JSON output
                        detailed_output = json.dumps(task_output.json_dict, indent=2)
                    elif hasattr(task_output, 'pydantic'):
                        # Get Pydantic model output
                        detailed_output = str(task_output.pydantic)
                    else:
                        # Fallback to string representation
                        detailed_output = str(task_output)
                    
                    task_outputs[i] = detailed_output
                    logger.info(f"Task {i} output extracted ({len(detailed_output)} chars)")
            
            # Complete all agent task activities with dynamic descriptions based on outputs
            if 'planner' in task_activities:
                planner_output = task_outputs.get(0, "Strategic plan created")
                planner_desc = self._extract_planner_description(planner_output, context)
                AgentActivityLogger.complete_activity_with_output(
                    task_activities['planner'],
                    status='COMPLETED',
                    final_description=planner_desc,
                    agent_output=planner_output
                )
            
            if 'inventory' in task_activities:
                inventory_output = task_outputs.get(1, f"Identified materials")
                inventory_desc = self._extract_inventory_description(inventory_output, context)
                AgentActivityLogger.complete_activity_with_output(
                    task_activities['inventory'],
                    status='COMPLETED',
                    final_description=inventory_desc,
                    agent_output=inventory_output
                )
            
            if 'procurement' in task_activities:
                procurement_output = task_outputs.get(2, "Vendor selection completed")
                procurement_desc = self._extract_procurement_description(procurement_output, context)
                AgentActivityLogger.complete_activity_with_output(
                    task_activities['procurement'],
                    status='COMPLETED',
                    final_description=procurement_desc,
                    agent_output=procurement_output
                )
            
            if 'coordinator_task' in task_activities:
                coordinator_output = task_outputs.get(3, "Validation completed")
                coordinator_desc = self._extract_coordinator_description(coordinator_output, context)
                AgentActivityLogger.complete_activity_with_output(
                    task_activities['coordinator_task'],
                    status='COMPLETED',
                    final_description=coordinator_desc,
                    agent_output=coordinator_output
                )
            
            # Parse and validate result
            final_decision = self._parse_result(result, context)
            
            # Save decision to memory
            self._save_decision_to_memory(final_decision, context)
            
            # Complete crew activity
            AgentActivityLogger.complete_activity(
                crew_activity,
                status='COMPLETED',
                final_description=f"Completed workflow - Procurement: {final_decision.get('procurement_required', False)}"
            )
            
            return final_decision
            
        except Exception as e:
            logger.error(f"Error during crew execution: {str(e)}", exc_info=True)
            
            # Log error if activity exists
            if 'crew_activity' in locals():
                AgentActivityLogger.log_error(crew_activity, str(e))
            
            return self._create_error_response(goal, str(e))

    def _create_tasks(self, context: Dict[str, Any]) -> list:
        """
        Create all tasks for the 4-agent intelligent workflow with activity logging.
        
        Args:
            context: Execution context with company data
            
        Returns:
            Tuple of (tasks list, activities dict) for completion tracking
        """
        tasks = []
        activities = {}
        execution_id = context.get('execution_id', '')
        goal = context.get('goal', '')
        
        # Task 1: Strategic Planning with Forecasting
        planner_activity = AgentActivityLogger.start_activity(
            agent_type='PLANNER',
            activity_description="Analyzing business goal and creating strategic plan with seasonal patterns",
            execution_id=execution_id,
            goal=goal
        )
        activities['planner'] = planner_activity
        planner_task = create_planner_task(self.planner_agent, context)
        tasks.append(planner_task)
        
        # Task 2: Intelligent Inventory Monitoring with Demand Forecasting
        inventory_activity = AgentActivityLogger.start_activity(
            agent_type='INVENTORY',
            activity_description=f"Scanning {context['inventory']['total_items']} inventory items with consumption forecasts",
            execution_id=execution_id,
            goal=goal,
            metadata={'total_items': context['inventory']['total_items']}
        )
        activities['inventory'] = inventory_activity
        inventory_task = create_inventory_task(self.inventory_agent, context)
        tasks.append(inventory_task)
        
        # Task 3: Intelligent Procurement (includes vendor analysis & cost optimization)
        low_stock_items = context['inventory']['low_stock_items']
        if low_stock_items:
            material_names = [item['raw_material_name'] for item in low_stock_items[:3]]
            procurement_activity = AgentActivityLogger.start_activity(
                agent_type='PROCUREMENT',
                activity_description=f"Evaluating vendors & optimizing costs for {len(low_stock_items)} materials: {', '.join(material_names)}",
                execution_id=execution_id,
                goal=goal,
                metadata={'materials_count': len(low_stock_items), 'materials': material_names}
            )
            activities['procurement'] = procurement_activity
        
        procurement_task = create_procurement_task(
            self.procurement_agent,
            context,
            low_stock_items
        )
        tasks.append(procurement_task)
        
        # Task 4: Coordinator with Historical Validation
        coordinator_activity = AgentActivityLogger.start_activity(
            agent_type='COORDINATOR',
            activity_description="Validating decisions against historical patterns and finalizing recommendations",
            execution_id=execution_id,
            goal=goal
        )
        activities['coordinator_task'] = coordinator_activity
        coordinator_task = create_coordinator_task(self.coordinator_agent, context)
        tasks.append(coordinator_task)
        
        logger.info(f"Created {len(tasks)} intelligent tasks for 4-agent execution")
        return tasks, activities

    def _parse_result(self, result: Any, context: Dict[str, Any]) -> Dict[str, Any]:
        """
        Parse and validate the crew execution result.
        
        Args:
            result: Raw result from crew execution
            context: Original execution context
            
        Returns:
            Structured decision dictionary
        """
        logger.info("Parsing crew execution result")
        
        try:
            # Try to parse as JSON
            if isinstance(result, str):
                # Extract JSON from result if it's wrapped in text
                result_str = result.strip()
                
                # Try to find JSON block
                if '{' in result_str:
                    start_idx = result_str.find('{')
                    end_idx = result_str.rfind('}') + 1
                    json_str = result_str[start_idx:end_idx]
                    parsed = json.loads(json_str)
                else:
                    raise ValueError("No JSON found in result")
            elif isinstance(result, dict):
                parsed = result
            else:
                parsed = json.loads(str(result))
            
            # Validate required fields
            required_fields = [
                'goal', 'inventory_status', 'procurement_required',
                'selected_vendor', 'order_quantity', 'expected_cost',
                'confidence_score', 'explanation'
            ]
            
            for field in required_fields:
                if field not in parsed:
                    logger.warning(f"Missing required field: {field}")
                    parsed[field] = self._get_default_value(field, context)
            
            return parsed
            
        except Exception as e:
            logger.error(f"Error parsing result: {str(e)}")
            return self._create_fallback_response(context, str(result))

    def _get_default_value(self, field: str, context: Dict[str, Any]) -> Any:
        """Get default value for a missing field."""
        defaults = {
            'goal': context.get('goal', ''),
            'inventory_status': context.get('inventory', {}),
            'procurement_required': len(context.get('inventory', {}).get('low_stock_items', [])) > 0,
            'selected_vendor': None,
            'order_quantity': 0,
            'expected_cost': 0,
            'confidence_score': 50,
            'explanation': 'Decision generated with incomplete data',
        }
        return defaults.get(field)

    def _create_fallback_response(self, context: Dict[str, Any], raw_result: str) -> Dict[str, Any]:
        """
        Create a fallback response when parsing fails.
        
        Args:
            context: Execution context
            raw_result: Raw result string
            
        Returns:
            Fallback decision dictionary
        """
        logger.warning("Creating fallback response due to parsing error")
        
        low_stock_items = context['inventory']['low_stock_items']
        procurement_needed = len(low_stock_items) > 0
        
        return {
            'goal': context['goal'],
            'inventory_status': {
                'total_items': context['inventory']['total_items'],
                'items_below_threshold': len(low_stock_items),
                'low_stock_materials': [
                    {
                        'material_name': item['raw_material_name'],
                        'sku': item['raw_material_sku'],
                        'stock_percentage': item['stock_percentage'],
                    }
                    for item in low_stock_items
                ],
            },
            'procurement_required': procurement_needed,
            'selected_vendor': None,
            'order_quantity': 0,
            'expected_cost': 0,
            'confidence_score': 30,
            'explanation': f"Workflow completed but result parsing encountered issues. Raw output available for debugging. Procurement required: {procurement_needed}",
            'raw_result': raw_result[:500],  # Include truncated raw result
        }

    def _create_error_response(self, goal: str, error_message: str) -> Dict[str, Any]:
        """
        Create an error response.
        
        Args:
            goal: Original goal
            error_message: Error description
            
        Returns:
            Error response dictionary
        """
        logger.error(f"Creating error response: {error_message}")
        
        return {
            'goal': goal,
            'inventory_status': {},
            'procurement_required': False,
            'selected_vendor': None,
            'order_quantity': 0,
            'expected_cost': 0,
            'confidence_score': 0,
            'explanation': f"Error during execution: {error_message}",
            'error': True,
        }

    def _extract_planner_description(self, output: str, context: Dict[str, Any]) -> str:
        """Extract dynamic description from planner output."""
        try:
            output_lower = output.lower()
            
            # Extract key insights
            insights = []
            
            # Check for urgency/priority
            if 'urgent' in output_lower or 'critical' in output_lower:
                insights.append("URGENT priority")
            elif 'high priority' in output_lower:
                insights.append("High priority")
            
            # Check for seasonal mentions
            if 'valentine' in output_lower:
                insights.append("Valentine's season (1.8x)")
            elif 'christmas' in output_lower:
                insights.append("Christmas season (2.0x)")
            elif 'seasonal' in output_lower:
                insights.append("Seasonal factors applied")
            
            # Check for strategy type
            if 'cost' in output_lower and 'optim' in output_lower:
                insights.append("Cost optimization focus")
            elif 'quality' in output_lower or 'premium' in output_lower:
                insights.append("Quality-first approach")
            elif 'fast' in output_lower or 'speed' in output_lower:
                insights.append("Speed prioritized")
            
            if insights:
                return f"Strategic plan: {', '.join(insights)}"
            else:
                return "Strategic plan created with business context analysis"
        except Exception as e:
            logger.warning(f"Error extracting planner description: {e}")
            return "Strategic plan completed"
    
    def _extract_inventory_description(self, output: str, context: Dict[str, Any]) -> str:
        """Extract dynamic description from inventory output."""
        try:
            output_lower = output.lower()
            
            # Extract material count
            items_count = context['inventory'].get('items_needing_reorder', 0)
            
            # Find material names if mentioned
            materials = []
            for item in context['inventory'].get('low_stock_items', [])[:2]:
                if item['raw_material_name'].lower() in output_lower:
                    materials.append(item['raw_material_name'])
            
            # Check for urgency indicators
            urgency = ""
            if 'stockout' in output_lower or 'critical' in output_lower:
                urgency = " - STOCKOUT RISK"
            elif 'urgent' in output_lower or 'within' in output_lower:
                urgency = " - Urgent reorder needed"
            
            # Build description
            if materials:
                material_str = ', '.join(materials)
                if len(context['inventory'].get('low_stock_items', [])) > 2:
                    material_str += f" +{items_count - 2} more"
                return f"Analyzed inventory: {material_str}{urgency}"
            elif items_count > 0:
                return f"Identified {items_count} material{'s' if items_count > 1 else ''} needing reorder{urgency}"
            else:
                return "Inventory healthy - All materials above safety thresholds"
        except Exception as e:
            logger.warning(f"Error extracting inventory description: {e}")
            return "Inventory analysis completed"
    
    def _extract_procurement_description(self, output: str, context: Dict[str, Any]) -> str:
        """Extract dynamic description from procurement output."""
        try:
            output_lower = output.lower()
            
            # Try to find vendor name
            vendor_name = None
            for item in context['inventory'].get('low_stock_items', []):
                for vendor in item.get('vendor_options', []):
                    if vendor['vendor_name'].lower() in output_lower:
                        vendor_name = vendor['vendor_name']
                        break
                if vendor_name:
                    break
            
            # Extract cost/quantity if mentioned
            cost_info = ""
            if '$' in output or 'cost' in output_lower:
                import re
                cost_match = re.search(r'\$?\d+[\d,]*\.?\d*', output)
                if cost_match:
                    cost_info = f" - Est. ${cost_match.group()}"
            
            # Extract quantity
            quantity_info = ""
            if 'kg' in output_lower or 'units' in output_lower:
                import re
                qty_match = re.search(r'(\d+[\d,]*\.?\d*)\s*(kg|units)', output_lower)
                if qty_match:
                    quantity_info = f" ({qty_match.group(1)} {qty_match.group(2)})"
            
            # Build description
            if vendor_name:
                return f"Selected {vendor_name}{quantity_info}{cost_info}"
            elif 'no procurement' in output_lower or 'not required' in output_lower:
                return "No procurement required - Inventory levels adequate"
            else:
                return f"Vendor selection completed{quantity_info}{cost_info}"
        except Exception as e:
            logger.warning(f"Error extracting procurement description: {e}")
            return "Procurement decision finalized"
    
    def _extract_coordinator_description(self, output: str, context: Dict[str, Any]) -> str:
        """Extract dynamic description from coordinator output."""
        try:
            output_lower = output.lower()
            
            # Extract confidence if mentioned
            confidence = None
            import re
            conf_match = re.search(r'(\d+)%?\s*confidence', output_lower)
            if conf_match:
                confidence = int(conf_match.group(1))
            
            # Check validation status
            status = []
            if 'approved' in output_lower or 'validated' in output_lower:
                status.append("✓ Validated")
            if 'aligned' in output_lower or 'consistent' in output_lower:
                status.append("Consistent with history")
            if 'concern' in output_lower or 'risk' in output_lower:
                status.append("⚠ Risks noted")
            if 'optimal' in output_lower or 'recommended' in output_lower:
                status.append("Optimal solution")
            
            # Build description
            desc_parts = []
            if status:
                desc_parts.append(' | '.join(status))
            
            if confidence:
                desc_parts.append(f"{confidence}% confidence")
            
            if desc_parts:
                return ' - '.join(desc_parts)
            else:
                return "Validation completed - Decision approved"
        except Exception as e:
            logger.warning(f"Error extracting coordinator description: {e}")
            return "Coordination and validation completed"

    def _save_decision_to_memory(self, decision: Dict[str, Any], context: Dict[str, Any]) -> None:
        """
        Save the decision to memory for future learning.
        
        Args:
            decision: The final decision
            context: Execution context
        """
        try:
            if decision.get('procurement_required') and decision.get('selected_vendor'):
                # Extract first low stock item (in production, handle multiple)
                low_stock_items = context['inventory']['low_stock_items']
                if low_stock_items:
                    first_item = low_stock_items[0]
                    
                    DecisionMemory.save_decision(
                        goal=decision['goal'],
                        raw_material_id=first_item['raw_material_id'],
                        inventory_status=decision['inventory_status'],
                        procurement_required=True,
                        selected_vendor_id=decision['selected_vendor'].get('vendor_id') if decision['selected_vendor'] else None,
                        order_quantity=float(decision['order_quantity']),
                        expected_cost=float(decision['expected_cost']),
                        confidence_score=float(decision['confidence_score']),
                        explanation={
                            'summary': decision['explanation'],
                            'timestamp': context['timestamp'],
                        }
                    )
                    logger.info("Decision saved to memory successfully")
        except Exception as e:
            logger.error(f"Error saving decision to memory: {str(e)}")
