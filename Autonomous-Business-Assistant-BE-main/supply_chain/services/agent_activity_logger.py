"""
Agent Activity Logger - Tracks real-time agent activities for live monitoring.
"""
import uuid
import logging
from datetime import datetime
from typing import Dict, Any, Optional
from django.utils import timezone

from supply_chain.models import AgentActivity

logger = logging.getLogger(__name__)


class AgentActivityLogger:
    """
    Logs agent activities in real-time for the live agent pulse dashboard.
    """
    
    @staticmethod
    def start_activity(
        agent_type: str,
        activity_description: str,
        execution_id: str = None,
        goal: str = "",
        metadata: Dict[str, Any] = None
    ) -> AgentActivity:
        """
        Log the start of an agent activity.
        
        Args:
            agent_type: Type of agent (PLANNER, INVENTORY, PROCUREMENT, COORDINATOR)
            activity_description: Human-readable description of activity
            execution_id: ID of the crew execution (optional)
            goal: The business goal being worked on
            metadata: Additional context data
            
        Returns:
            Created AgentActivity instance
        """
        agent_id = f"{agent_type.lower()}_{uuid.uuid4().hex[:8]}"
        
        activity = AgentActivity.objects.create(
            agent_type=agent_type,
            agent_id=agent_id,
            status='PROCESSING',
            activity_description=activity_description,
            execution_id=execution_id or "",
            goal=goal,
            metadata=metadata or {},
            started_at=timezone.now()
        )
        
        logger.info(f"[{agent_type}] Started: {activity_description}")
        return activity
    
    @staticmethod
    def update_activity(
        activity: AgentActivity,
        status: str = None,
        activity_description: str = None,
        metadata: Dict[str, Any] = None
    ) -> AgentActivity:
        """
        Update an ongoing agent activity.
        
        Args:
            activity: The AgentActivity instance to update
            status: New status (ANALYZING, DECIDING, etc.)
            activity_description: Updated description
            metadata: Additional metadata to merge
            
        Returns:
            Updated AgentActivity instance
        """
        if status:
            activity.status = status
        
        if activity_description:
            activity.activity_description = activity_description
        
        if metadata:
            activity.metadata.update(metadata)
        
        activity.save()
        
        logger.info(f"[{activity.agent_type}] Updated: {activity.activity_description}")
        return activity
    
    @staticmethod
    def complete_activity(
        activity: AgentActivity,
        status: str = 'COMPLETED',
        final_description: str = None
    ) -> AgentActivity:
        """
        Mark an agent activity as completed.
        
        Args:
            activity: The AgentActivity instance to complete
            status: Final status (COMPLETED or ERROR)
            final_description: Final description of what was accomplished
            
        Returns:
            Completed AgentActivity instance
        """
        activity.status = status
        activity.completed_at = timezone.now()
        
        if final_description:
            activity.activity_description = final_description
        
        # Calculate duration
        if activity.started_at:
            duration = (activity.completed_at - activity.started_at).total_seconds()
            activity.duration_seconds = duration
        
        activity.save()
        
        logger.info(
            f"[{activity.agent_type}] {status}: {activity.activity_description} "
            f"(Duration: {activity.duration_seconds:.2f}s)"
        )
        return activity
    
    @staticmethod
    def complete_activity_with_output(
        activity: AgentActivity,
        status: str = 'COMPLETED',
        final_description: str = None,
        agent_output: str = None
    ) -> AgentActivity:
        """
        Mark an agent activity as completed and store its output.
        
        Args:
            activity: The AgentActivity instance to complete
            status: Final status (COMPLETED or ERROR)
            final_description: Final description of what was accomplished
            agent_output: The actual output/result from the agent
            
        Returns:
            Completed AgentActivity instance with output
        """
        activity.status = status
        activity.completed_at = timezone.now()
        
        if final_description:
            activity.activity_description = final_description
        
        # Store agent output (truncate if too long)
        if agent_output:
            if isinstance(agent_output, dict):
                import json
                activity.agent_output = json.dumps(agent_output, indent=2)
            else:
                activity.agent_output = str(agent_output)[:10000]  # Limit to 10KB
        
        # Calculate duration
        if activity.started_at:
            duration = (activity.completed_at - activity.started_at).total_seconds()
            activity.duration_seconds = duration
        
        activity.save()
        
        output_preview = activity.agent_output[:100] if activity.agent_output else "No output"
        logger.info(
            f"[{activity.agent_type}] {status}: {activity.activity_description} "
            f"(Duration: {activity.duration_seconds:.2f}s) Output: {output_preview}..."
        )
        return activity
    
    @staticmethod
    def log_error(
        activity: AgentActivity,
        error_message: str
    ) -> AgentActivity:
        """
        Log an error for an agent activity.
        
        Args:
            activity: The AgentActivity instance
            error_message: Description of the error
            
        Returns:
            Updated AgentActivity instance with error status
        """
        activity.status = 'ERROR'
        activity.activity_description = f"ERROR: {error_message}"
        activity.completed_at = timezone.now()
        
        if activity.started_at:
            duration = (activity.completed_at - activity.started_at).total_seconds()
            activity.duration_seconds = duration
        
        activity.save()
        
        logger.error(f"[{activity.agent_type}] ERROR: {error_message}")
        return activity
    
    @staticmethod
    def get_live_activities(limit: int = 10) -> list:
        """
        Get the most recent agent activities for live dashboard.
        
        Args:
            limit: Number of activities to return
            
        Returns:
            List of recent AgentActivity instances
        """
        return AgentActivity.objects.all()[:limit]
    
    @staticmethod
    def get_agent_summary() -> Dict[str, Any]:
        """
        Get summary of agent activities (for dashboard stats).
        
        Returns:
            Dictionary with agent activity statistics
        """
        from django.db.models import Count, Avg
        
        summary = {
            'total_activities': AgentActivity.objects.count(),
            'by_agent': {},
            'by_status': {},
        }
        
        # Count by agent type
        agent_counts = AgentActivity.objects.values('agent_type').annotate(
            count=Count('id'),
            avg_duration=Avg('duration_seconds')
        )
        
        for item in agent_counts:
            agent_type = item['agent_type']
            summary['by_agent'][agent_type] = {
                'count': item['count'],
                'avg_duration': round(item['avg_duration'] or 0, 2)
            }
        
        # Count by status
        status_counts = AgentActivity.objects.values('status').annotate(
            count=Count('id')
        )
        
        for item in status_counts:
            summary['by_status'][item['status']] = item['count']
        
        return summary
    
    @staticmethod
    def cleanup_old_activities(days: int = 7) -> int:
        """
        Remove old agent activities to keep the database clean.
        
        Args:
            days: Remove activities older than this many days
            
        Returns:
            Number of activities deleted
        """
        from django.utils import timezone
        from datetime import timedelta
        
        cutoff_date = timezone.now() - timedelta(days=days)
        deleted_count, _ = AgentActivity.objects.filter(
            started_at__lt=cutoff_date
        ).delete()
        
        logger.info(f"Cleaned up {deleted_count} old agent activities")
        return deleted_count
