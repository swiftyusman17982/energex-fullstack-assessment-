# API Documentation

This document provides comprehensive API documentation for the Energex Full-Stack Assessment application.

## Base URLs

- **Lumen API**: `http://localhost:8000/api`
- **Node.js Cache Service**: `http://localhost:3001/cache`
- **GraphQL Endpoint**: `http://localhost:8000/graphql`
- **WebSocket Service**: `http://localhost:3001/ws`

## Authentication

The application uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## REST API Endpoints

### Authentication Endpoints

#### Register User
```http
POST /api/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    },
    "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
    "token_type": "bearer",
    "expires_in": 3600
  }
}
```

#### Login User
```http
POST /api/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user"
    },
    "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
    "token_type": "bearer",
    "expires_in": 3600
  }
}
```

#### Get User Profile
```http
GET /api/me
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

#### Logout User
```http
POST /api/logout
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Successfully logged out"
}
```

#### Refresh Token
```http
POST /api/refresh
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
    "token_type": "bearer",
    "expires_in": 3600
  }
}
```

### Posts Endpoints

#### Get All Posts
```http
GET /api/posts
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Welcome to Energex Assessment",
      "content": "This is the first post...",
      "user_id": 1,
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z",
      "user": {
        "id": 1,
        "name": "John Doe",
        "email": "john@example.com",
        "role": "user"
      }
    }
  ],
  "cached": true
}
```

#### Get Single Post
```http
GET /api/posts/{id}
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Welcome to Energex Assessment",
    "content": "This is the first post...",
    "user_id": 1,
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z",
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user"
    }
  },
  "cached": true
}
```

#### Create Post
```http
POST /api/posts
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "New Post Title",
  "content": "This is the content of the new post."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Post created successfully",
  "data": {
    "id": 2,
    "title": "New Post Title",
    "content": "This is the content of the new post.",
    "user_id": 1,
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z",
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user"
    }
  }
}
```

#### Update Post
```http
PUT /api/posts/{id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Updated Post Title",
  "content": "Updated content of the post."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Post updated successfully",
  "data": {
    "id": 1,
    "title": "Updated Post Title",
    "content": "Updated content of the post.",
    "user_id": 1,
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z",
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user"
    }
  }
}
```

#### Delete Post
```http
DELETE /api/posts/{id}
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Post deleted successfully"
}
```

## GraphQL API

### Endpoints
- `GET /graphql` - Public GraphQL endpoint
- `POST /graphql` - Public GraphQL endpoint
- `GET /graphql/protected` - Protected GraphQL endpoint (requires auth)
- `POST /graphql/protected` - Protected GraphQL endpoint (requires auth)

### Schema

```graphql
type User {
  id: ID!
  name: String!
  email: String!
  role: UserRole!
  createdAt: String!
  posts: [Post!]!
}

type Post {
  id: ID!
  title: String!
  content: String!
  createdAt: String!
  updatedAt: String!
  author: User!
}

type AuthPayload {
  token: String!
  user: User!
}

type PostPayload {
  post: Post
  success: Boolean!
  message: String
}

type DeletePayload {
  success: Boolean!
  message: String!
}

enum UserRole {
  ADMIN
  USER
}

type Query {
  posts: [Post!]!
  post(id: ID!): Post
  me: User
}

type Mutation {
  createPost(title: String!, content: String!): PostPayload!
  updatePost(id: ID!, title: String, content: String): PostPayload!
  deletePost(id: ID!): DeletePayload!
}
```

### Example Queries

#### Get All Posts
```graphql
query {
  posts {
    id
    title
    content
    createdAt
    author {
      id
      name
      email
      role
    }
  }
}
```

#### Get Single Post
```graphql
query {
  post(id: 1) {
    id
    title
    content
    createdAt
    author {
      id
      name
      email
    }
  }
}
```

#### Get Current User
```graphql
query {
  me {
    id
    name
    email
    role
  }
}
```

### Example Mutations

#### Create Post
```graphql
mutation {
  createPost(title: "New Post", content: "Post content") {
    post {
      id
      title
      content
      createdAt
    }
    success
    message
  }
}
```

#### Update Post
```graphql
mutation {
  updatePost(id: 1, title: "Updated Title") {
    post {
      id
      title
      content
    }
    success
    message
  }
}
```

#### Delete Post
```graphql
mutation {
  deletePost(id: 1) {
    success
    message
  }
}
```

## Cache Service API

### Endpoints

#### Get Cached Posts
```http
GET /cache/posts
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Welcome to Energex Assessment",
      "content": "This is the first post...",
      "user_id": 1,
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z",
      "user": {
        "id": 1,
        "name": "John Doe",
        "email": "john@example.com",
        "role": "user"
      }
    }
  ],
  "cached": true,
  "timestamp": "2024-01-01T00:00:00Z"
}
```

#### Get Cached Single Post
```http
GET /cache/posts/{id}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Welcome to Energex Assessment",
    "content": "This is the first post...",
    "user_id": 1,
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z",
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user"
    }
  },
  "cached": true,
  "timestamp": "2024-01-01T00:00:00Z"
}
```

#### Invalidate All Post Cache
```http
DELETE /cache/posts
```

**Response:**
```json
{
  "success": true,
  "message": "Cache invalidated for 5 post entries",
  "deletedCount": 5
}
```

#### Invalidate Specific Post Cache
```http
DELETE /cache/posts/{id}
```

**Response:**
```json
{
  "success": true,
  "message": "Cache invalidated for post",
  "deleted": true
}
```

#### Get Cache Statistics
```http
GET /cache/stats
```

**Response:**
```json
{
  "success": true,
  "data": {
    "redis": {
      "memory": "used_memory:1024000",
      "keyspace": "db0:keys=10",
      "connected": true
    },
    "database": {
      "posts": 5,
      "users": 3,
      "connected": true
    },
    "timestamp": "2024-01-01T00:00:00Z"
  }
}
```

#### Optimize Redis Cache
```http
POST /cache/optimize
```

**Response:**
```json
{
  "success": true,
  "message": "Redis optimization applied successfully"
}
```

## WebSocket API

### Connection
Connect to WebSocket at: `ws://localhost:3001`

### Events

#### Client Events (Send to Server)

##### Join Room
```javascript
socket.emit('join_room', 'room_name');
```

##### Leave Room
```javascript
socket.emit('leave_room', 'room_name');
```

##### Custom Event
```javascript
socket.emit('custom_event', { data: 'value' });
```

#### Server Events (Receive from Server)

##### Welcome Message
```javascript
socket.on('welcome', (data) => {
  console.log('Welcome:', data);
});
```

##### New Post
```javascript
socket.on('new_post', (data) => {
  console.log('New post:', data);
});
```

##### Post Updated
```javascript
socket.on('post_updated', (data) => {
  console.log('Post updated:', data);
});
```

##### Post Deleted
```javascript
socket.on('post_deleted', (data) => {
  console.log('Post deleted:', data);
});
```

##### System Message
```javascript
socket.on('system_message', (data) => {
  console.log('System message:', data);
});
```

##### Cache Stats
```javascript
socket.on('cache_stats', (data) => {
  console.log('Cache stats:', data);
});
```

##### Database Stats
```javascript
socket.on('database_stats', (data) => {
  console.log('Database stats:', data);
});
```

### WebSocket HTTP Endpoints

#### Get Connection Info
```http
GET /ws/connect
```

#### Broadcast Message
```http
POST /ws/broadcast
Content-Type: application/json

{
  "type": "announcement",
  "data": {
    "message": "System maintenance in 10 minutes"
  }
}
```

#### Get Connected Clients
```http
GET /ws/clients
```

#### Join Room
```http
POST /ws/rooms/{room}/join
Content-Type: application/json

{
  "clientId": "client-123"
}
```

#### Leave Room
```http
POST /ws/rooms/{room}/leave
Content-Type: application/json

{
  "clientId": "client-123"
}
```

#### Send Room Message
```http
POST /ws/rooms/{room}/message
Content-Type: application/json

{
  "message": "Hello room!",
  "type": "message"
}
```

#### Send Client Message
```http
POST /ws/clients/{clientId}/message
Content-Type: application/json

{
  "message": "Hello client!",
  "type": "message"
}
```

## Error Responses

### Standard Error Format
```json
{
  "success": false,
  "message": "Error description",
  "errors": {
    "field": ["Validation error message"]
  }
}
```

### HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `422` - Validation Error
- `500` - Internal Server Error

### Common Error Messages

#### Authentication Errors
```json
{
  "success": false,
  "message": "Unauthorized"
}
```

```json
{
  "success": false,
  "message": "Token has expired"
}
```

```json
{
  "success": false,
  "message": "Invalid credentials"
}
```

#### Validation Errors
```json
{
  "success": false,
  "message": "Validation errors",
  "errors": {
    "email": ["The email field is required."],
    "password": ["The password must be at least 6 characters."]
  }
}
```

#### Permission Errors
```json
{
  "success": false,
  "message": "Insufficient permissions to update this post"
}
```

## Rate Limiting

The API implements rate limiting:

- **General API**: 100 requests per 15 minutes per IP
- **Login endpoint**: 5 requests per minute per IP

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 99
X-RateLimit-Reset: 1640995200
```

## CORS

The API supports CORS with the following configuration:

- **Allowed Origins**: `*` (all origins)
- **Allowed Methods**: `GET, POST, PUT, DELETE, OPTIONS`
- **Allowed Headers**: `Content-Type, Authorization, X-Requested-With`
- **Credentials**: `true`

## Pagination

For endpoints that return lists, pagination can be implemented:

```http
GET /api/posts?page=1&limit=10
```

**Response:**
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "current_page": 1,
    "per_page": 10,
    "total": 50,
    "last_page": 5,
    "from": 1,
    "to": 10
  }
}
```

## Health Checks

### Lumen API Health
```http
GET http://localhost:8000/
```

### Node.js Cache Service Health
```http
GET http://localhost:3001/health
```

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00Z",
  "uptime": 3600,
  "memory": {
    "rss": 50331648,
    "heapTotal": 20971520,
    "heapUsed": 15728640,
    "external": 1048576
  },
  "version": "1.0.0"
}
```

### Frontend Health
```http
GET http://localhost:3000/health
```
