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
    .refine((val) => val.length >= 1, { message: "Must not be blank" })
    .refine((val) => val.length <= maxLength, {
      message: `Must be at most ${maxLength} characters`,
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

// ─── Audience Schema ────────────────────────────────────────────────────────

/**
 * Validates a single audience item object.
 * - key: must be one of the allowed audience keys
 * - label: non-empty string
 */
export const audienceItemSchema = z.object({
  key: z.enum(AUDIENCE_KEYS, {
    error: `key must be one of: ${AUDIENCE_KEYS.join(", ")}`,
  }),
  label: z.string().min(1, "label must not be empty"),
});

// ─── Schemas ────────────────────────────────────────────────────────────────

/**
 * Validates UUID path parameter.
 */
export const idParamSchema = z.object({
  id: z.string().uuid({ message: "id must be a valid UUID" }),
});

/**
 * Validates POST body for creating an announcement.
 * - name: 1-200 chars, trimmed, non-blank
 * - description: 1-500 chars, trimmed, non-blank (optional)
 * - audience: array of audienceItemSchema, min 1 element
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
      .pipe(z.string().max(500, "Must be at most 500 characters").optional()),
    audience: z
      .array(audienceItemSchema)
      .min(1, "audience must have at least 1 element"),
    content: z.string().nullable().optional(),
    publishedAt: z.string().refine((val) => !isNaN(Date.parse(val)), {
      message: "publishedAt must be a valid ISO date string",
    }),
    expiresAt: z.string().refine((val) => !isNaN(Date.parse(val)), {
      message: "expiresAt must be a valid ISO date string",
    }),
  })
  .refine((data) => new Date(data.expiresAt) >= new Date(data.publishedAt), {
    message: "expiresAt must be on or after publishedAt",
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
      .pipe(z.string().max(500, "Must be at most 500 characters").optional()),
    audience: z
      .array(audienceItemSchema)
      .min(1, "audience must have at least 1 element")
      .optional(),
    content: z.string().nullable().optional(),
    publishedAt: z
      .string()
      .refine((val) => !isNaN(Date.parse(val)), {
        message: "publishedAt must be a valid ISO date string",
      })
      .optional(),
    expiresAt: z
      .string()
      .refine((val) => !isNaN(Date.parse(val)), {
        message: "expiresAt must be a valid ISO date string",
      })
      .optional(),
    status: z.boolean().optional(),
  })
  .refine((data) => Object.values(data).some((value) => value !== undefined), {
    message: "At least one field is required",
  })
  .refine(
    (data) => {
      if (data.publishedAt && data.expiresAt) {
        return new Date(data.expiresAt) >= new Date(data.publishedAt);
      }
      return true;
    },
    {
      message: "expiresAt must be on or after publishedAt",
      path: ["expiresAt"],
    },
  );

/**
 * Validates optional query filters for announcements list endpoints.
 * - q: free-text search on name and description (case-insensitive, max 100 chars)
 * - name: filter by name (case-insensitive contains, max 200 chars)
 * - status: filter by active/inactive status ("true" | "false")
 * - publishedAt: filter by publication date (ISO date string)
 * - expiresAt: filter by expiration date (ISO date string)
 */
export const announcementFiltersSchema = z.object({
  q: z.string().max(100, "q must be at most 100 characters").optional(),
  name: z.string().max(200, "name must be at most 200 characters").optional(),
  status: z.enum(["true", "false"]).optional(),
  publishedAt: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "publishedAt must be a valid ISO date string",
    })
    .optional(),
  expiresAt: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "expiresAt must be a valid ISO date string",
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
