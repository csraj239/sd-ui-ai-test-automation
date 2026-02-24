-- Initialize the test automation database
-- This runs automatically when PostgreSQL starts if placed in /docker-entrypoint-initdb.d/
-- Note: The database sd_test_automation_db is already created by POSTGRES_DB env variable

-- Grant privileges to the sa user on the database
GRANT ALL PRIVILEGES ON DATABASE sd_test_automation_db TO sa;

-- Connect to the target database and set up schema
\c sd_test_automation_db

-- Enable UUID extension if needed for future use
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
