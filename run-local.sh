#!/bin/bash

echo "🚀 Starting Energex Full-Stack Assessment - Local Development Mode"
echo "================================================================"

# Check if required tools are installed
check_requirements() {
    echo "📋 Checking requirements..."
    
    if ! command -v php &> /dev/null; then
        echo "❌ PHP is not installed. Please install PHP 8.1+"
        exit 1
    fi
    
    if ! command -v composer &> /dev/null; then
        echo "❌ Composer is not installed. Please install Composer"
        exit 1
    fi
    
    if ! command -v node &> /dev/null; then
        echo "❌ Node.js is not installed. Please install Node.js 18+"
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        echo "❌ npm is not installed. Please install npm"
        exit 1
    fi
    
    echo "✅ All requirements are met!"
}

# Setup backend-lumen
setup_lumen() {
    echo "🔧 Setting up Lumen backend..."
    cd backend-lumen
    
    # Install dependencies
    composer install
    
    # Copy environment file
    if [ ! -f .env ]; then
        cp env.example .env
        echo "📝 Created .env file"
    fi
    
    # Generate app key
    php artisan key:generate
    
    # Generate JWT secret
    php artisan jwt:secret
    
    echo "✅ Lumen backend setup complete!"
    cd ..
}

# Setup backend-node
setup_node() {
    echo "🔧 Setting up Node.js backend..."
    cd backend-node
    
    # Install dependencies
    npm install
    
    # Copy environment file
    if [ ! -f .env ]; then
        cp env.example .env
        echo "📝 Created .env file"
    fi
    
    echo "✅ Node.js backend setup complete!"
    cd ..
}

# Setup frontend
setup_frontend() {
    echo "🔧 Setting up React frontend..."
    cd frontend
    
    # Install dependencies
    npm install
    
    # Copy environment file
    if [ ! -f .env ]; then
        cp .env.example .env
        echo "📝 Created .env file"
    fi
    
    echo "✅ React frontend setup complete!"
    cd ..
}

# Start services
start_services() {
    echo "🚀 Starting services..."
    
    # Start Lumen backend in background
    echo "Starting Lumen API server on port 8000..."
    cd backend-lumen
    php -S localhost:8000 -t public &
    LUMEN_PID=$!
    cd ..
    
    # Start Node.js backend in background
    echo "Starting Node.js cache service on port 3001..."
    cd backend-node
    npm run dev &
    NODE_PID=$!
    cd ..
    
    # Start React frontend
    echo "Starting React frontend on port 3000..."
    cd frontend
    npm start &
    FRONTEND_PID=$!
    cd ..
    
    echo "✅ All services started!"
    echo ""
    echo "🌐 Access the application:"
    echo "   Frontend: http://localhost:3000"
    echo "   Lumen API: http://localhost:8000"
    echo "   Node.js Cache: http://localhost:3001"
    echo ""
    echo "📊 Demo accounts:"
    echo "   Admin: admin@energex.com / password123"
    echo "   User: john@example.com / password123"
    echo ""
    echo "Press Ctrl+C to stop all services"
    
    # Wait for user to stop
    wait
}

# Cleanup function
cleanup() {
    echo ""
    echo "🛑 Stopping services..."
    kill $LUMEN_PID 2>/dev/null
    kill $NODE_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    echo "✅ All services stopped!"
    exit 0
}

# Set trap for cleanup
trap cleanup SIGINT SIGTERM

# Main execution
main() {
    check_requirements
    setup_lumen
    setup_node
    setup_frontend
    start_services
}

# Run main function
main
