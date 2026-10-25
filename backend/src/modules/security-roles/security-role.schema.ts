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
 * Valid module key values — identifies each module in the system.
 * Stored as VarChar in the database, validated with Zod enum at the schema layer.
 */
export const MODULE_KEYS = [
  "dashboard",
  "my-account",
  "my-classes",
  "students",
  "academic-cycles",
  "announcements",
  "academic-levels",
  "school-subjects",
  "scholarships",
  "payment-concepts",
  "employees",
  "job-titles",
  "security-roles",
  "settings",
] as const;

// ─── Schemas ────────────────────────────────────────────────────────────────

/**
 * Single permission object schema.
 * Validates moduleKey against the enum and requires boolean flags.
 */
export const permissionSchema = z.object({
  moduleKey: z.enum(MODULE_KEYS),
  canRead: z.boolean(),
  canWrite: z.boolean(),
  canDelete: z.boolean(),
});

/**
 * Validates UUID path parameter.
 */
export const idParamSchema = z.object({
  id: z.string().uuid({ message: "id debe ser un UUID válido" }),
});

/**
 * Validates optional query filters for security roles list endpoints.
 * - q: free-text search on name and description (case-insensitive, max 100 chars)
 * - name: filter by name (case-insensitive contains, max 100 chars)
 * - isActive: filter by active/inactive status ("true" | "false")
 */
export const securityRoleFiltersSchema = z.object({
  q: z.string().max(100, "q debe tener como máximo 100 caracteres").optional(),
  name: z
    .string()
    .max(100, "name debe tener como máximo 100 caracteres")
    .optional(),
  isActive: z.enum(["true", "false"]).optional(),
});

/**
 * Validates query for the security roles paged endpoint.
 * Extends securityRoleFiltersSchema with pagination parameters.
 * Query string values arrive as strings, so page and pageSize use z.coerce.number().
 */
export const securityRolePagedQuerySchema = securityRoleFiltersSchema.extend({
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
 * Validates POST body for creating a security role.
 * - name: 1-100 chars, trimmed, non-blank
 * - description: 1-500 chars, trimmed, non-blank
 * - isActive: optional, defaults to true when omitted
 * - permissions: array of permission objects with unique moduleKeys
 */
export const createSecurityRoleSchema = z.object({
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
  isActive: z.boolean().optional(),
  permissions: z
    .array(permissionSchema)
    .refine(
      (perms) => new Set(perms.map((p) => p.moduleKey)).size === perms.length,
      { message: "No se permiten valores duplicados de moduleKey" },
    )
    .optional(),
});

/**
 * Validates PATCH body for updating a security role.
 * All fields are optional but at least one must be provided.
 * When present, fields must satisfy the same constraints as creation.
 * Permissions array validates unique moduleKeys when provided.
 */
export const updateSecurityRoleSchema = z
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
    permissions: z
      .array(permissionSchema)
      .refine(
        (perms) => new Set(perms.map((p) => p.moduleKey)).size === perms.length,
        { message: "No se permiten valores duplicados de moduleKey" },
      )
      .optional(),
  })
  .refine((data) => Object.values(data).some((v) => v !== undefined), {
    message: "Se requiere al menos un campo",
  });
