import request from 'supertest';
import { app } from '../src/index';
import { RedisService } from '../src/services/RedisService';
import { DatabaseService } from '../src/services/DatabaseService';

// Mock services
jest.mock('../src/services/RedisService');
jest.mock('../src/services/DatabaseService');

const MockedRedisService = RedisService as jest.MockedClass<typeof RedisService>;
const MockedDatabaseService = DatabaseService as jest.MockedClass<typeof DatabaseService>;

describe('Cache API', () => {
  let mockRedisService: jest.Mocked<RedisService>;
  let mockDatabaseService: jest.Mocked<DatabaseService>;

  beforeEach(() => {
    mockRedisService = new MockedRedisService() as jest.Mocked<RedisService>;
    mockDatabaseService = new MockedDatabaseService() as jest.Mocked<DatabaseService>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /cache/posts', () => {
    it('should return cached posts when available', async () => {
      const mockPosts = [
        {
          id: 1,
          title: 'Test Post 1',
          content: 'Test content 1',
          user_id: 1,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        }
      ];

      mockRedisService.get.mockResolvedValue(mockPosts);

      const response = await request(app)
        .get('/cache/posts')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: mockPosts,
        cached: true,
        timestamp: expect.any(String)
      });

      expect(mockRedisService.get).toHaveBeenCalledWith('posts:all');
      expect(mockDatabaseService.getAllPosts).not.toHaveBeenCalled();
    });

    it('should fetch from database when cache miss', async () => {
      const mockPosts = [
        {
          id: 1,
          title: 'Test Post 1',
          content: 'Test content 1',
          user_id: 1,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        }
      ];

      mockRedisService.get.mockResolvedValue(null);
      mockDatabaseService.getAllPosts.mockResolvedValue(mockPosts);
      mockRedisService.set.mockResolvedValue(true);

      const response = await request(app)
        .get('/cache/posts')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: mockPosts,
        cached: false,
        timestamp: expect.any(String)
      });

      expect(mockRedisService.get).toHaveBeenCalledWith('posts:all');
      expect(mockDatabaseService.getAllPosts).toHaveBeenCalled();
      expect(mockRedisService.set).toHaveBeenCalledWith('posts:all', mockPosts, { ttl: 300 });
    });

    it('should handle database errors', async () => {
      mockRedisService.get.mockResolvedValue(null);
      mockDatabaseService.getAllPosts.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .get('/cache/posts')
        .expect(500);

      expect(response.body).toEqual({
        success: false,
        message: 'Internal server error',
        error: 'Database error'
      });
    });
  });

  describe('GET /cache/posts/:id', () => {
    it('should return cached post when available', async () => {
      const mockPost = {
        id: 1,
        title: 'Test Post 1',
        content: 'Test content 1',
        user_id: 1,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      };

      mockRedisService.get.mockResolvedValue(mockPost);

      const response = await request(app)
        .get('/cache/posts/1')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: mockPost,
        cached: true,
        timestamp: expect.any(String)
      });

      expect(mockRedisService.get).toHaveBeenCalledWith('posts:1');
      expect(mockDatabaseService.getPostById).not.toHaveBeenCalled();
    });

    it('should fetch from database when cache miss', async () => {
      const mockPost = {
        id: 1,
        title: 'Test Post 1',
        content: 'Test content 1',
        user_id: 1,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      };

      mockRedisService.get.mockResolvedValue(null);
      mockDatabaseService.getPostById.mockResolvedValue(mockPost);
      mockRedisService.set.mockResolvedValue(true);

      const response = await request(app)
        .get('/cache/posts/1')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: mockPost,
        cached: false,
        timestamp: expect.any(String)
      });

      expect(mockRedisService.get).toHaveBeenCalledWith('posts:1');
      expect(mockDatabaseService.getPostById).toHaveBeenCalledWith(1);
      expect(mockRedisService.set).toHaveBeenCalledWith('posts:1', mockPost, { ttl: 300 });
    });

    it('should return 404 when post not found', async () => {
      mockRedisService.get.mockResolvedValue(null);
      mockDatabaseService.getPostById.mockResolvedValue(null);

      const response = await request(app)
        .get('/cache/posts/999')
        .expect(404);

      expect(response.body).toEqual({
        success: false,
        message: 'Post not found'
      });
    });

    it('should return 400 for invalid post ID', async () => {
      const response = await request(app)
        .get('/cache/posts/invalid')
        .expect(400);

      expect(response.body).toEqual({
        success: false,
        message: 'Invalid post ID'
      });
    });
  });

  describe('DELETE /cache/posts', () => {
    it('should invalidate all post cache', async () => {
      mockRedisService.flushPattern.mockResolvedValue(5);

      const response = await request(app)
        .delete('/cache/posts')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        message: 'Cache invalidated for 5 post entries',
        deletedCount: 5
      });

      expect(mockRedisService.flushPattern).toHaveBeenCalledWith('posts:*');
    });
  });

  describe('DELETE /cache/posts/:id', () => {
    it('should invalidate specific post cache', async () => {
      mockRedisService.del.mockResolvedValue(true);

      const response = await request(app)
        .delete('/cache/posts/1')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        message: 'Cache invalidated for post',
        deleted: true
      });

      expect(mockRedisService.del).toHaveBeenCalledWith('posts:1');
    });

    it('should handle post not found in cache', async () => {
      mockRedisService.del.mockResolvedValue(false);

      const response = await request(app)
        .delete('/cache/posts/1')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        message: 'Post not found in cache',
        deleted: false
      });
    });
  });

  describe('GET /cache/stats', () => {
    it('should return cache statistics', async () => {
      const mockRedisStats = {
        memory: 'used_memory:1024000',
        keyspace: 'db0:keys=10',
        connected: true
      };

      const mockDbStats = {
        posts: 5,
        users: 3,
        connected: true
      };

      mockRedisService.getStats.mockResolvedValue(mockRedisStats);
      mockDatabaseService.getStats.mockResolvedValue(mockDbStats);

      const response = await request(app)
        .get('/cache/stats')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: {
          redis: mockRedisStats,
          database: mockDbStats,
          timestamp: expect.any(String)
        }
      });
    });
  });

  describe('POST /cache/optimize', () => {
    it('should optimize Redis cache', async () => {
      mockRedisService.optimize.mockResolvedValue();

      const response = await request(app)
        .post('/cache/optimize')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        message: 'Redis optimization applied successfully'
      });

      expect(mockRedisService.optimize).toHaveBeenCalled();
    });
  });
});
