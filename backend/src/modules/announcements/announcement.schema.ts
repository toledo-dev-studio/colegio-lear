import { z } from "zod";

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Trims the string and ensures it is not blank (whitespace-only).
 * Used for name and description fields.
 */
function nonBlankString(maxLength: number) {
  return z
    .string()
    .transform((val) => val.trim())
    .refine((val) => val.length >= 1, { message: "No debe estar vacío" })
    .refine((val) => val.length <= maxLength, {
      message: `Debe tener como máximo ${maxLength} caracteres`,
    });
}

// ─── Constants ──────────────────────────────────────────────────────────────

/**
 * Allowed audience keys for announcements.
 */
export const AUDIENCE_KEYS = [
  "administrative-staff",
  "teacher",
  "student",
] as const;

/** Full announcement lifecycle, used for updates and filters. */
export const ANNOUNCEMENT_STATUS_KEYS = [
  "draft",
  "in-progress",
  "completed",
  "cancelled",
] as const;

/**
 * Statuses settable at creation time. "completed"/"cancelled" only make
 * sense for a campaign that already ran, so they're only reachable via a
 * later update.
 */
export const CREATE_ANNOUNCEMENT_STATUS_KEYS = ["draft", "in-progress"] as const;

// ─── Audience Schema ────────────────────────────────────────────────────────

/**
 * Validates the audience array: a list of audience keys.
 * The human-readable label is a frontend-only presentation concern
 * (AUDIENCE_TYPES catalog) and is not sent or persisted.
 */
export const audienceSchema = z
  .array(
    z.enum(AUDIENCE_KEYS, {
      error: `audience debe ser uno de: ${AUDIENCE_KEYS.join(", ")}`,
    }),
  )
  .min(1, "audience debe tener al menos 1 elemento");

// ─── Schemas ────────────────────────────────────────────────────────────────

/**
 * Validates UUID path parameter.
 */
export const idParamSchema = z.object({
  id: z.string().uuid({ message: "id debe ser un UUID válido" }),
});

/**
 * Validates POST body for creating an announcement.
 * - name: 1-200 chars, trimmed, non-blank
 * - description: 1-500 chars, trimmed, non-blank (optional)
 * - audience: array of audience keys, min 1 element
 * - content: optional (added later when editing)
 * - publishedAt: valid ISO date string
 * - expiresAt: valid ISO date string, must be >= publishedAt
 */
export const createAnnouncementSchema = z
  .object({
    name: nonBlankString(200),
    description: z
      .string()
      .nullable()
      .optional()
      .transform((val) => {
        if (val === null || val === undefined) return undefined;
        const trimmed = val.trim();
        return trimmed === "" ? undefined : trimmed;
      })
      .pipe(
        z.string().max(500, "Debe tener como máximo 500 caracteres").optional(),
      ),
    audience: audienceSchema,
    content: z.string().nullable().optional(),
    publishedAt: z.string().refine((val) => !isNaN(Date.parse(val)), {
      message: "publishedAt debe ser una fecha ISO válida",
    }),
    expiresAt: z.string().refine((val) => !isNaN(Date.parse(val)), {
      message: "expiresAt debe ser una fecha ISO válida",
    }),
    status: z
      .enum(CREATE_ANNOUNCEMENT_STATUS_KEYS, {
        error: `status debe ser uno de: ${CREATE_ANNOUNCEMENT_STATUS_KEYS.join(", ")}`,
      })
      .optional(),
  })
  .refine((data) => new Date(data.expiresAt) >= new Date(data.publishedAt), {
    message: "expiresAt debe ser igual o posterior a publishedAt",
    path: ["expiresAt"],
  });

/**
 * Validates PATCH body for updating an announcement.
 * All fields are optional but at least one must be provided.
 * When both publishedAt and expiresAt are present, validates expiresAt >= publishedAt.
 */
export const updateAnnouncementSchema = z
  .object({
    name: nonBlankString(200).optional(),
    description: z
      .string()
      .nullable()
      .optional()
      .transform((val) => {
        if (val === null || val === undefined) return undefined;
        const trimmed = val.trim();
        return trimmed === "" ? undefined : trimmed;
      })
      .pipe(
        z.string().max(500, "Debe tener como máximo 500 caracteres").optional(),
      ),
    audience: audienceSchema.optional(),
    content: z.string().nullable().optional(),
    publishedAt: z
      .string()
      .refine((val) => !isNaN(Date.parse(val)), {
        message: "publishedAt debe ser una fecha ISO válida",
      })
      .optional(),
    expiresAt: z
      .string()
      .refine((val) => !isNaN(Date.parse(val)), {
        message: "expiresAt debe ser una fecha ISO válida",
      })
      .optional(),
    status: z
      .enum(ANNOUNCEMENT_STATUS_KEYS, {
        error: `status debe ser uno de: ${ANNOUNCEMENT_STATUS_KEYS.join(", ")}`,
      })
      .optional(),
  })
  .refine((data) => Object.values(data).some((value) => value !== undefined), {
    message: "Se requiere al menos un campo",
  })
  .refine(
    (data) => {
      if (data.publishedAt && data.expiresAt) {
        return new Date(data.expiresAt) >= new Date(data.publishedAt);
      }
      return true;
    },
    {
      message: "expiresAt debe ser igual o posterior a publishedAt",
      path: ["expiresAt"],
    },
  );

/**
 * Validates optional query filters for announcements list endpoints.
 * - q: free-text search on name and description (case-insensitive, max 100 chars)
 * - name: filter by name (case-insensitive contains, max 200 chars)
 * - status: filter by exact lifecycle status
 * - publishedAt / expiresAt: together define one selected date range;
 *   matches announcements whose own publishedAt AND expiresAt both fall
 *   within that range (not two independent exact-date filters).
 */
export const announcementFiltersSchema = z.object({
  q: z.string().max(100, "q debe tener como máximo 100 caracteres").optional(),
  name: z
    .string()
    .max(200, "name debe tener como máximo 200 caracteres")
    .optional(),
  status: z.enum(ANNOUNCEMENT_STATUS_KEYS).optional(),
  publishedAt: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "publishedAt debe ser una fecha ISO válida",
    })
    .optional(),
  expiresAt: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "expiresAt debe ser una fecha ISO válida",
    })
    .optional(),
});

/**
 * Validates query for the announcements paged endpoint.
 * Extends announcementFiltersSchema with pagination parameters.
 * Query string values arrive as strings, so page and pageSize use z.coerce.number().
 */
export const announcementPagedQuerySchema = announcementFiltersSchema.extend({
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
