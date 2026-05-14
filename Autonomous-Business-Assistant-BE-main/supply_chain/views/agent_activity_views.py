"""
API Views for Agent Activity Monitoring (Live Agent Pulse)
"""
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from datetime import timedelta

from supply_chain.models import AgentActivity
from supply_chain.services.agent_activity_logger import AgentActivityLogger


@api_view(['GET'])
def live_agent_pulse(request):
    """
    Get live agent activities for real-time monitoring dashboard.
    
    Query Parameters:
        limit: Number of recent activities to return (default: 20)
        agent_type: Filter by agent type (PLANNER, INVENTORY, PROCUREMENT, COORDINATOR)
    
    Returns:
        List of recent agent activities with timestamps and descriptions
    """
    limit = int(request.GET.get('limit', 20))
    agent_type = request.GET.get('agent_type', None)
    
    # Query activities
    activities = AgentActivity.objects.all()
    
    if agent_type:
        activities = activities.filter(agent_type=agent_type.upper())
    
    activities = activities[:limit]
    
    # Format response
    pulse_data = []
    for activity in activities:
        # Calculate time ago
        time_diff = timezone.now() - activity.started_at
        if time_diff.total_seconds() < 60:
            time_ago = "Just now"
        elif time_diff.total_seconds() < 3600:
            minutes = int(time_diff.total_seconds() / 60)
            time_ago = f"{minutes} min ago"
        elif time_diff.total_seconds() < 86400:
            hours = int(time_diff.total_seconds() / 3600)
            time_ago = f"{hours} hr ago"
        else:
            days = int(time_diff.total_seconds() / 86400)
            time_ago = f"{days} day{'s' if days > 1 else ''} ago"
        
        pulse_data.append({
            'id': activity.id,
            'agent_type': activity.agent_type,
            'agent_name': activity.get_agent_type_display(),
            'agent_abbreviation': activity.agent_type[:3],  # PLA, INV, PRO, COO
            'status': activity.status,
            'description': activity.activity_description,
            'agent_output': activity.agent_output,  # ← ADD: Agent's actual output
            'time_ago': time_ago,
            'timestamp': activity.started_at.isoformat(),
            'completed': activity.completed_at is not None,
            'duration': activity.duration_seconds,
            'goal': activity.goal,
            'execution_id': activity.execution_id
        })
    
    return Response({
        'success': True,
        'count': len(pulse_data),
        'activities': pulse_data
    })


@api_view(['GET'])
def agent_summary(request):
    """
    Get summary statistics of agent activities.
    
    Returns:
        Statistics: total activities, by agent type, by status, avg durations
    """
    summary = AgentActivityLogger.get_agent_summary()
    
    return Response({
        'success': True,
        'summary': summary,
        'timestamp': timezone.now().isoformat()
    })


@api_view(['GET'])
def agent_activity_history(request, agent_type):
    """
    Get activity history for a specific agent type.
    
    Args:
        agent_type: Type of agent (planner, inventory, procurement, coordinator)
    
    Query Parameters:
        hours: Number of hours to look back (default: 24)
        limit: Maximum number of activities (default: 50)
    
    Returns:
        List of activities for the specified agent
    """
    hours = int(request.GET.get('hours', 24))
    limit = int(request.GET.get('limit', 50))
    
    # Calculate time window
    since = timezone.now() - timedelta(hours=hours)
    
    # Query activities
    activities = AgentActivity.objects.filter(
        agent_type=agent_type.upper(),
        started_at__gte=since
    )[:limit]
    
    # Format response
    history = []
    for activity in activities:
        history.append({
            'id': activity.id,
            'status': activity.status,
            'description': activity.activity_description,
            'started_at': activity.started_at.isoformat(),
            'completed_at': activity.completed_at.isoformat() if activity.completed_at else None,
            'duration': activity.duration_seconds,
            'goal': activity.goal,
            'metadata': activity.metadata
        })
    
    return Response({
        'success': True,
        'agent_type': agent_type.upper(),
        'hours': hours,
        'count': len(history),
        'activities': history
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def cleanup_old_activities(request):
    """
    Cleanup old agent activities (admin only).
    
    Body:
        days: Number of days to keep (default: 7)
    
    Returns:
        Number of activities deleted
    """
    days = int(request.data.get('days', 7))
    
    deleted_count = AgentActivityLogger.cleanup_old_activities(days=days)
    
    return Response({
        'success': True,
        'deleted_count': deleted_count,
        'message': f'Cleaned up activities older than {days} days'
    })


@api_view(['GET'])
def execution_trace(request, execution_id):
    """
    Get all agent activities for a specific execution.
    
    Args:
        execution_id: The execution ID to trace
    
    Returns:
        Timeline of all agent activities for this execution
    """
    activities = AgentActivity.objects.filter(
        execution_id=execution_id
    ).order_by('started_at')
    
    if not activities.exists():
        return Response({
            'success': False,
            'error': f'No activities found for execution_id: {execution_id}'
        }, status=status.HTTP_404_NOT_FOUND)
    
    # Build execution timeline
    timeline = []
    for activity in activities:
        timeline.append({
            'agent_type': activity.agent_type,
            'agent_name': activity.get_agent_type_display(),
            'status': activity.status,
            'description': activity.activity_description,
            'started_at': activity.started_at.isoformat(),
            'completed_at': activity.completed_at.isoformat() if activity.completed_at else None,
            'duration': activity.duration_seconds,
            'metadata': activity.metadata
        })
    
    # Get execution info from first activity
    first_activity = activities.first()
    
    return Response({
        'success': True,
        'execution_id': execution_id,
        'goal': first_activity.goal,
        'started_at': first_activity.started_at.isoformat(),
        'agent_count': activities.count(),
        'timeline': timeline
    })
