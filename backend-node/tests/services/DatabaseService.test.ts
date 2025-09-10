import { DatabaseService } from '../../src/services/DatabaseService';

// Mock mysql2
jest.mock('mysql2/promise', () => ({
  createPool: jest.fn(() => ({
    getConnection: jest.fn(),
    execute: jest.fn(),
    end: jest.fn(),
  })),
}));

describe('DatabaseService', () => {
  let databaseService: DatabaseService;
  let mockPool: any;

  beforeEach(() => {
    const mysql = require('mysql2/promise');
    mockPool = {
      getConnection: jest.fn(),
      execute: jest.fn(),
      end: jest.fn(),
    };
    mysql.createPool.mockReturnValue(mockPool);
    
    databaseService = new DatabaseService();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('connect', () => {
    it('should connect to database successfully', async () => {
      const mockConnection = {
        release: jest.fn(),
      };
      mockPool.getConnection.mockResolvedValue(mockConnection);

      await databaseService.connect();

      expect(mockPool.getConnection).toHaveBeenCalled();
      expect(mockConnection.release).toHaveBeenCalled();
    });

    it('should handle connection errors', async () => {
      const error = new Error('Connection failed');
      mockPool.getConnection.mockRejectedValue(error);

      await expect(databaseService.connect()).rejects.toThrow('Connection failed');
    });
  });

  describe('disconnect', () => {
    it('should disconnect from database successfully', async () => {
      mockPool.end.mockResolvedValue(undefined);

      await databaseService.disconnect();

      expect(mockPool.end).toHaveBeenCalled();
    });
  });

  describe('getAllPosts', () => {
    it('should fetch all posts with user information', async () => {
      const mockRows = [
        {
          id: 1,
          title: 'Test Post',
          content: 'Test content',
          user_id: 1,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
          user_name: 'John Doe',
          user_email: 'john@example.com',
          user_role: 'user',
        },
      ];

      mockPool.execute.mockResolvedValue([mockRows]);

      const result = await databaseService.getAllPosts();

      expect(result).toEqual([
        {
          id: 1,
          title: 'Test Post',
          content: 'Test content',
          user_id: 1,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
          user: {
            id: 1,
            name: 'John Doe',
            email: 'john@example.com',
            role: 'user',
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
          },
        },
      ]);
    });

    it('should handle database errors', async () => {
      const error = new Error('Database error');
      mockPool.execute.mockRejectedValue(error);

      await expect(databaseService.getAllPosts()).rejects.toThrow('Database error');
    });
  });

  describe('getPostById', () => {
    it('should fetch single post by ID', async () => {
      const mockRows = [
        {
          id: 1,
          title: 'Test Post',
          content: 'Test content',
          user_id: 1,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
          user_name: 'John Doe',
          user_email: 'john@example.com',
          user_role: 'user',
        },
      ];

      mockPool.execute.mockResolvedValue([mockRows]);

      const result = await databaseService.getPostById(1);

      expect(result).toEqual({
        id: 1,
        title: 'Test Post',
        content: 'Test content',
        user_id: 1,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        user: {
          id: 1,
          name: 'John Doe',
          email: 'john@example.com',
          role: 'user',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
      });
    });

    it('should return null when post not found', async () => {
      mockPool.execute.mockResolvedValue([[]]);

      const result = await databaseService.getPostById(999);

      expect(result).toBeNull();
    });
  });

  describe('createPost', () => {
    it('should create a new post', async () => {
      const mockInsertResult = { insertId: 1 };
      const mockSelectRows = [
        {
          id: 1,
          title: 'New Post',
          content: 'New content',
          user_id: 1,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
          user_name: 'John Doe',
          user_email: 'john@example.com',
          user_role: 'user',
        },
      ];

      mockPool.execute
        .mockResolvedValueOnce([mockInsertResult])
        .mockResolvedValueOnce([mockSelectRows]);

      const postData = {
        title: 'New Post',
        content: 'New content',
        user_id: 1,
      };

      const result = await databaseService.createPost(postData);

      expect(result).toEqual({
        id: 1,
        title: 'New Post',
        content: 'New content',
        user_id: 1,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        user: {
          id: 1,
          name: 'John Doe',
          email: 'john@example.com',
          role: 'user',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
      });
    });
  });

  describe('updatePost', () => {
    it('should update an existing post', async () => {
      const mockUpdateResult = { affectedRows: 1 };
      const mockSelectRows = [
        {
          id: 1,
          title: 'Updated Post',
          content: 'Updated content',
          user_id: 1,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
          user_name: 'John Doe',
          user_email: 'john@example.com',
          user_role: 'user',
        },
      ];

      mockPool.execute
        .mockResolvedValueOnce([mockUpdateResult])
        .mockResolvedValueOnce([mockSelectRows]);

      const updates = {
        title: 'Updated Post',
        content: 'Updated content',
      };

      const result = await databaseService.updatePost(1, updates);

      expect(result).toEqual({
        id: 1,
        title: 'Updated Post',
        content: 'Updated content',
        user_id: 1,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        user: {
          id: 1,
          name: 'John Doe',
          email: 'john@example.com',
          role: 'user',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
      });
    });
  });

  describe('deletePost', () => {
    it('should delete a post', async () => {
      const mockResult = { affectedRows: 1 };
      mockPool.execute.mockResolvedValue([mockResult]);

      const result = await databaseService.deletePost(1);

      expect(result).toBe(true);
    });

    it('should return false when post not found', async () => {
      const mockResult = { affectedRows: 0 };
      mockPool.execute.mockResolvedValue([mockResult]);

      const result = await databaseService.deletePost(999);

      expect(result).toBe(false);
    });
  });

  describe('getStats', () => {
    it('should return database statistics', async () => {
      const mockPostCount = [{ count: 5 }];
      const mockUserCount = [{ count: 3 }];

      mockPool.execute
        .mockResolvedValueOnce([mockPostCount])
        .mockResolvedValueOnce([mockUserCount]);

      const result = await databaseService.getStats();

      expect(result).toEqual({
        posts: 5,
        users: 3,
        connected: true,
      });
    });
  });
});
