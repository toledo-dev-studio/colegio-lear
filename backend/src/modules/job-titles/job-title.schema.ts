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

// ─── Schemas ────────────────────────────────────────────────────────────────

/**
 * Validates UUID path parameter.
 */
export const idParamSchema = z.object({
  id: z.string().uuid({ message: "id debe ser un UUID válido" }),
});

/**
 * Validates optional query filters for job titles list endpoints.
 * - q: free-text search on name and description (case-insensitive, max 100 chars)
 * - name: filter by name (case-insensitive contains, max 100 chars)
 * - jobTitleType: filter by job title type enum
 * - isActive: filter by active/inactive status ("true" | "false")
 */
export const jobTitleFiltersSchema = z.object({
  q: z.string().max(100, "q debe tener como máximo 100 caracteres").optional(),
  name: z
    .string()
    .max(100, "name debe tener como máximo 100 caracteres")
    .optional(),
  jobTitleType: z.enum(["teacher", "administrative-staff"]).optional(),
  isActive: z.enum(["true", "false"]).optional(),
});

/**
 * Validates query for the job titles paged endpoint.
 * Extends jobTitleFiltersSchema with pagination parameters.
 * Query string values arrive as strings, so page and pageSize use z.coerce.number().
 */
export const jobTitlePagedQuerySchema = jobTitleFiltersSchema.extend({
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

/**
 * Validates POST body for creating a job title.
 * - name: 1-100 chars, trimmed, non-blank
 * - description: 1-500 chars, trimmed, non-blank
 * - jobTitleType: enum with values "teacher" or "administrative-staff"
 * - isActive: optional, defaults to true when omitted
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
    .pipe(
      z.string().max(500, "Debe tener como máximo 500 caracteres").optional(),
    ),
  jobTitleType: z.enum(["teacher", "administrative-staff"]),
  isActive: z.boolean().optional(),
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
      .pipe(
        z
          .string()
          .max(500, "Debe tener como máximo 500 caracteres")
          .optional(),
      ),
    jobTitleType: z.enum(["teacher", "administrative-staff"]).optional(),
    isActive: z.boolean({ message: "isActive debe ser un booleano" }).optional(),
  })
  .refine((data) => Object.values(data).some((value) => value !== undefined), {
    message: "Se requiere al menos un campo",
  });
