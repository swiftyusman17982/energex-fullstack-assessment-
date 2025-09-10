-- Create database
CREATE DATABASE IF NOT EXISTS energex_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create user
CREATE USER IF NOT EXISTS 'energex_user'@'%' IDENTIFIED BY 'energex_password';

-- Grant privileges
GRANT ALL PRIVILEGES ON energex_db.* TO 'energex_user'@'%';

-- Flush privileges
FLUSH PRIVILEGES;

-- Use the database
USE energex_db;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    email_verified_at TIMESTAMP NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'user') DEFAULT 'user',
    remember_token VARCHAR(100) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create posts table
CREATE TABLE IF NOT EXISTS posts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    user_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at),
    FULLTEXT idx_title_content (title, content)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create password_resets table (for future password reset functionality)
CREATE TABLE IF NOT EXISTS password_resets (
    email VARCHAR(255) NOT NULL,
    token VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NULL,
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert sample data
INSERT INTO users (name, email, password, role) VALUES
('Admin User', 'admin@energex.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin'),
('John Doe', 'john@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user'),
('Jane Smith', 'jane@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user');

-- Insert sample posts
INSERT INTO posts (title, content, user_id) VALUES
('Welcome to Energex Assessment', 'This is the first post in our microservice application. It demonstrates the integration between Lumen, Node.js, Redis, and React.', 1),
('Microservices Architecture', 'Our application uses a microservices architecture with separate services for API, caching, and frontend. This provides better scalability and maintainability.', 1),
('Redis Caching Benefits', 'Redis provides high-performance caching for our posts, reducing database load and improving response times for frequently accessed data.', 2),
('JWT Authentication', 'We use JWT tokens for secure authentication across our microservices. This ensures that only authenticated users can access protected endpoints.', 3),
('Docker Containerization', 'All services are containerized using Docker, making deployment and scaling much easier across different environments.', 1);

-- Create indexes for better performance
CREATE INDEX idx_posts_user_created ON posts(user_id, created_at DESC);
CREATE INDEX idx_users_created_at ON users(created_at);

-- Create views for common queries
CREATE VIEW user_posts_summary AS
SELECT 
    u.id as user_id,
    u.name as user_name,
    u.email as user_email,
    u.role as user_role,
    COUNT(p.id) as post_count,
    MAX(p.created_at) as latest_post_date
FROM users u
LEFT JOIN posts p ON u.id = p.user_id
GROUP BY u.id, u.name, u.email, u.role;

-- Create stored procedure for getting posts with user info
DELIMITER //
CREATE PROCEDURE GetPostsWithUsers()
BEGIN
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
    ORDER BY p.created_at DESC;
END //
DELIMITER ;

-- Create trigger to update updated_at timestamp
DELIMITER //
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
BEGIN
    SET NEW.updated_at = CURRENT_TIMESTAMP;
END //
DELIMITER ;

DELIMITER //
CREATE TRIGGER update_posts_updated_at
    BEFORE UPDATE ON posts
    FOR EACH ROW
BEGIN
    SET NEW.updated_at = CURRENT_TIMESTAMP;
END //
DELIMITER ;
