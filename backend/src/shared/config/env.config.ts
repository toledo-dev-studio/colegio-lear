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

  // Storage
  STORAGE_PROVIDER: string;
  STORAGE_LOCAL_PATH: string;
  AZURE_STORAGE_CONNECTION_STRING: string;
  AZURE_STORAGE_CONTAINER: string;

  // Mail
  MAIL_PROVIDER: string;
  MAIL_FROM: string;
  MAIL_HOST: string;
  MAIL_PORT: number;
  MAIL_USER: string;
  MAIL_PASSWORD: string;

  // Cookie
  COOKIE_SECURE: boolean;

  // CORS
  CORS_ORIGIN: string;

  // Admin 1 Seed
  ADMIN1_NAME: string;
  ADMIN1_LAST_NAME: string;
  ADMIN1_EMAIL: string;
  ADMIN1_PASSWORD: string;

  // Admin 2 Seed
  ADMIN2_NAME: string;
  ADMIN2_LAST_NAME: string;
  ADMIN2_EMAIL: string;
  ADMIN2_PASSWORD: string;

  // Frontend
  FRONTEND_URL: string;

  // Backend (public origin, used to build absolute URLs for locally-stored files)
  BACKEND_URL: string;
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

  // Storage
  STORAGE_PROVIDER: process.env.STORAGE_PROVIDER || "local",
  STORAGE_LOCAL_PATH: process.env.STORAGE_LOCAL_PATH || "./uploads",
  AZURE_STORAGE_CONNECTION_STRING:
    process.env.AZURE_STORAGE_CONNECTION_STRING || "",
  AZURE_STORAGE_CONTAINER: process.env.AZURE_STORAGE_CONTAINER || "",

  // Mail
  MAIL_PROVIDER: process.env.MAIL_PROVIDER || "gmail",
  MAIL_FROM: process.env.MAIL_FROM || "noreply@colegiolear.com",
  MAIL_HOST: process.env.MAIL_HOST || "smtp.gmail.com",
  MAIL_PORT: parseInt(process.env.MAIL_PORT || "587", 10),
  MAIL_USER: process.env.MAIL_USER || "",
  MAIL_PASSWORD: process.env.MAIL_PASSWORD || "",

  // Cookie
  COOKIE_SECURE: process.env.COOKIE_SECURE === "true",

  // CORS
  CORS_ORIGIN: process.env.CORS_ORIGIN || "http://localhost:5173",

  // Admin 1 Seed
  ADMIN1_NAME: process.env.ADMIN1_NAME || "Admin",
  ADMIN1_LAST_NAME: process.env.ADMIN1_LAST_NAME || "One",
  ADMIN1_EMAIL: process.env.ADMIN1_EMAIL || "admin1@colegiolear.com",
  ADMIN1_PASSWORD: process.env.ADMIN1_PASSWORD || "Admin123!",

  // Admin 2 Seed
  ADMIN2_NAME: process.env.ADMIN2_NAME || "Admin",
  ADMIN2_LAST_NAME: process.env.ADMIN2_LAST_NAME || "Two",
  ADMIN2_EMAIL: process.env.ADMIN2_EMAIL || "admin2@colegiolear.com",
  ADMIN2_PASSWORD: process.env.ADMIN2_PASSWORD || "Admin456!",

  // Frontend
  FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:5173",

  // Backend
  BACKEND_URL:
    process.env.BACKEND_URL || `http://localhost:${process.env.PORT || "3000"}`,
};

// Validate critical environment variables
if (!env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required");
}

if (!env.JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is required");
}
