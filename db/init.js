import { Client } from "pg";
import dotenv from "dotenv";
dotenv.config({ quiet: true });

const SQL = `
-- Drop existing tables if they exist (in reverse order due to foreign keys)
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS sessions CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Create users table
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    is_member BOOLEAN DEFAULT FALSE,
    is_admin BOOLEAN DEFAULT FALSE,
    joined_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Create messages table
CREATE TABLE messages (
    message_id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    text TEXT NOT NULL,
    user_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT title_length CHECK (LENGTH(title) >= 3),
    CONSTRAINT text_length CHECK (LENGTH(text) >= 10)
);

-- Create sessions table for Passport.js session storage
CREATE TABLE sessions (
    sid VARCHAR NOT NULL COLLATE "default",
    sess JSON NOT NULL,
    expire TIMESTAMP(6) NOT NULL,
    PRIMARY KEY (sid)
);

-- Create indexes for better query performance
CREATE INDEX idx_messages_user_id ON messages(user_id);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_is_member ON users(is_member);
CREATE INDEX idx_sessions_expire ON sessions(expire);

-- Insert sample users (passwords are hashed 'password123' using bcrypt)
INSERT INTO users (first_name, last_name, email, password, is_member, is_admin) VALUES
('John', 'Doe', 'john.doe@example.com', '$2b$10$rBV2uLDDuFPvNTJVRqG6jOYJ.YhYJPL3FxQJFxH1lxDVwvX3YhGnu', TRUE, TRUE),
('Jane', 'Smith', 'jane.smith@example.com', '$2b$10$rBV2uLDDuFPvNTJVRqG6jOYJ.YhYJPL3FxQJFxH1lxDVwvX3YhGnu', TRUE, FALSE),
('Bob', 'Johnson', 'bob.johnson@example.com', '$2b$10$rBV2uLDDuFPvNTJVRqG6jOYJ.YhYJPL3FxQJFxH1lxDVwvX3YhGnu', TRUE, FALSE),
('Alice', 'Williams', 'alice.williams@example.com', '$2b$10$rBV2uLDDuFPvNTJVRqG6jOYJ.YhYJPL3FxQJFxH1lxDVwvX3YhGnu', FALSE, FALSE),
('Charlie', 'Brown', 'charlie.brown@example.com', '$2b$10$rBV2uLDDuFPvNTJVRqG6jOYJ.YhYJPL3FxQJFxH1lxDVwvX3YhGnu', FALSE, FALSE);

-- Insert sample messages
INSERT INTO messages (title, text, user_id) VALUES
('Welcome to the Club!', 'This is our exclusive members-only club. Feel free to share your thoughts and ideas here. Only members can see who posted what message!', 1),
('First Impressions', 'I just became a member and I am loving the community here. The discussions are thought-provoking and everyone is so welcoming. Looking forward to participating more!', 2),
('Book Recommendation', 'Has anyone read "The Midnight Library"? I just finished it and would love to discuss the philosophical themes with fellow members.', 3),
('Coffee Chat', 'What is everyone drinking today? I am trying a new Ethiopian blend from my local roaster. The fruity notes are incredible!', 2),
('Weekend Plans', 'Planning to go hiking this weekend in the mountains. The weather forecast looks perfect. Anyone else have outdoor adventures planned?', 3);
`;

/**
 * Initialize database with tables and seed data
 * Safe to run multiple times - will recreate everything
 */
export const initDatabase = async () => {
  const clientConfig = process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
      }
    : {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        database: process.env.DB_NAME,
        password: String(process.env.DB_PASSWORD),
        port: parseInt(process.env.DB_PORT),
      };
  const client = new Client(clientConfig);

  try {
    console.log("🔄 Initializing Members Only Club database...");
    await client.connect();
    await client.query(SQL);
    console.log("✅ Database initialized successfully");
    console.log("📝 Sample users created (password: 'password123'):");
    console.log("   - john.doe@example.com (Admin & Member)");
    console.log("   - jane.smith@example.com (Member)");
    console.log("   - bob.johnson@example.com (Member)");
    console.log("   - alice.williams@example.com (Regular User)");
  } catch (error) {
    console.error("❌ Database initialization failed:", error);
    throw error;
  } finally {
    await client.end();
  }
};

/**
 * Check if database tables exist
 */
export const checkDatabase = async () => {
  const clientConfig = process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
      }
    : {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        database: process.env.DB_NAME,
        password: String(process.env.DB_PASSWORD),
        port: parseInt(process.env.DB_PORT),
      };

  const client = new Client(clientConfig);

  try {
    await client.connect();
    const result = await client.query(`
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('users', 'messages', 'sessions')
    `);
    return parseInt(result.rows[0].count) >= 3;
  } catch (error) {
    console.log("📋 Database check failed, will initialize:", error.message);
    return false;
  } finally {
    await client.end();
  }
};
