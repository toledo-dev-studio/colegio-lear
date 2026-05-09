import "dotenv/config";

interface EnvConfig {
  // Server
  PORT: number;
  DATABASE_URL: string;

  // JWT
  JWT_SECRET: string;
  JWT_ACCESS_EXPIRATION: string;
  JWT_REFRESH_EXPIRATION: string;

  // Bcrypt
  BCRYPT_SALT_ROUNDS: number;

  // Logging
  LOG_DIR: string;
  LOG_RETENTION_DAYS: number;
  LOG_LEVEL: string;

  // Super Admin Seed
  SUPER_ADMIN_EMAIL: string;
  SUPER_ADMIN_PASSWORD: string;
  SUPER_ADMIN_FIRST_NAME: string;
  SUPER_ADMIN_LAST_NAME: string;
}

/**
 * Reads all environment variables with sensible defaults.
 * Throws if critical variables (DATABASE_URL, JWT_SECRET) are missing.
 */
export const env: EnvConfig = {
  // Server
  PORT: parseInt(process.env.PORT || "3000", 10),
  DATABASE_URL: process.env.DATABASE_URL || "",

  // JWT
  JWT_SECRET: process.env.JWT_SECRET || "",
  JWT_ACCESS_EXPIRATION: process.env.JWT_ACCESS_EXPIRATION || "15m",
  JWT_REFRESH_EXPIRATION: process.env.JWT_REFRESH_EXPIRATION || "7d",

  // Bcrypt
  BCRYPT_SALT_ROUNDS: parseInt(process.env.BCRYPT_SALT_ROUNDS || "10", 10),

  // Logging
  LOG_DIR: process.env.LOG_DIR || "./logs",
  LOG_RETENTION_DAYS: parseInt(process.env.LOG_RETENTION_DAYS || "30", 10),
  LOG_LEVEL: process.env.LOG_LEVEL || "info",

  // Super Admin Seed
  SUPER_ADMIN_EMAIL: process.env.SUPER_ADMIN_EMAIL || "admin@colegiolear.com",
  SUPER_ADMIN_PASSWORD: process.env.SUPER_ADMIN_PASSWORD || "Admin123",
  SUPER_ADMIN_FIRST_NAME: process.env.SUPER_ADMIN_FIRST_NAME || "Super",
  SUPER_ADMIN_LAST_NAME: process.env.SUPER_ADMIN_LAST_NAME || "Admin",
};

// Validate critical environment variables
if (!env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required");
}

if (!env.JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is required");
}
