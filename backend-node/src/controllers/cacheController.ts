import { Router, Request, Response } from 'express';
import { RedisService } from '../services/RedisService';
import { DatabaseService } from '../services/DatabaseService';
import { WebSocketService } from '../services/WebSocketService';
import { CacheResponse, Post } from '../types';

const router = Router();

// Initialize services (these would be injected in a real application)
const redisService = new RedisService();
const databaseService = new DatabaseService();

// Get all posts with caching
router.get('/posts', async (req: Request, res: Response) => {
  try {
    const cacheKey = 'posts:all';
    
    // Try to get from cache first
    const cachedPosts = await redisService.get<Post[]>(cacheKey);
    
    if (cachedPosts) {
      console.log('📦 Cache hit for all posts');
      const response: CacheResponse<Post[]> = {
        success: true,
        data: cachedPosts,
        cached: true,
        timestamp: new Date().toISOString()
      };
      return res.json(response);
    }

    // Cache miss - fetch from database
    console.log('💾 Cache miss for all posts, fetching from database');
    const posts = await databaseService.getAllPosts();
    
    // Cache the result
    await redisService.set(cacheKey, posts, { ttl: 300 }); // 5 minutes TTL
    
    const response: CacheResponse<Post[]> = {
      success: true,
      data: posts,
      cached: false,
      timestamp: new Date().toISOString()
    };
    
    return res.json(response);
  } catch (error) {
    console.error('❌ Error fetching posts:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get single post with caching
router.get('/posts/:id', async (req: Request, res: Response) => {
  try {
    const postId = parseInt(req.params.id);
    
    if (isNaN(postId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid post ID'
      });
    }

    const cacheKey = `posts:${postId}`;
    
    // Try to get from cache first
    const cachedPost = await redisService.get<Post>(cacheKey);
    
    if (cachedPost) {
      console.log(`📦 Cache hit for post ${postId}`);
      const response: CacheResponse<Post> = {
        success: true,
        data: cachedPost,
        cached: true,
        timestamp: new Date().toISOString()
      };
      return res.json(response);
    }

    // Cache miss - fetch from database
    console.log(`💾 Cache miss for post ${postId}, fetching from database`);
    const post = await databaseService.getPostById(postId);
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }
    
    // Cache the result
    await redisService.set(cacheKey, post, { ttl: 300 }); // 5 minutes TTL
    
    const response: CacheResponse<Post> = {
      success: true,
      data: post,
      cached: false,
      timestamp: new Date().toISOString()
    };
    
    return res.json(response);
  } catch (error) {
    console.error('❌ Error fetching post:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Invalidate cache for all posts
router.delete('/posts', async (req: Request, res: Response) => {
  try {
    const deletedCount = await redisService.flushPattern('posts:*');
    
    res.json({
      success: true,
      message: `Cache invalidated for ${deletedCount} post entries`,
      deletedCount
    });
  } catch (error) {
    console.error('❌ Error invalidating cache:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Invalidate cache for specific post
router.delete('/posts/:id', async (req: Request, res: Response) => {
  try {
    const postId = parseInt(req.params.id);
    
    if (isNaN(postId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid post ID'
      });
    }

    const cacheKey = `posts:${postId}`;
    const deleted = await redisService.del(cacheKey);
    
    if (!deleted) {
      return res.status(404).json({ error: 'Post not found' });
    }
    return res.json({ success: true });
  } catch (error) {
    console.error('❌ Error invalidating post cache:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get cache statistics
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const redisStats = await redisService.getStats();
    const dbStats = await databaseService.getStats();
    
    res.json({
      success: true,
      data: {
        redis: redisStats,
        database: dbStats,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('❌ Error fetching cache stats:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Optimize Redis cache
router.post('/optimize', async (req: Request, res: Response) => {
  try {
    await redisService.optimize();
    
    res.json({
      success: true,
      message: 'Redis optimization applied successfully'
    });
  } catch (error) {
    console.error('❌ Error optimizing Redis:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export { router as cacheRoutes };
