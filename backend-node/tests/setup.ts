import dotenv from 'dotenv';

// Load test environment variables
dotenv.config({ path: '.env.test' });

// Set test environment
process.env.NODE_ENV = 'test';
process.env.DB_NAME = 'energex_test_db';
process.env.REDIS_DB = '1';

// Global test timeout
jest.setTimeout(10000);
