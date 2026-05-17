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
 * Valid module key values — identifies each module in the system.
 * Stored as VarChar in the database, validated with Zod enum at the schema layer.
 */
export const MODULE_KEYS = [
  "dashboard",
  "my-account",
  "my-classes",
  "students",
  "academic-years",
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
  id: z.string().uuid({ message: "id must be a valid UUID" }),
});

/**
 * Validates optional query filters for security roles list endpoints.
 * - q: free-text search on name and description (case-insensitive, max 100 chars)
 * - name: filter by name (case-insensitive contains, max 100 chars)
 * - status: filter by active/inactive status ("true" | "false")
 */
export const securityRoleFiltersSchema = z.object({
  q: z.string().max(100, "q must be at most 100 characters").optional(),
  name: z.string().max(100, "name must be at most 100 characters").optional(),
  status: z.enum(["true", "false"]).optional(),
});

/**
 * Validates query for the security roles paged endpoint.
 * Extends securityRoleFiltersSchema with pagination parameters.
 * Query string values arrive as strings, so page and pageSize use z.coerce.number().
 */
export const securityRolePagedQuerySchema = securityRoleFiltersSchema.extend({
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
 * Validates POST body for creating a security role.
 * - name: 1-100 chars, trimmed, non-blank
 * - description: 1-500 chars, trimmed, non-blank
 * - permissions: array of permission objects with unique moduleKeys
 */
export const createSecurityRoleSchema = z.object({
  name: nonBlankString(100),
  description: nonBlankString(500),
  permissions: z
    .array(permissionSchema)
    .refine(
      (perms) => new Set(perms.map((p) => p.moduleKey)).size === perms.length,
      { message: "Duplicate moduleKey values are not allowed" },
    ),
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
    description: nonBlankString(500).optional(),
    permissions: z
      .array(permissionSchema)
      .refine(
        (perms) => new Set(perms.map((p) => p.moduleKey)).size === perms.length,
        { message: "Duplicate moduleKey values are not allowed" },
      )
      .optional(),
  })
  .refine((data) => Object.values(data).some((v) => v !== undefined), {
    message: "At least one field is required",
  });
