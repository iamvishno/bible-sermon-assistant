"""
Redis Cache Service for AI Response Caching
Target: 80% cache hit rate, 7-day TTL
"""

import json
import hashlib
from typing import Optional, Dict, Any
from datetime import datetime, timedelta
import redis
from redis.exceptions import RedisError
import os
from dotenv import load_dotenv

load_dotenv()


class CacheService:
    """Handles AI response caching with Redis"""

    def __init__(self):
        """Initialize Redis connection"""
        redis_url = os.getenv("REDIS_URL")
        if not redis_url:
            raise ValueError("REDIS_URL environment variable not set")

        try:
            self.redis_client = redis.from_url(
                redis_url,
                decode_responses=True,
                socket_timeout=5,
                socket_connect_timeout=5,
            )
            # Test connection
            self.redis_client.ping()
            print("✅ Redis connection established")
        except RedisError as e:
            print(f"❌ Redis connection failed: {e}")
            self.redis_client = None

        self.cache_ttl_days = int(os.getenv("CACHE_TTL_DAYS", 7))
        self.cache_prefix = "ai_sermon:"

    def generate_cache_key(
        self,
        verses: list,
        config: Dict[str, Any],
        request_type: str = "sermon"
    ) -> str:
        """
        Generate unique cache key from verses and config.

        Args:
            verses: List of verse references
            config: Sermon configuration dict
            request_type: Type of request (sermon, devotional, etc.)

        Returns:
            SHA-256 hash as cache key
        """
        # Normalize input for consistent hashing
        cache_input = {
            "type": request_type,
            "verses": sorted([
                f"{v.get('book_id')}:{v.get('chapter')}:{v.get('verse_start')}-{v.get('verse_end', v.get('verse_start'))}"
                for v in verses
            ]),
            "config": {
                "sermon_type": config.get("sermon_type"),
                "target_audience": config.get("target_audience"),
                "length_minutes": config.get("length_minutes"),
                "tone": config.get("tone", "formal"),
                "include_illustrations": config.get("include_illustrations", True),
            }
        }

        # Create deterministic JSON string
        cache_string = json.dumps(cache_input, sort_keys=True)

        # Generate SHA-256 hash
        cache_hash = hashlib.sha256(cache_string.encode()).hexdigest()

        return f"{self.cache_prefix}{cache_hash}"

    def get(self, cache_key: str) -> Optional[Dict[str, Any]]:
        """
        Retrieve cached AI response.

        Args:
            cache_key: Cache key from generate_cache_key()

        Returns:
            Cached response dict or None if not found/expired
        """
        if not self.redis_client:
            return None

        try:
            cached_data = self.redis_client.get(cache_key)

            if cached_data:
                data = json.loads(cached_data)

                # Increment hit count
                self.redis_client.hincrby(f"{cache_key}:meta", "hit_count", 1)

                print(f"✅ Cache HIT: {cache_key[:16]}...")
                return data
            else:
                print(f"❌ Cache MISS: {cache_key[:16]}...")
                return None

        except (RedisError, json.JSONDecodeError) as e:
            print(f"❌ Cache read error: {e}")
            return None

    def set(
        self,
        cache_key: str,
        response_data: Dict[str, Any],
        verses: list,
        config: Dict[str, Any],
        request_type: str = "sermon"
    ) -> bool:
        """
        Store AI response in cache.

        Args:
            cache_key: Cache key from generate_cache_key()
            response_data: AI response to cache
            verses: Verse references (for metadata)
            config: Sermon configuration (for metadata)
            request_type: Type of request

        Returns:
            True if successful, False otherwise
        """
        if not self.redis_client:
            return False

        try:
            # Calculate expiration
            ttl_seconds = self.cache_ttl_days * 24 * 60 * 60

            # Store main cache data with TTL
            self.redis_client.setex(
                cache_key,
                ttl_seconds,
                json.dumps(response_data)
            )

            # Store metadata (for analytics)
            metadata = {
                "request_type": request_type,
                "verse_count": len(verses),
                "cached_at": datetime.utcnow().isoformat(),
                "expires_at": (datetime.utcnow() + timedelta(days=self.cache_ttl_days)).isoformat(),
                "hit_count": 0,
            }

            self.redis_client.hset(
                f"{cache_key}:meta",
                mapping=metadata
            )
            self.redis_client.expire(f"{cache_key}:meta", ttl_seconds)

            print(f"✅ Cache SET: {cache_key[:16]}... (TTL: {self.cache_ttl_days} days)")
            return True

        except RedisError as e:
            print(f"❌ Cache write error: {e}")
            return False

    def delete(self, cache_key: str) -> bool:
        """
        Delete cached entry.

        Args:
            cache_key: Cache key to delete

        Returns:
            True if successful, False otherwise
        """
        if not self.redis_client:
            return False

        try:
            self.redis_client.delete(cache_key, f"{cache_key}:meta")
            print(f"✅ Cache DELETE: {cache_key[:16]}...")
            return True
        except RedisError as e:
            print(f"❌ Cache delete error: {e}")
            return False

    def get_stats(self) -> Dict[str, Any]:
        """
        Get cache statistics.

        Returns:
            Dict with cache stats (total entries, hit rate, etc.)
        """
        if not self.redis_client:
            return {"error": "Redis not connected"}

        try:
            # Get all cache keys
            all_keys = self.redis_client.keys(f"{self.cache_prefix}*")
            cache_keys = [k for k in all_keys if not k.endswith(":meta")]

            total_entries = len(cache_keys)
            total_hits = 0

            # Sum up hit counts
            for key in cache_keys:
                hit_count = self.redis_client.hget(f"{key}:meta", "hit_count")
                if hit_count:
                    total_hits += int(hit_count)

            # Calculate hit rate (hits per entry)
            avg_hits_per_entry = total_hits / total_entries if total_entries > 0 else 0

            # Estimate hit rate percentage (assuming 1 miss per cache entry)
            cache_hit_rate = (total_hits / (total_hits + total_entries)) if (total_hits + total_entries) > 0 else 0

            return {
                "total_entries": total_entries,
                "total_hits": total_hits,
                "avg_hits_per_entry": round(avg_hits_per_entry, 2),
                "estimated_hit_rate": round(cache_hit_rate * 100, 2),
                "ttl_days": self.cache_ttl_days,
                "status": "connected",
            }

        except RedisError as e:
            return {"error": f"Failed to get stats: {e}"}

    def clear_all(self) -> bool:
        """
        Clear all AI cache entries (use with caution!).

        Returns:
            True if successful, False otherwise
        """
        if not self.redis_client:
            return False

        try:
            keys = self.redis_client.keys(f"{self.cache_prefix}*")
            if keys:
                self.redis_client.delete(*keys)
                print(f"✅ Cleared {len(keys)} cache entries")
            return True
        except RedisError as e:
            print(f"❌ Cache clear error: {e}")
            return False

    def cleanup_expired(self) -> int:
        """
        Clean up expired cache entries (Redis handles this automatically,
        but this can be used for manual cleanup).

        Returns:
            Number of entries cleaned up
        """
        # Redis handles TTL expiration automatically
        # This method is mainly for PostgreSQL cache backup
        print("ℹ️  Redis handles TTL expiration automatically")
        return 0


# Singleton instance
_cache_service_instance = None


def get_cache_service() -> CacheService:
    """Get or create CacheService singleton instance"""
    global _cache_service_instance

    if _cache_service_instance is None:
        _cache_service_instance = CacheService()

    return _cache_service_instance
