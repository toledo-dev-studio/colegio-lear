import { z } from "zod";

/**
 * Zod schema for audit log query filters.
 * All fields are optional — used to validate GET /api/audit-logs query params.
 */
export const auditQuerySchema = z.object({
  employeeId: z.coerce.number().int().positive().optional(),
  action: z.string().optional(),
  resource: z.string().optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().optional(),
});
