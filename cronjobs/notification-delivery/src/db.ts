import { Pool } from "pg";
import { config } from "./config";

/**
 * Connection pool to the backend's database. Only plain parameterized
 * queries (no named prepared statements), so it also works through
 * Supabase's transaction pooler (port 6543).
 */
export const pool = new Pool({ connectionString: config.databaseUrl, max: 5 });
