import { z } from "zod";

/** Validates the employeeId path param. */
export const employeeIdParamSchema = z.object({
  employeeId: z.string().uuid({ message: "employeeId must be a valid UUID" }),
});

/** Validates the notification id path param. */
export const idParamSchema = z.object({
  id: z.string().uuid({ message: "id must be a valid UUID" }),
});

/**
 * Validates GET /notifications/employees/:employeeId query params.
 * The frontend also sends `employeeId` as a query param (redundant with the
 * path param) — harmless, ignored here since it isn't declared.
 */
export const notificationPagedQuerySchema = z.object({
  page: z.coerce
    .number({ message: "page must be a number" })
    .int({ message: "page must be an integer" })
    .positive({ message: "page must be a positive integer" })
    .default(1),
  pageSize: z.coerce
    .number({ message: "pageSize must be a number" })
    .int({ message: "pageSize must be an integer" })
    .positive({ message: "pageSize must be a positive integer" })
    .max(100, "pageSize must be at most 100")
    .default(10),
});
