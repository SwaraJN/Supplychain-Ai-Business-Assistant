"""
Cache utilities for the supply chain system.
Handles Redis caching for frequently accessed data.
"""
from typing import Any, Optional, Callable
from functools import wraps
import logging
from django.core.cache import cache

logger = logging.getLogger(__name__)


class CacheKeys:
    """Centralized cache key definitions."""
    INVENTORY_ALL = "inventory:all"
    INVENTORY_LOW_STOCK = "inventory:low_stock"
    INVENTORY_SINGLE = "inventory:{material_id}"
    VENDORS_BY_MATERIAL = "vendors:material:{material_id}"
    VENDORS_ALL = "vendors:all"
    RAW_MATERIALS_ALL = "raw_materials:all"


class CacheTimeout:
    """Cache timeout constants in seconds."""
    SHORT = 60  # 1 minute
    MEDIUM = 300  # 5 minutes
    LONG = 900  # 15 minutes


def get_cached_data(key: str, default: Any = None) -> Optional[Any]:
    """
    Get data from cache.
    
    Args:
        key: Cache key
        default: Default value if key not found
        
    Returns:
        Cached data or default value
    """
    try:
        return cache.get(key, default)
    except Exception as e:
        logger.error(f"Cache get error for key {key}: {str(e)}")
        return default


def set_cached_data(key: str, value: Any, timeout: int = CacheTimeout.MEDIUM) -> bool:
    """
    Set data in cache.
    
    Args:
        key: Cache key
        value: Value to cache
        timeout: Cache timeout in seconds
        
    Returns:
        True if successful, False otherwise
    """
    try:
        cache.set(key, value, timeout)
        return True
    except Exception as e:
        logger.error(f"Cache set error for key {key}: {str(e)}")
        return False


def delete_cached_data(key: str) -> bool:
    """
    Delete data from cache.
    
    Args:
        key: Cache key
        
    Returns:
        True if successful, False otherwise
    """
    try:
        cache.delete(key)
        return True
    except Exception as e:
        logger.error(f"Cache delete error for key {key}: {str(e)}")
        return False


def invalidate_pattern(pattern: str) -> bool:
    """
    Invalidate all cache keys matching a pattern.
    
    Args:
        pattern: Pattern to match (e.g., "inventory:*")
        
    Returns:
        True if successful, False otherwise
    """
    try:
        cache.delete_pattern(pattern)
        return True
    except Exception as e:
        logger.error(f"Cache pattern invalidation error for {pattern}: {str(e)}")
        return False


def cache_result(key_func: Callable, timeout: int = CacheTimeout.MEDIUM):
    """
    Decorator to cache function results.
    
    Args:
        key_func: Function that generates cache key from function arguments
        timeout: Cache timeout in seconds
        
    Returns:
        Decorated function
    """
    def decorator(func: Callable):
        @wraps(func)
        def wrapper(*args, **kwargs):
            # Generate cache key
            cache_key = key_func(*args, **kwargs)
            
            # Try to get from cache
            result = get_cached_data(cache_key)
            if result is not None:
                logger.debug(f"Cache hit for key: {cache_key}")
                return result
            
            # Execute function
            logger.debug(f"Cache miss for key: {cache_key}")
            result = func(*args, **kwargs)
            
            # Store in cache
            set_cached_data(cache_key, result, timeout)
            
            return result
        return wrapper
    return decorator


def invalidate_inventory_cache(material_id: Optional[int] = None) -> None:
    """
    Invalidate inventory-related caches.
    
    Args:
        material_id: If provided, only invalidate cache for specific material
    """
    if material_id:
        delete_cached_data(CacheKeys.INVENTORY_SINGLE.format(material_id=material_id))
    else:
        invalidate_pattern("inventory:*")
    logger.info(f"Invalidated inventory cache for material_id={material_id}")


def invalidate_vendor_cache(material_id: Optional[int] = None) -> None:
    """
    Invalidate vendor-related caches.
    
    Args:
        material_id: If provided, only invalidate cache for specific material
    """
    if material_id:
        delete_cached_data(CacheKeys.VENDORS_BY_MATERIAL.format(material_id=material_id))
    else:
        invalidate_pattern("vendors:*")
    logger.info(f"Invalidated vendor cache for material_id={material_id}")
