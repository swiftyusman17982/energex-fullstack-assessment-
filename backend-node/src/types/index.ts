export interface Post {
  id: number;
  title: string;
  content: string;
  user_id: number;
  created_at: string;
  updated_at: string;
  user?: User;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'user';
  created_at: string;
  updated_at: string;
}

export interface CacheResponse<T> {
  success: boolean;
  data: T;
  cached: boolean;
  timestamp: string;
}

export interface DatabaseConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
}

export interface RedisConfig {
  host: string;
  port: number;
  password?: string;
  db: number;
}

export interface CacheOptions {
  ttl?: number;
  prefix?: string;
}

export interface WebSocketMessage {
  type: string;
  data: any;
  timestamp: string;
}
