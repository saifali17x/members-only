// db.js
import pkg from "pg";
import dotenv from "dotenv";
dotenv.config({ quiet: true });
const { Pool } = pkg;

const isProd = process.env.NODE_ENV === "production";

// Use DATABASE_URL if available (Railway), otherwise use individual config
const poolConfig = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ...(isProd ? { ssl: { rejectUnauthorized: false } } : {}),
    }
  : {
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      database: process.env.DB_NAME,
      password: String(process.env.DB_PASSWORD),
      port: parseInt(process.env.DB_PORT),
      ...(isProd ? { ssl: { rejectUnauthorized: false } } : {}),
    };

// Add performance optimizations for production
if (isProd && process.env.DATABASE_URL) {
  poolConfig.max = 10; // Maximum connections in pool
  poolConfig.min = 2; // Minimum connections to maintain
  poolConfig.idle = 10000; // Close idle connections after 10s
  poolConfig.acquireTimeoutMillis = 30000; // Wait 30s for connection
  poolConfig.createTimeoutMillis = 30000; // 30s to create connection
  poolConfig.destroyTimeoutMillis = 5000; // 5s to destroy connection
  poolConfig.createRetryIntervalMillis = 200; // Retry every 200ms
}

const pool = new Pool(poolConfig);

export default pool;
