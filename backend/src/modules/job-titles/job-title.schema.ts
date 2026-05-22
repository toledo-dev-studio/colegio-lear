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

// ─── Schemas ────────────────────────────────────────────────────────────────

/**
 * Validates UUID path parameter.
 */
export const idParamSchema = z.object({
  id: z.string().uuid({ message: "id must be a valid UUID" }),
});

/**
 * Validates optional query filters for job titles list endpoints.
 * - q: free-text search on name and description (case-insensitive, max 100 chars)
 * - name: filter by name (case-insensitive contains, max 100 chars)
 * - jobTitleType: filter by job title type enum
 * - status: filter by active/inactive status ("true" | "false")
 */
export const jobTitleFiltersSchema = z.object({
  q: z.string().max(100, "q must be at most 100 characters").optional(),
  name: z.string().max(100, "name must be at most 100 characters").optional(),
  jobTitleType: z.enum(["teacher", "administrative-staff"]).optional(),
  status: z.enum(["true", "false"]).optional(),
});

/**
 * Validates query for the job titles paged endpoint.
 * Extends jobTitleFiltersSchema with pagination parameters.
 * Query string values arrive as strings, so page and pageSize use z.coerce.number().
 */
export const jobTitlePagedQuerySchema = jobTitleFiltersSchema.extend({
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

/**
 * Validates POST body for creating a job title.
 * - name: 1-100 chars, trimmed, non-blank
 * - description: 1-500 chars, trimmed, non-blank
 * - jobTitleType: enum with values "teacher" or "administrative-staff"
 */
export const createJobTitleSchema = z.object({
  name: nonBlankString(100),
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
  jobTitleType: z.enum(["teacher", "administrative-staff"]),
});

/**
 * Validates PATCH body for updating a job title.
 * All fields are optional but at least one must be provided (name, description, or jobTitleType).
 * When present, fields must satisfy the same constraints as creation.
 */
export const updateJobTitleSchema = z
  .object({
    name: nonBlankString(100).optional(),
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
    jobTitleType: z.enum(["teacher", "administrative-staff"]).optional(),
    status: z.boolean({ message: "status must be a boolean" }).optional(),
  })
  .refine((data) => Object.values(data).some((value) => value !== undefined), {
    message: "At least one field is required",
  });
