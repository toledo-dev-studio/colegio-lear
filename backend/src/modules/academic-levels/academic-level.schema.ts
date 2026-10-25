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
 * Validates optional query filters for academic levels list endpoints.
 * - q: free-text search on name and description (case-insensitive, max 100 chars)
 * - name: filter by name (case-insensitive contains, max 100 chars)
 * - isActive: filter by active/inactive status ("true" | "false")
 */
export const academicLevelFiltersSchema = z.object({
  q: z.string().max(100, "q debe tener como máximo 100 caracteres").optional(),
  name: z
    .string()
    .max(100, "name debe tener como máximo 100 caracteres")
    .optional(),
  isActive: z.enum(["true", "false"]).optional(),
});

/**
 * Validates query for the academic levels paged endpoint.
 * Extends academicLevelFiltersSchema with pagination parameters.
 * Query string values arrive as strings, so page and pageSize use z.coerce.number().
 */
export const academicLevelPagedQuerySchema = academicLevelFiltersSchema.extend({
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
 * Validates query for the education levels paged endpoint.
 * - q: free-text search on name (case-insensitive, max 100 chars)
 * - name: filter by education level name (case-insensitive contains, max 100 chars)
 * - isActive: filter by parent academic level status ("true" | "false")
 * - academicLevelId: filter by parent academic level UUID
 * - page/pageSize: pagination parameters
 */
export const educationLevelPagedQuerySchema = z.object({
  q: z.string().max(100, "q debe tener como máximo 100 caracteres").optional(),
  name: z
    .string()
    .max(100, "name debe tener como máximo 100 caracteres")
    .optional(),
  isActive: z.enum(["true", "false"]).optional(),
  academicLevelId: z
    .string()
    .uuid({ message: "academicLevelId debe ser un UUID válido" })
    .optional(),
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

// ─── Education Level Input Schema ────────────────────────────────────────────

/**
 * Validates a single education level input within the academic level form.
 * - id: required string (can be "new-*" for new records or a UUID for existing)
 * - name: 1-100 chars, trimmed, non-blank
 * - description: optional, max 500 chars
 */
const educationLevelInputSchema = z.object({
  id: z.string().min(1, "id es requerido"),
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
    .pipe(
      z.string().max(500, "Debe tener como máximo 500 caracteres").optional(),
    ),
  isActive: z.boolean({ message: "isActive debe ser un booleano" }).optional(),
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
      .pipe(
        z
          .string()
          .max(500, "Debe tener como máximo 500 caracteres")
          .optional(),
      ),
    isActive: z.boolean().optional(),
    educationLevels: z.array(educationLevelInputSchema).optional(),
  })
  .refine((data) => Object.values(data).some((value) => value !== undefined), {
    message: "Se requiere al menos un campo",
  });
