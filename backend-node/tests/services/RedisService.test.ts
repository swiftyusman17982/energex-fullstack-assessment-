import { RedisService } from '../../src/services/RedisService';

// Mock ioredis
jest.mock('ioredis', () => {
  return jest.fn().mockImplementation(() => ({
    connect: jest.fn(),
    quit: jest.fn(),
    get: jest.fn(),
    setex: jest.fn(),
    del: jest.fn(),
    exists: jest.fn(),
    keys: jest.fn(),
    info: jest.fn(),
    config: jest.fn(),
    on: jest.fn(),
    status: 'ready'
  }));
});

describe('RedisService', () => {
  let redisService: RedisService;
  let mockRedisClient: any;

  beforeEach(() => {
    redisService = new RedisService();
    mockRedisClient = (redisService as any).client;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('connect', () => {
    it('should connect to Redis successfully', async () => {
      mockRedisClient.connect.mockResolvedValue(undefined);

      await redisService.connect();

      expect(mockRedisClient.connect).toHaveBeenCalled();
    });

    it('should handle connection errors', async () => {
      const error = new Error('Connection failed');
      mockRedisClient.connect.mockRejectedValue(error);

      await expect(redisService.connect()).rejects.toThrow('Connection failed');
    });
  });

  describe('disconnect', () => {
    it('should disconnect from Redis successfully', async () => {
      mockRedisClient.quit.mockResolvedValue(undefined);

      await redisService.disconnect();

      expect(mockRedisClient.quit).toHaveBeenCalled();
    });
  });

  describe('get', () => {
    it('should get value from Redis', async () => {
      const mockValue = { id: 1, name: 'test' };
      mockRedisClient.get.mockResolvedValue(JSON.stringify(mockValue));

      const result = await redisService.get('test-key');

      expect(result).toEqual(mockValue);
      expect(mockRedisClient.get).toHaveBeenCalledWith('energex:test-key');
    });

    it('should return null when key does not exist', async () => {
      mockRedisClient.get.mockResolvedValue(null);

      const result = await redisService.get('non-existent-key');

      expect(result).toBeNull();
    });

    it('should handle Redis errors', async () => {
      mockRedisClient.get.mockRejectedValue(new Error('Redis error'));

      const result = await redisService.get('test-key');

      expect(result).toBeNull();
    });
  });

  describe('set', () => {
    it('should set value in Redis with default TTL', async () => {
      const mockValue = { id: 1, name: 'test' };
      mockRedisClient.setex.mockResolvedValue('OK');

      const result = await redisService.set('test-key', mockValue);

      expect(result).toBe(true);
      expect(mockRedisClient.setex).toHaveBeenCalledWith(
        'energex:test-key',
        300,
        JSON.stringify(mockValue)
      );
    });

    it('should set value in Redis with custom TTL', async () => {
      const mockValue = { id: 1, name: 'test' };
      mockRedisClient.setex.mockResolvedValue('OK');

      const result = await redisService.set('test-key', mockValue, { ttl: 600 });

      expect(result).toBe(true);
      expect(mockRedisClient.setex).toHaveBeenCalledWith(
        'energex:test-key',
        600,
        JSON.stringify(mockValue)
      );
    });

    it('should handle Redis errors', async () => {
      mockRedisClient.setex.mockRejectedValue(new Error('Redis error'));

      const result = await redisService.set('test-key', { id: 1 });

      expect(result).toBe(false);
    });
  });

  describe('del', () => {
    it('should delete key from Redis', async () => {
      mockRedisClient.del.mockResolvedValue(1);

      const result = await redisService.del('test-key');

      expect(result).toBe(true);
      expect(mockRedisClient.del).toHaveBeenCalledWith('energex:test-key');
    });

    it('should return false when key does not exist', async () => {
      mockRedisClient.del.mockResolvedValue(0);

      const result = await redisService.del('non-existent-key');

      expect(result).toBe(false);
    });
  });

  describe('exists', () => {
    it('should check if key exists in Redis', async () => {
      mockRedisClient.exists.mockResolvedValue(1);

      const result = await redisService.exists('test-key');

      expect(result).toBe(true);
      expect(mockRedisClient.exists).toHaveBeenCalledWith('energex:test-key');
    });

    it('should return false when key does not exist', async () => {
      mockRedisClient.exists.mockResolvedValue(0);

      const result = await redisService.exists('non-existent-key');

      expect(result).toBe(false);
    });
  });

  describe('flushPattern', () => {
    it('should flush keys matching pattern', async () => {
      const mockKeys = ['energex:posts:1', 'energex:posts:2'];
      mockRedisClient.keys.mockResolvedValue(mockKeys);
      mockRedisClient.del.mockResolvedValue(2);

      const result = await redisService.flushPattern('posts:*');

      expect(result).toBe(2);
      expect(mockRedisClient.keys).toHaveBeenCalledWith('energex:posts:*');
      expect(mockRedisClient.del).toHaveBeenCalledWith(...mockKeys);
    });

    it('should return 0 when no keys match pattern', async () => {
      mockRedisClient.keys.mockResolvedValue([]);

      const result = await redisService.flushPattern('non-existent:*');

      expect(result).toBe(0);
    });
  });

  describe('getStats', () => {
    it('should get Redis statistics', async () => {
      const mockMemoryInfo = 'used_memory:1024000';
      const mockKeyspaceInfo = 'db0:keys=10';
      
      mockRedisClient.info.mockResolvedValueOnce(mockMemoryInfo);
      mockRedisClient.info.mockResolvedValueOnce(mockKeyspaceInfo);

      const result = await redisService.getStats();

      expect(result).toEqual({
        memory: mockMemoryInfo,
        keyspace: mockKeyspaceInfo,
        connected: true
      });
    });
  });

  describe('optimize', () => {
    it('should optimize Redis configuration', async () => {
      mockRedisClient.config.mockResolvedValue('OK');

      await redisService.optimize();

      expect(mockRedisClient.config).toHaveBeenCalledWith('SET', 'maxmemory-policy', 'allkeys-lru');
      expect(mockRedisClient.config).toHaveBeenCalledWith('SET', 'maxmemory', '100mb');
    });
  });
});
