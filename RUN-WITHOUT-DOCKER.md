# Running the Project Without Docker

If you don't have Docker or prefer to run the services locally, follow this guide.

## Prerequisites

- PHP 8.1+
- Composer
- Node.js 18+
- MySQL 8.0+
- Redis 7+

## Quick Start

### Option 1: Automated Script

```bash
# Make the script executable and run it
chmod +x run-local.sh
./run-local.sh
```

This script will:
- Check all requirements
- Set up all services
- Start all services automatically

### Option 2: Manual Setup

#### 1. Setup MySQL Database

```sql
CREATE DATABASE energex_db;
CREATE USER 'energex_user'@'localhost' IDENTIFIED BY 'energex_password';
GRANT ALL PRIVILEGES ON energex_db.* TO 'energex_user'@'localhost';
FLUSH PRIVILEGES;
```

#### 2. Setup Redis

```bash
# Start Redis server
redis-server
```

#### 3. Setup Lumen Backend

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

# Start server
php -S localhost:8000 -t public
```

#### 4. Setup Node.js Cache Service

```bash
cd backend-node

# Install dependencies
npm install

# Copy environment file
cp env.example .env

# Start development server
npm run dev
```

#### 5. Setup React Frontend

```bash
cd frontend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Start development server
npm start
```

## Access the Application

- **Frontend**: http://localhost:3000
- **Lumen API**: http://localhost:8000
- **Node.js Cache**: http://localhost:3001

## Demo Accounts

- **Admin**: admin@energex.com / password123
- **User**: john@example.com / password123

## Troubleshooting

### MySQL Connection Issues
- Ensure MySQL is running: `sudo service mysql start`
- Check credentials in `.env` files
- Verify database exists

### Redis Connection Issues
- Start Redis: `redis-server`
- Check if Redis is running: `redis-cli ping`

### Port Conflicts
- Change ports in `.env` files if needed
- Ensure no other services are using the ports

### Permission Issues
- Fix file permissions: `chmod -R 755 backend-lumen/storage`
- Ensure proper ownership of files
