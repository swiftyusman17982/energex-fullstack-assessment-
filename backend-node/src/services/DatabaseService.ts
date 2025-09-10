import mysql from 'mysql2/promise';
import { DatabaseConfig, Post, User } from '../types';

export class DatabaseService {
  private pool: mysql.Pool;
  private config: DatabaseConfig;

  constructor() {
    this.config = {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306'),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'energex_db'
    };

    this.pool = mysql.createPool({
      host: this.config.host,
      port: this.config.port,
      user: this.config.user,
      password: this.config.password,
      database: this.config.database,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      connectTimeout: 60000,
      charset: 'utf8mb4'
    });
  }

  async connect(): Promise<void> {
    try {
      const connection = await this.pool.getConnection();
      console.log('✅ Database connected successfully');
      connection.release();
    } catch (error) {
      console.error('❌ Failed to connect to database:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    try {
      await this.pool.end();
      console.log('✅ Database disconnected');
    } catch (error) {
      console.error('❌ Error disconnecting from database:', error);
    }
  }

  async getAllPosts(): Promise<Post[]> {
    try {
      const [rows] = await this.pool.execute(`
        SELECT 
          p.id,
          p.title,
          p.content,
          p.user_id,
          p.created_at,
          p.updated_at,
          u.name as user_name,
          u.email as user_email,
          u.role as user_role
        FROM posts p
        LEFT JOIN users u ON p.user_id = u.id
        ORDER BY p.created_at DESC
      `);

      return (rows as any[]).map(row => ({
        id: row.id,
        title: row.title,
        content: row.content,
        user_id: row.user_id,
        created_at: row.created_at,
        updated_at: row.updated_at,
        user: {
          id: row.user_id,
          name: row.user_name,
          email: row.user_email,
          role: row.user_role,
          created_at: row.created_at,
          updated_at: row.updated_at
        }
      }));
    } catch (error) {
      console.error('❌ Error fetching all posts:', error);
      throw error;
    }
  }

  async getPostById(id: number): Promise<Post | null> {
    try {
      const [rows] = await this.pool.execute(`
        SELECT 
          p.id,
          p.title,
          p.content,
          p.user_id,
          p.created_at,
          p.updated_at,
          u.name as user_name,
          u.email as user_email,
          u.role as user_role
        FROM posts p
        LEFT JOIN users u ON p.user_id = u.id
        WHERE p.id = ?
      `, [id]);

      const row = (rows as any[])[0];
      if (!row) {
        return null;
      }

      return {
        id: row.id,
        title: row.title,
        content: row.content,
        user_id: row.user_id,
        created_at: row.created_at,
        updated_at: row.updated_at,
        user: {
          id: row.user_id,
          name: row.user_name,
          email: row.user_email,
          role: row.user_role,
          created_at: row.created_at,
          updated_at: row.updated_at
        }
      };
    } catch (error) {
      console.error('❌ Error fetching post by ID:', error);
      throw error;
    }
  }

  async createPost(post: Omit<Post, 'id' | 'created_at' | 'updated_at'>): Promise<Post> {
    try {
      const [result] = await this.pool.execute(`
        INSERT INTO posts (title, content, user_id)
        VALUES (?, ?, ?)
      `, [post.title, post.content, post.user_id]);

      const insertId = (result as any).insertId;
      const newPost = await this.getPostById(insertId);
      
      if (!newPost) {
        throw new Error('Failed to retrieve created post');
      }

      return newPost;
    } catch (error) {
      console.error('❌ Error creating post:', error);
      throw error;
    }
  }

  async updatePost(id: number, updates: Partial<Post>): Promise<Post | null> {
    try {
      const fields = [];
      const values = [];

      if (updates.title) {
        fields.push('title = ?');
        values.push(updates.title);
      }
      if (updates.content) {
        fields.push('content = ?');
        values.push(updates.content);
      }

      if (fields.length === 0) {
        return await this.getPostById(id);
      }

      values.push(id);

      await this.pool.execute(`
        UPDATE posts 
        SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `, values);

      return await this.getPostById(id);
    } catch (error) {
      console.error('❌ Error updating post:', error);
      throw error;
    }
  }

  async deletePost(id: number): Promise<boolean> {
    try {
      const [result] = await this.pool.execute(`
        DELETE FROM posts WHERE id = ?
      `, [id]);

      return (result as any).affectedRows > 0;
    } catch (error) {
      console.error('❌ Error deleting post:', error);
      throw error;
    }
  }

  async getUserById(id: number): Promise<User | null> {
    try {
      const [rows] = await this.pool.execute(`
        SELECT id, name, email, role, created_at, updated_at
        FROM users
        WHERE id = ?
      `, [id]);

      const row = (rows as any[])[0];
      return row ? {
        id: row.id,
        name: row.name,
        email: row.email,
        role: row.role,
        created_at: row.created_at,
        updated_at: row.updated_at
      } : null;
    } catch (error) {
      console.error('❌ Error fetching user by ID:', error);
      throw error;
    }
  }

  async getStats(): Promise<any> {
    try {
      const [postCount] = await this.pool.execute('SELECT COUNT(*) as count FROM posts');
      const [userCount] = await this.pool.execute('SELECT COUNT(*) as count FROM users');
      
      return {
        posts: (postCount as any[])[0].count,
        users: (userCount as any[])[0].count,
        connected: true
      };
    } catch (error) {
      console.error('❌ Error fetching database stats:', error);
      return null;
    }
  }
}
