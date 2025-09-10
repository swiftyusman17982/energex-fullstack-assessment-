import Redis from 'ioredis';
import { RedisConfig, CacheOptions } from '../types';

export class RedisService {
  private client: Redis;
  private config: RedisConfig;

  constructor() {
    this.config = {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      db: parseInt(process.env.REDIS_DB || '0')
    };

    this.client = new Redis({
      host: this.config.host,
      port: this.config.port,
      password: this.config.password,
      db: this.config.db,
      maxRetriesPerRequest: 5,
      lazyConnect: true,
      keepAlive: 10000,
      connectTimeout: 10000,
      commandTimeout: 10000
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    this.client.on('connect', () => {
      console.log('✅ Redis connected successfully');
    });

    this.client.on('error', (error) => {
      console.error('❌ Redis connection error:', error);
    });

    this.client.on('close', () => {
      console.log('🔌 Redis connection closed');
    });

    this.client.on('reconnecting', () => {
      console.log('🔄 Redis reconnecting...');
    });
  }

  async connect(): Promise<void> {
    try {
      await this.client.connect();
      console.log('✅ Redis service connected');
    } catch (error) {
      console.error('❌ Failed to connect to Redis:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    try {
      await this.client.quit();
      console.log('✅ Redis service disconnected');
    } catch (error) {
      console.error('❌ Error disconnecting from Redis:', error);
    }
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.client.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('❌ Redis GET error:', error);
      return null;
    }
  }

  async set(key: string, value: any, options?: CacheOptions): Promise<boolean> {
    try {
      const ttl = options?.ttl || parseInt(process.env.CACHE_TTL || '300');
      const prefix = options?.prefix || process.env.CACHE_PREFIX || 'energex:';
      const fullKey = `${prefix}${key}`;
      
      const serializedValue = JSON.stringify(value);
      await this.client.setex(fullKey, ttl, serializedValue);
      return true;
    } catch (error) {
      console.error('❌ Redis SET error:', error);
      return false;
    }
  }

  async del(key: string): Promise<boolean> {
    try {
      const prefix = process.env.CACHE_PREFIX || 'energex:';
      const fullKey = `${prefix}${key}`;
      const result = await this.client.del(fullKey);
      return result > 0;
    } catch (error) {
      console.error('❌ Redis DEL error:', error);
      return false;
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const prefix = process.env.CACHE_PREFIX || 'energex:';
      const fullKey = `${prefix}${key}`;
      const result = await this.client.exists(fullKey);
      return result === 1;
    } catch (error) {
      console.error('❌ Redis EXISTS error:', error);
      return false;
    }
  }

  async flushPattern(pattern: string): Promise<number> {
    try {
      const prefix = process.env.CACHE_PREFIX || 'energex:';
      const fullPattern = `${prefix}${pattern}`;
      const keys = await this.client.keys(fullPattern);
      
      if (keys.length === 0) {
        return 0;
      }
      
      const result = await this.client.del(...keys);
      return result;
    } catch (error) {
      console.error('❌ Redis FLUSH PATTERN error:', error);
      return 0;
    }
  }

  async getStats(): Promise<any> {
    try {
      const info = await this.client.info('memory');
      const keyspace = await this.client.info('keyspace');
      
      return {
        memory: info,
        keyspace: keyspace,
        connected: this.client.status === 'ready'
      };
    } catch (error) {
      console.error('❌ Redis STATS error:', error);
      return null;
    }
  }

  // Optimize Redis with LRU eviction policy
  async optimize(): Promise<void> {
    try {
      // Set maxmemory policy to allkeys-lru
      await this.client.config('SET', 'maxmemory-policy', 'allkeys-lru');
      
      // Set maxmemory to 100MB (adjust based on your needs)
      await this.client.config('SET', 'maxmemory', '100mb');
      
      console.log('✅ Redis optimization applied');
    } catch (error) {
      console.error('❌ Redis optimization error:', error);
    }
  }
}
