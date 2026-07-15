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
 * Validates optional query filters for academic levels list endpoints.
 * - q: free-text search on name and description (case-insensitive, max 100 chars)
 * - name: filter by name (case-insensitive contains, max 100 chars)
 * - isActive: filter by active/inactive status ("true" | "false")
 */
export const academicLevelFiltersSchema = z.object({
  q: z.string().max(100, "q must be at most 100 characters").optional(),
  name: z.string().max(100, "name must be at most 100 characters").optional(),
  isActive: z.enum(["true", "false"]).optional(),
});

/**
 * Validates query for the academic levels paged endpoint.
 * Extends academicLevelFiltersSchema with pagination parameters.
 * Query string values arrive as strings, so page and pageSize use z.coerce.number().
 */
export const academicLevelPagedQuerySchema = academicLevelFiltersSchema.extend({
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
 * Validates query for the education levels paged endpoint.
 * - q: free-text search on name (case-insensitive, max 100 chars)
 * - name: filter by education level name (case-insensitive contains, max 100 chars)
 * - isActive: filter by parent academic level status ("true" | "false")
 * - academicLevelId: filter by parent academic level UUID
 * - page/pageSize: pagination parameters
 */
export const educationLevelPagedQuerySchema = z.object({
  q: z.string().max(100, "q must be at most 100 characters").optional(),
  name: z.string().max(100, "name must be at most 100 characters").optional(),
  isActive: z.enum(["true", "false"]).optional(),
  academicLevelId: z
    .string()
    .uuid({ message: "academicLevelId must be a valid UUID" })
    .optional(),
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

// ─── Education Level Input Schema ────────────────────────────────────────────

/**
 * Validates a single education level input within the academic level form.
 * - id: required string (can be "new-*" for new records or a UUID for existing)
 * - name: 1-100 chars, trimmed, non-blank
 * - description: optional, max 500 chars
 */
const educationLevelInputSchema = z.object({
  id: z.string().min(1, "id is required"),
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
});

/**
 * Validates POST body for creating an academic level.
 * - name: 1-100 chars, trimmed, non-blank
 * - description: 1-500 chars, trimmed, non-blank
 * - educationLevels: optional array of education levels to create
 */
export const createAcademicLevelSchema = z.object({
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
  isActive: z.boolean({ message: "isActive must be a boolean" }).optional(),
  educationLevels: z.array(educationLevelInputSchema).optional(),
});

/**
 * Validates PATCH body for updating an academic level.
 * All fields are optional but at least one must be provided (name, description, or educationLevels).
 * When present, fields must satisfy the same constraints as creation.
 */
export const updateAcademicLevelSchema = z
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
    isActive: z.boolean().optional(),
    educationLevels: z.array(educationLevelInputSchema).optional(),
  })
  .refine((data) => Object.values(data).some((value) => value !== undefined), {
    message: "At least one field is required",
  });
