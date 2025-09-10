# Architecture Documentation

This document describes the architecture and design decisions for the Energex Full-Stack Assessment application.

## System Overview

The application is built as a microservices architecture with the following components:

- **Lumen API Service** (PHP) - Main API service with authentication and business logic
- **Node.js Cache Service** (TypeScript) - Caching layer with Redis integration
- **React Frontend** (TypeScript) - User interface
- **MySQL Database** - Data persistence layer
- **Redis Cache** - High-performance caching layer
- **WebSocket Service** - Real-time communication

## Architecture Diagram

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React App     │    │   Lumen API     │    │  Node.js Cache  │
│   (Frontend)    │◄──►│   (Backend)     │◄──►│    Service      │
│   Port: 3000    │    │   Port: 8000    │    │   Port: 3001    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   WebSocket     │    │   MySQL DB      │    │   Redis Cache   │
│   Real-time     │    │   Port: 3306    │    │   Port: 6379    │
│   Updates       │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Service Details

### 1. Lumen API Service (PHP)

**Technology Stack:**
- PHP 8.1
- Lumen Framework
- JWT Authentication
- Eloquent ORM
- MySQL Driver

**Responsibilities:**
- User authentication and authorization
- Posts CRUD operations
- Business logic validation
- JWT token management
- Role-based access control (RBAC)

**Key Features:**
- RESTful API endpoints
- GraphQL support
- JWT authentication
- Input validation
- Error handling
- Database migrations and seeders

**API Endpoints:**
- `/api/register` - User registration
- `/api/login` - User authentication
- `/api/posts` - Posts management
- `/graphql` - GraphQL endpoint

### 2. Node.js Cache Service (TypeScript)

**Technology Stack:**
- Node.js 18
- TypeScript
- Express.js
- Socket.IO
- Redis (ioredis)
- MySQL2

**Responsibilities:**
- Redis caching layer
- Database fallback queries
- WebSocket real-time updates
- Cache optimization
- Performance monitoring

**Key Features:**
- High-performance caching
- Cache warming strategies
- LRU eviction policy
- Real-time WebSocket updates
- Health monitoring
- Cache statistics

**Endpoints:**
- `/cache/posts` - Cached posts retrieval
- `/cache/stats` - Cache statistics
- `/ws/*` - WebSocket endpoints

### 3. React Frontend (TypeScript)

**Technology Stack:**
- React 18
- TypeScript
- React Router
- Axios
- Socket.IO Client
- Tailwind CSS

**Responsibilities:**
- User interface
- Authentication flow
- Posts management UI
- Real-time updates display
- Responsive design

**Key Features:**
- Modern React with hooks
- TypeScript for type safety
- Responsive design
- Real-time updates
- Authentication state management
- Error handling

### 4. MySQL Database

**Configuration:**
- MySQL 8.0
- UTF8MB4 character set
- InnoDB storage engine
- Connection pooling

**Schema:**
- `users` table - User accounts and roles
- `posts` table - Blog posts with foreign key to users
- `password_resets` table - Password reset tokens

**Features:**
- Foreign key constraints
- Indexes for performance
- Triggers for timestamps
- Stored procedures
- Views for common queries

### 5. Redis Cache

**Configuration:**
- Redis 7
- LRU eviction policy
- 100MB memory limit
- Persistence enabled

**Usage:**
- Posts caching (5-minute TTL)
- Session storage
- Real-time data
- Performance optimization

## Data Flow

### 1. User Authentication Flow

```
1. User submits login form
2. React sends POST /api/login
3. Lumen validates credentials
4. Lumen generates JWT token
5. React stores token in localStorage
6. React includes token in subsequent requests
```

### 2. Posts Retrieval Flow

```
1. React requests GET /api/posts
2. Lumen calls Node.js cache service
3. Node.js checks Redis cache
4. If cache hit: return cached data
5. If cache miss: query MySQL, cache result, return data
6. Lumen returns response to React
7. React displays posts
```

### 3. Real-time Updates Flow

```
1. User creates/updates/deletes post
2. Lumen processes request
3. Lumen notifies Node.js service
4. Node.js broadcasts via WebSocket
5. All connected clients receive update
6. React updates UI in real-time
```

## Security Architecture

### 1. Authentication
- JWT tokens with expiration
- Secure token storage
- Automatic token refresh
- Role-based access control

### 2. Authorization
- Admin and User roles
- Resource-level permissions
- API endpoint protection
- GraphQL field-level security

### 3. Data Protection
- Password hashing (bcrypt)
- Input validation and sanitization
- SQL injection prevention
- XSS protection
- CSRF protection

### 4. Network Security
- HTTPS in production
- CORS configuration
- Rate limiting
- Request validation

## Performance Optimizations

### 1. Caching Strategy
- **L1 Cache**: Application-level caching
- **L2 Cache**: Redis caching layer
- **Cache Warming**: Pre-loading frequently accessed data
- **TTL Management**: Intelligent expiration policies

### 2. Database Optimizations
- Indexed columns for fast queries
- Connection pooling
- Query optimization
- Prepared statements

### 3. Frontend Optimizations
- Code splitting
- Lazy loading
- Image optimization
- Bundle optimization

### 4. Redis Optimizations
- LRU eviction policy
- Memory management
- Compression for large values
- Connection pooling

## Scalability Considerations

### 1. Horizontal Scaling
- Stateless services
- Load balancer ready
- Database read replicas
- Redis clustering

### 2. Vertical Scaling
- Resource monitoring
- Performance metrics
- Auto-scaling policies
- Health checks

### 3. Microservices Benefits
- Independent deployment
- Technology diversity
- Fault isolation
- Team autonomy

## Monitoring and Observability

### 1. Health Checks
- Service health endpoints
- Database connectivity
- Redis connectivity
- Dependency checks

### 2. Logging
- Structured logging
- Error tracking
- Performance metrics
- Audit trails

### 3. Metrics
- Response times
- Cache hit rates
- Database performance
- Memory usage

## Deployment Architecture

### 1. Containerization
- Docker containers for all services
- Multi-stage builds
- Optimized images
- Health checks

### 2. Orchestration
- Docker Compose for development
- Kubernetes ready
- Service discovery
- Load balancing

### 3. CI/CD Pipeline
- GitHub Actions
- Automated testing
- Security scanning
- Deployment automation

## Development Workflow

### 1. Local Development
- Docker Compose setup
- Hot reload for development
- Environment isolation
- Database seeding

### 2. Testing Strategy
- Unit tests for all services
- Integration tests
- End-to-end tests
- Performance tests

### 3. Code Quality
- ESLint for JavaScript/TypeScript
- PHP_CodeSniffer for PHP
- Prettier for formatting
- Type checking

## Technology Decisions

### 1. Why Lumen over Laravel?
- Lighter framework for API-only application
- Faster performance
- Lower memory footprint
- Simpler configuration

### 2. Why Node.js for Caching?
- Excellent Redis integration
- High-performance I/O
- Real-time capabilities
- TypeScript support

### 3. Why React?
- Modern component architecture
- Strong ecosystem
- TypeScript integration
- Real-time capabilities

### 4. Why MySQL?
- ACID compliance
- Mature ecosystem
- Excellent performance
- Wide adoption

### 5. Why Redis?
- In-memory performance
- Rich data structures
- Pub/Sub capabilities
- Persistence options

## Future Enhancements

### 1. Additional Features
- File upload support
- Email notifications
- Advanced search
- Analytics dashboard

### 2. Performance Improvements
- CDN integration
- Database sharding
- Microservice splitting
- Event sourcing

### 3. Security Enhancements
- OAuth integration
- Two-factor authentication
- API versioning
- Advanced monitoring

## Conclusion

This architecture provides a solid foundation for a scalable, maintainable, and performant microservices application. The separation of concerns, use of modern technologies, and focus on best practices ensure the system can grow and adapt to changing requirements.

The modular design allows for independent development and deployment of services, while the comprehensive testing and monitoring ensure reliability and performance. The security-first approach protects user data and system integrity, while the performance optimizations ensure a responsive user experience.
