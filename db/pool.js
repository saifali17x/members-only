import pkg from "pg";
import dotenv from "dotenv";
dotenv.config({ quiet: true });
const { Pool } = pkg;

const isProd = process.env.NODE_ENV === "production";

// Use DATABASE_URL if available (Railway/Neon), otherwise use individual config
const poolConfig = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    }
  : {
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      database: process.env.DB_NAME,
      password: process.env.DB_PASSWORD || undefined,
      port: parseInt(process.env.DB_PORT),
      ...(isProd ? { ssl: { rejectUnauthorized: false } } : {}),
    };

// Add performance optimizations for production and better connection handling
if (process.env.DATABASE_URL) {
  poolConfig.max = 10; // Maximum connections in pool
  poolConfig.min = 2; // Minimum connections to maintain
  poolConfig.idleTimeoutMillis = 10000; // Close idle connections after 10s
  poolConfig.connectionTimeoutMillis = 10000; // Wait 10s for connection (reduced from 30s)
}

const pool = new Pool(poolConfig);

export default pool;
