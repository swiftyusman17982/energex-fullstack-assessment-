# Lumen Backend API

This is the main API service built with Lumen (PHP) that handles user authentication, posts management, and integrates with the Node.js caching service.

## Features

- JWT Authentication
- User Registration/Login
- Posts CRUD operations
- Role-based access control (RBAC)
- Integration with Node.js caching service
- Comprehensive test coverage

## API Endpoints

### Authentication
- `POST /api/register` - Register a new user
- `POST /api/login` - User login
- `GET /api/me` - Get authenticated user profile
- `POST /api/logout` - Logout user
- `POST /api/refresh` - Refresh JWT token

### Posts
- `GET /api/posts` - Get all posts (cached via Node.js)
- `POST /api/posts` - Create a new post
- `GET /api/posts/{id}` - Get single post (cached via Node.js)
- `PUT /api/posts/{id}` - Update a post
- `DELETE /api/posts/{id}` - Delete a post

## Installation

1. Install dependencies:
```bash
composer install
```

2. Copy environment file:
```bash
cp env.example .env
```

3. Generate application key:
```bash
php artisan key:generate
```

4. Run migrations:
```bash
php artisan migrate
```

5. Seed database:
```bash
php artisan db:seed
```

## Testing

Run the test suite:
```bash
php artisan test
```

Run tests with coverage:
```bash
php artisan test --coverage
```

## Docker

Build and run with Docker:
```bash
docker build -t lumen-backend .
docker run -p 9000:9000 lumen-backend
```
