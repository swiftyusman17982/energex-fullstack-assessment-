# Node.js Cache Service

A high-performance caching service built with Node.js, TypeScript, Redis, and MySQL. This service acts as a caching layer for the Lumen API, providing fast access to frequently requested data.

## Features

- **Redis Caching**: High-performance in-memory caching with configurable TTL
- **MySQL Integration**: Fallback to database when cache misses occur
- **WebSocket Support**: Real-time updates via Socket.IO
- **TypeScript**: Full type safety and modern JavaScript features
- **Comprehensive Testing**: Unit tests with Jest and Supertest
- **Docker Support**: Containerized deployment
- **Health Monitoring**: Built-in health checks and statistics
- **Redis Optimization**: LRU eviction policy and memory management

## API Endpoints

### Cache Operations
- `GET /cache/posts` - Get all posts (cached)
- `GET /cache/posts/:id` - Get single post (cached)
- `DELETE /cache/posts` - Invalidate all post cache
- `DELETE /cache/posts/:id` - Invalidate specific post cache

### Monitoring
- `GET /health` - Service health check
- `GET /cache/stats` - Cache and database statistics
- `POST /cache/optimize` - Optimize Redis configuration

### WebSocket Events
- `new_post` - Broadcast when a new post is created
- `post_updated` - Broadcast when a post is updated
- `post_deleted` - Broadcast when a post is deleted
- `system_message` - System notifications
- `cache_stats` - Cache statistics updates

## Installation

1. Install dependencies:
```bash
npm install
```

2. Copy environment file:
```bash
cp env.example .env
```

3. Build TypeScript:
```bash
npm run build
```

4. Start the service:
```bash
npm start
```

## Development

Start in development mode with hot reload:
```bash
npm run dev
```

## Testing

Run the test suite:
```bash
npm test
```

Run tests with coverage:
```bash
npm run test:coverage
```

Run tests in watch mode:
```bash
npm run test:watch
```

## Linting

Check code quality:
```bash
npm run lint
```

Fix linting issues:
```bash
npm run lint:fix
```

## Docker

Build and run with Docker:
```bash
docker build -t cache-service .
docker run -p 3001:3001 cache-service
```

## Configuration

### Environment Variables

- `NODE_ENV` - Environment (development/production)
- `PORT` - Service port (default: 3001)
- `DB_HOST` - MySQL host
- `DB_PORT` - MySQL port
- `DB_USER` - MySQL username
- `DB_PASSWORD` - MySQL password
- `DB_NAME` - MySQL database name
- `REDIS_HOST` - Redis host
- `REDIS_PORT` - Redis port
- `REDIS_PASSWORD` - Redis password
- `REDIS_DB` - Redis database number
- `CACHE_TTL` - Default cache TTL in seconds
- `CACHE_PREFIX` - Redis key prefix

## Architecture

The service follows a layered architecture:

1. **Controllers** - Handle HTTP requests and responses
2. **Services** - Business logic and data access
3. **Middleware** - Request/response processing
4. **Types** - TypeScript type definitions

## Performance Features

- **Connection Pooling**: Efficient database connections
- **Redis Optimization**: LRU eviction and memory management
- **Compression**: Response compression for better performance
- **Rate Limiting**: Protection against abuse
- **Health Checks**: Monitoring and alerting

## WebSocket Integration

The service includes WebSocket support for real-time features:

```javascript
const socket = io('ws://localhost:3001');

socket.on('new_post', (data) => {
  console.log('New post:', data);
});

socket.on('post_updated', (data) => {
  console.log('Post updated:', data);
});
```
