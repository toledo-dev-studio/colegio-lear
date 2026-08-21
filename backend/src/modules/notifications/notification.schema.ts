import { z } from "zod";

/** Recipient/audience types a notification list can be scoped to. */
export const NOTIFICATION_RECIPIENT_TYPES = ["admin", "student"] as const;

/** Validates the :type/:id path params of GET /notifications/:type/:id. */
export const notificationParamsSchema = z.object({
  type: z.enum(NOTIFICATION_RECIPIENT_TYPES, {
    error: `type must be one of: ${NOTIFICATION_RECIPIENT_TYPES.join(", ")}`,
  }),
  id: z.string().uuid({ message: "id must be a valid UUID" }),
});

/** Validates the notification id path param. */
export const idParamSchema = z.object({
  id: z.string().uuid({ message: "id must be a valid UUID" }),
});

/** Validates the :studentId path param of the student-portal notification routes. */
export const studentIdParamSchema = z.object({
  studentId: z.string().uuid({ message: "studentId must be a valid UUID" }),
});

/** Validates POST /notifications/student/:studentId/read body. */
export const markAsReadStudentBodySchema = z.object({
  notificationId: z.string().uuid({ message: "notificationId must be a valid UUID" }),
});

/**
 * Validates GET /notifications/:type/:id query params.
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
