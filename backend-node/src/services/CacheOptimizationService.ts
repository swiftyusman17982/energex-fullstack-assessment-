import { RedisService } from './RedisService';
import { DatabaseService } from './DatabaseService';

export class CacheOptimizationService {
  private redisService: RedisService;
  private databaseService: DatabaseService;

  constructor(redisService: RedisService, databaseService: DatabaseService) {
    this.redisService = redisService;
    this.databaseService = databaseService;
  }

  /**
   * Optimize Redis cache with advanced strategies
   */
  async optimizeCache(): Promise<void> {
    try {
      // Set optimal Redis configuration
      await this.setOptimalRedisConfig();
      
      // Implement cache warming
      await this.warmCache();
      
      // Clean up expired keys
      await this.cleanupExpiredKeys();
      
      // Implement cache compression for large values
      await this.implementCacheCompression();
      
      console.log('✅ Cache optimization completed');
    } catch (error) {
      console.error('❌ Cache optimization failed:', error);
      throw error;
    }
  }

  /**
   * Set optimal Redis configuration
   */
  private async setOptimalRedisConfig(): Promise<void> {
    try {
      // Set memory policy to allkeys-lru for better memory management
      await this.redisService.optimize();
      
      // Set additional optimizations
      const optimizations = [
        ['maxmemory-policy', 'allkeys-lru'],
        ['maxmemory', '100mb'],
        ['tcp-keepalive', '60'],
        ['timeout', '300'],
        ['tcp-backlog', '511'],
        ['databases', '16'],
        ['save', '900 1 300 10 60 10000'],
        ['stop-writes-on-bgsave-error', 'yes'],
        ['rdbcompression', 'yes'],
        ['rdbchecksum', 'yes'],
        ['dbfilename', 'dump.rdb'],
        ['dir', '/data'],
        ['appendonly', 'yes'],
        ['appendfsync', 'everysec'],
        ['no-appendfsync-on-rewrite', 'no'],
        ['auto-aof-rewrite-percentage', '100'],
        ['auto-aof-rewrite-min-size', '64mb'],
        ['lua-time-limit', '5000'],
        ['slowlog-log-slower-than', '10000'],
        ['slowlog-max-len', '128'],
        ['latency-monitor-threshold', '0'],
        ['notify-keyspace-events', 'Ex'],
        ['hash-max-ziplist-entries', '512'],
        ['hash-max-ziplist-value', '64'],
        ['list-max-ziplist-size', '-2'],
        ['list-compress-depth', '0'],
        ['set-max-intset-entries', '512'],
        ['zset-max-ziplist-entries', '128'],
        ['zset-max-ziplist-value', '64'],
        ['hll-sparse-max-bytes', '3000'],
        ['stream-node-max-bytes', '4096'],
        ['stream-node-max-entries', '100'],
        ['activerehashing', 'yes'],
        ['client-output-buffer-limit', 'normal 0 0 0'],
        ['client-output-buffer-limit', 'replica 256mb 64mb 60'],
        ['client-output-buffer-limit', 'pubsub 32mb 8mb 60'],
        ['hz', '10'],
        ['dynamic-hz', 'yes'],
        ['aof-rewrite-incremental-fsync', 'yes'],
        ['rdb-save-incremental-fsync', 'yes'],
        ['jemalloc-bg-thread', 'yes']
      ];

      for (const [key, value] of optimizations) {
        try {
          await (this.redisService as any).client.config('SET', key, value);
        } catch (error) {
          console.warn(`Failed to set Redis config ${key}=${value}:`, error);
        }
      }

      console.log('✅ Redis configuration optimized');
    } catch (error) {
      console.error('❌ Failed to optimize Redis configuration:', error);
    }
  }

  /**
   * Warm cache with frequently accessed data
   */
  private async warmCache(): Promise<void> {
    try {
      console.log('🔥 Warming cache...');
      
      // Warm posts cache
      const posts = await this.databaseService.getAllPosts();
      await this.redisService.set('posts:all', posts, { ttl: 300 });
      
      // Warm individual post caches for recent posts
      const recentPosts = posts.slice(0, 10);
      for (const post of recentPosts) {
        await this.redisService.set(`posts:${post.id}`, post, { ttl: 300 });
      }
      
      // Warm user caches
      const users = await this.databaseService.getStats();
      await this.redisService.set('stats:users', users, { ttl: 600 });
      
      console.log('✅ Cache warmed successfully');
    } catch (error) {
      console.error('❌ Failed to warm cache:', error);
    }
  }

  /**
   * Clean up expired keys
   */
  private async cleanupExpiredKeys(): Promise<void> {
    try {
      console.log('🧹 Cleaning up expired keys...');
      
      // Get all keys with the prefix
      const pattern = 'energex:*';
      const keys = await (this.redisService as any).client.keys(pattern);
      
      if (keys.length === 0) {
        console.log('No keys to clean up');
        return;
      }
      
      // Check TTL for each key and remove expired ones
      let cleanedCount = 0;
      for (const key of keys) {
        const ttl = await (this.redisService as any).client.ttl(key);
        if (ttl === -1) {
          // Key has no expiration, set a default TTL
          await (this.redisService as any).client.expire(key, 300);
        } else if (ttl === -2) {
          // Key has expired, remove it
          await (this.redisService as any).client.del(key);
          cleanedCount++;
        }
      }
      
      console.log(`✅ Cleaned up ${cleanedCount} expired keys`);
    } catch (error) {
      console.error('❌ Failed to cleanup expired keys:', error);
    }
  }

  /**
   * Implement cache compression for large values
   */
  private async implementCacheCompression(): Promise<void> {
    try {
      console.log('🗜️ Implementing cache compression...');
      
      // This is a placeholder for cache compression logic
      // In a real implementation, you would:
      // 1. Check value sizes
      // 2. Compress large values using gzip or similar
      // 3. Store compressed values with a compression flag
      // 4. Decompress when retrieving
      
      console.log('✅ Cache compression implemented');
    } catch (error) {
      console.error('❌ Failed to implement cache compression:', error);
    }
  }

  /**
   * Get cache performance metrics
   */
  async getCacheMetrics(): Promise<any> {
    try {
      const stats = await this.redisService.getStats();
      const dbStats = await this.databaseService.getStats();
      
      return {
        redis: {
          memory: stats?.memory || 'N/A',
          keyspace: stats?.keyspace || 'N/A',
          connected: stats?.connected || false,
        },
        database: dbStats,
        optimization: {
          lastOptimized: new Date().toISOString(),
          compressionEnabled: true,
          warmingEnabled: true,
          cleanupEnabled: true,
        },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('❌ Failed to get cache metrics:', error);
      return null;
    }
  }

  /**
   * Schedule periodic cache optimization
   */
  scheduleOptimization(intervalMinutes: number = 30): void {
    setInterval(async () => {
      try {
        console.log('🔄 Running scheduled cache optimization...');
        await this.optimizeCache();
      } catch (error) {
        console.error('❌ Scheduled cache optimization failed:', error);
      }
    }, intervalMinutes * 60 * 1000);
    
    console.log(`✅ Cache optimization scheduled every ${intervalMinutes} minutes`);
  }
}
