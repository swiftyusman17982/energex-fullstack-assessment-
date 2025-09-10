-- Additional seed data for testing and development
USE energex_db;

-- Insert additional test users
INSERT INTO users (name, email, password, role) VALUES
('Test Admin', 'testadmin@energex.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin'),
('Test User 1', 'testuser1@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user'),
('Test User 2', 'testuser2@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user'),
('Alice Johnson', 'alice@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user'),
('Bob Wilson', 'bob@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user');

-- Insert additional test posts
INSERT INTO posts (title, content, user_id) VALUES
('Advanced Caching Strategies', 'Implementing multi-level caching with Redis and application-level caching can significantly improve performance. This post explores various caching patterns and their benefits.', 4),
('Database Optimization Techniques', 'Learn about indexing strategies, query optimization, and database design patterns that can improve your application performance.', 5),
('Microservices Communication Patterns', 'Understanding different communication patterns between microservices including synchronous and asynchronous messaging.', 6),
('Security Best Practices', 'Essential security practices for web applications including authentication, authorization, and data protection.', 7),
('Docker Best Practices', 'Tips and tricks for optimizing Docker containers and improving build times and runtime performance.', 4),
('API Design Principles', 'RESTful API design principles and best practices for creating maintainable and scalable APIs.', 5),
('Testing Strategies', 'Comprehensive testing strategies including unit tests, integration tests, and end-to-end testing approaches.', 6),
('Performance Monitoring', 'Tools and techniques for monitoring application performance and identifying bottlenecks.', 7),
('CI/CD Pipeline Setup', 'Setting up continuous integration and continuous deployment pipelines for automated testing and deployment.', 4),
('Cloud Deployment Strategies', 'Different approaches to deploying applications to cloud platforms and managing infrastructure as code.', 5);

-- Insert some posts with different dates for testing
INSERT INTO posts (title, content, user_id, created_at) VALUES
('Historical Post 1', 'This is a post from last month for testing date-based queries.', 1, DATE_SUB(NOW(), INTERVAL 30 DAY)),
('Historical Post 2', 'Another historical post for testing purposes.', 2, DATE_SUB(NOW(), INTERVAL 15 DAY)),
('Recent Post 1', 'A very recent post for testing current data.', 3, DATE_SUB(NOW(), INTERVAL 1 HOUR)),
('Recent Post 2', 'Another recent post for testing.', 4, DATE_SUB(NOW(), INTERVAL 2 HOUR));

-- Create some test data for performance testing
-- Insert multiple posts for load testing
INSERT INTO posts (title, content, user_id) 
SELECT 
    CONCAT('Performance Test Post ', n) as title,
    CONCAT('This is performance test post number ', n, '. It contains some sample content for testing database performance and caching mechanisms.') as content,
    (n % 5) + 1 as user_id
FROM (
    SELECT @row := @row + 1 as n
    FROM (SELECT 0 UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4) t1,
         (SELECT 0 UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4) t2,
         (SELECT 0 UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4) t3,
         (SELECT @row := 0) r
    LIMIT 100
) numbers;

-- Update some posts to have different updated_at timestamps
UPDATE posts SET updated_at = DATE_SUB(NOW(), INTERVAL 1 DAY) WHERE id % 3 = 0;
UPDATE posts SET updated_at = DATE_SUB(NOW(), INTERVAL 2 DAY) WHERE id % 5 = 0;

-- Create some test data for user activity
UPDATE users SET 
    created_at = DATE_SUB(NOW(), INTERVAL 30 DAY),
    updated_at = DATE_SUB(NOW(), INTERVAL 1 DAY)
WHERE id > 3;
