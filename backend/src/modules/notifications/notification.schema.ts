import { z } from "zod";

/** Recipient/audience types a notification list can be scoped to. */
export const NOTIFICATION_RECIPIENT_TYPES = ["admin", "student"] as const;

/** Validates the :type/:id path params of GET /notifications/:type/:id. */
export const notificationParamsSchema = z.object({
  type: z.enum(NOTIFICATION_RECIPIENT_TYPES, {
    error: `type debe ser uno de: ${NOTIFICATION_RECIPIENT_TYPES.join(", ")}`,
  }),
  id: z.string().uuid({ message: "id debe ser un UUID válido" }),
});

/** Validates the notification id path param. */
export const idParamSchema = z.object({
  id: z.string().uuid({ message: "id debe ser un UUID válido" }),
});

/** Validates the :studentId path param of the student-portal notification routes. */
export const studentIdParamSchema = z.object({
  studentId: z.string().uuid({ message: "studentId debe ser un UUID válido" }),
});

/** Validates POST /notifications/student/:studentId/read body. */
export const markAsReadStudentBodySchema = z.object({
  notificationId: z.string().uuid({ message: "notificationId debe ser un UUID válido" }),
});

/**
 * Validates GET /notifications/:type/:id query params.
 * The frontend also sends `employeeId` as a query param (redundant with the
 * path param) — harmless, ignored here since it isn't declared.
 */
export const notificationPagedQuerySchema = z.object({
  page: z.coerce
    .number({ message: "page debe ser un número" })
    .int({ message: "page debe ser un número entero" })
    .positive({ message: "page debe ser un entero positivo" })
    .default(1),
  pageSize: z.coerce
    .number({ message: "pageSize debe ser un número" })
    .int({ message: "pageSize debe ser un número entero" })
    .positive({ message: "pageSize debe ser un entero positivo" })
    .max(100, "pageSize debe ser como máximo 100")
    .default(10),
});
