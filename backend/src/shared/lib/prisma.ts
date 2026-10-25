import { PrismaClient } from "../../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

import { env } from "../config/env.config";

/**
 * Creates a connection pool using the DATABASE_URL from environment config.
 * The pool is shared across the application via the Prisma client singleton.
 */
const pool = new pg.Pool({ connectionString: env.DATABASE_URL });

/**
 * Prisma driver adapter for PostgreSQL.
 * Uses the "core" schema as default since most queries target it.
 * Cross-schema queries to "auth" and "logs" work automatically
 * via Prisma's multi-schema support.
 */
const adapter = new PrismaPg(pool, { schema: "core" });

/**
 * Singleton PrismaClient instance using the @prisma/adapter-pg driver adapter.
 * Reused across the entire application to avoid connection pool exhaustion.
 */
export const prisma = new PrismaClient({ adapter });
