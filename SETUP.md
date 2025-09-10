# Energex Full-Stack Assessment - Setup Guide

This guide will help you set up and run the complete microservice application locally using Docker.

## Prerequisites

- Docker and Docker Compose
- Git
- Node.js 18+ (for local development)
- PHP 8.1+ (for local development)
- Composer (for PHP dependencies)

## Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd energex-backend-assessment
```

### 2. Environment Setup

Copy the environment files:

```bash
# Backend Lumen
cp backend-lumen/env.example backend-lumen/.env

# Backend Node.js
cp backend-node/env.example backend-node/.env

# Frontend React
cp frontend/.env.example frontend/.env
```

### 3. Generate Application Keys

```bash
# Generate Lumen app key
cd backend-lumen
php artisan key:generate
cd ..

# Generate JWT secret
cd backend-lumen
php artisan jwt:secret
cd ..
```

### 4. Run with Docker Compose

```bash
# Start all services
docker-compose up --build

# Or run in detached mode
docker-compose up -d --build
```

### 5. Access the Application

- **Frontend**: http://localhost:3000
- **Lumen API**: http://localhost:8000
- **Node.js Cache Service**: http://localhost:3001
- **MySQL**: localhost:3306
- **Redis**: localhost:6379

## Development Setup

### Using Development Docker Compose

For development with hot reload:

```bash
# Start development environment
docker-compose -f docker-compose.dev.yml up --build

# Or run in detached mode
docker-compose -f docker-compose.dev.yml up -d --build
```

### Local Development (Without Docker)

#### Backend Lumen

```bash
cd backend-lumen

# Install dependencies
composer install

# Copy environment file
cp env.example .env

# Generate keys
php artisan key:generate
php artisan jwt:secret

# Run migrations
php artisan migrate

# Seed database
php artisan db:seed

# Start development server
php -S localhost:8000 -t public
```

#### Backend Node.js

```bash
cd backend-node

# Install dependencies
npm install

# Copy environment file
cp env.example .env

# Start development server
npm run dev
```

#### Frontend React

```bash
cd frontend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Start development server
npm start
```

## Database Setup

### MySQL Configuration

The application uses MySQL 8.0 with the following default configuration:

- **Database**: energex_db
- **Username**: energex_user
- **Password**: energex_password
- **Port**: 3306

### Database Migrations

Migrations are automatically run when using Docker Compose. For manual setup:

```bash
cd backend-lumen
php artisan migrate
```

### Database Seeding

Seed the database with sample data:

```bash
cd backend-lumen
php artisan db:seed
```

## Testing

### Run All Tests

```bash
# Lumen backend tests
cd backend-lumen
php artisan test

# Node.js cache service tests
cd backend-node
npm test

# React frontend tests
cd frontend
npm test
```

### Run Tests with Coverage

```bash
# Lumen backend
cd backend-lumen
php artisan test --coverage

# Node.js cache service
cd backend-node
npm run test:coverage

# React frontend
cd frontend
npm test -- --coverage --watchAll=false
```

### Docker Test Environment

```bash
# Test the complete Docker setup
docker-compose -f docker-compose.yml up --build
```

## API Documentation

### REST API Endpoints

#### Authentication
- `POST /api/register` - Register a new user
- `POST /api/login` - User login
- `GET /api/me` - Get authenticated user profile
- `POST /api/logout` - Logout user
- `POST /api/refresh` - Refresh JWT token

#### Posts
- `GET /api/posts` - Get all posts (cached)
- `POST /api/posts` - Create a new post
- `GET /api/posts/{id}` - Get single post (cached)
- `PUT /api/posts/{id}` - Update a post
- `DELETE /api/posts/{id}` - Delete a post

### GraphQL API

Access GraphQL at:
- `GET /graphql` - Public GraphQL endpoint
- `POST /graphql` - Public GraphQL endpoint
- `GET /graphql/protected` - Protected GraphQL endpoint (requires auth)
- `POST /graphql/protected` - Protected GraphQL endpoint (requires auth)

#### GraphQL Queries

```graphql
# Get all posts
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

# Get single post
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

# Get current user
query {
  me {
    id
    name
    email
    role
  }
}
```

#### GraphQL Mutations

```graphql
# Create post
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

# Update post
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

# Delete post
mutation {
  deletePost(id: 1) {
    success
    message
  }
}
```

### Cache Service Endpoints

- `GET /cache/posts` - Get cached posts
- `GET /cache/posts/{id}` - Get cached single post
- `DELETE /cache/posts` - Invalidate all post cache
- `DELETE /cache/posts/{id}` - Invalidate specific post cache
- `GET /cache/stats` - Get cache statistics
- `POST /cache/optimize` - Optimize Redis cache

### WebSocket Endpoints

- `GET /ws/connect` - WebSocket connection info
- `POST /ws/broadcast` - Broadcast message to all clients
- `GET /ws/clients` - Get connected clients info
- `POST /ws/rooms/{room}/join` - Join a room
- `POST /ws/rooms/{room}/leave` - Leave a room
- `POST /ws/rooms/{room}/message` - Send message to room
- `POST /ws/clients/{clientId}/message` - Send message to specific client

## Demo Accounts

The application comes with pre-seeded demo accounts:

### Admin Account
- **Email**: admin@energex.com
- **Password**: password123
- **Role**: Admin

### User Accounts
- **Email**: john@example.com
- **Password**: password123
- **Role**: User

- **Email**: jane@example.com
- **Password**: password123
- **Role**: User

## Troubleshooting

### Common Issues

#### Port Conflicts
If you encounter port conflicts, modify the ports in `docker-compose.yml`:

```yaml
ports:
  - "8001:8000"  # Change 8000 to 8001
```

#### Database Connection Issues
Ensure MySQL is running and accessible:

```bash
# Check MySQL container
docker-compose logs mysql

# Test connection
docker-compose exec mysql mysql -u energex_user -penergex_password energex_db
```

#### Redis Connection Issues
Check Redis container:

```bash
# Check Redis container
docker-compose logs redis

# Test connection
docker-compose exec redis redis-cli ping
```

#### Permission Issues
Fix file permissions:

```bash
# Fix permissions for Lumen
sudo chown -R www-data:www-data backend-lumen/storage
sudo chown -R www-data:www-data backend-lumen/bootstrap/cache

# Fix permissions for Node.js
sudo chown -R node:node backend-node/node_modules
```

### Logs

View logs for specific services:

```bash
# All services
docker-compose logs

# Specific service
docker-compose logs backend-lumen
docker-compose logs backend-node
docker-compose logs frontend
docker-compose logs mysql
docker-compose logs redis
```

### Reset Everything

To completely reset the application:

```bash
# Stop and remove containers
docker-compose down -v

# Remove images
docker-compose down --rmi all

# Remove volumes
docker volume prune

# Rebuild and start
docker-compose up --build
```

## Production Deployment

### Environment Variables

Set the following environment variables for production:

```bash
# Lumen
APP_ENV=production
APP_DEBUG=false
APP_KEY=your-production-key
JWT_SECRET=your-production-jwt-secret

# Node.js
NODE_ENV=production

# Database
DB_PASSWORD=your-secure-password

# Redis
REDIS_PASSWORD=your-redis-password
```

### Security Considerations

1. Change all default passwords
2. Use strong JWT secrets
3. Enable HTTPS in production
4. Configure proper CORS settings
5. Set up proper firewall rules
6. Use environment-specific configurations

### Scaling

The application is designed to be horizontally scalable:

1. **Load Balancer**: Use nginx or similar
2. **Database**: Consider read replicas
3. **Redis**: Use Redis Cluster for high availability
4. **Containers**: Scale services independently

## Support

For issues and questions:

1. Check the logs first
2. Review this setup guide
3. Check the individual service README files
4. Create an issue in the repository
