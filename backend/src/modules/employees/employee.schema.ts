import { z } from "zod";

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Trims the string and ensures it is not blank (whitespace-only).
 * Used for name, lastName, and phoneNumber fields.
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
 * Validates optional query filters for employee list endpoints.
 * - q: free-text search on name, firstLastName, secondLastName, or email (case-insensitive, max 100 chars)
 * - name: filter by name (case-insensitive contains, max 100 chars)
 * - status: filter by active/inactive status ("true" | "false")
 * - roleId: filter by securityRoleId (UUID)
 * - jobTitleId: filter by jobTitleId (UUID)
 */
export const employeeFiltersSchema = z.object({
  q: z.string().max(100, "q must be at most 100 characters").optional(),
  name: z.string().max(100, "name must be at most 100 characters").optional(),
  status: z.enum(["true", "false"]).optional(),
  roleId: z
    .string()
    .uuid({ message: "roleId must be a valid UUID" })
    .optional(),
  jobTitleId: z
    .string()
    .uuid({ message: "jobTitleId must be a valid UUID" })
    .optional(),
});

/**
 * Validates query for the employees paged endpoint.
 * Extends employeeFiltersSchema with pagination parameters.
 * Query string values arrive as strings, so page and pageSize use z.coerce.number().
 */
export const employeePagedQuerySchema = employeeFiltersSchema.extend({
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
 * Validates POST body for creating an employee.
 * All fields are required. File (image) is handled separately by multer.
 * - name: 1-100 chars, trimmed, non-blank
 * - firstLastName: 1-100 chars, trimmed, non-blank
 * - secondLastName: 1-100 chars, trimmed, non-blank
 * - phoneNumber: 1-20 chars, trimmed, non-blank
 * - email: valid email format, max 150 chars
 * - securityRoleId: valid UUID
 * - jobTitleId: valid UUID
 */
export const createEmployeeSchema = z.object({
  name: nonBlankString(100),
  firstLastName: nonBlankString(100),
  secondLastName: z
    .string()
    .transform((val) => val.trim())
    .transform((val) => (val === "" ? undefined : val))
    .pipe(z.string().max(100, "Must be at most 100 characters").optional())
    .optional(),
  phoneNumber: nonBlankString(20),
  email: z
    .string()
    .email({ message: "Must be a valid email" })
    .max(150, "email must be at most 150 characters"),
  securityRoleId: z
    .string()
    .uuid({ message: "securityRoleId must be a valid UUID" }),
  jobTitleId: z.string().uuid({ message: "jobTitleId must be a valid UUID" }),
});

/**
 * Validates PATCH /employees/me body for updating the authenticated employee's own account.
 * Required: name, firstLastName, phoneNumber.
 * Optional: secondLastName, file (handled by multer).
 */
export const updateMyAccountSchema = z.object({
  name: nonBlankString(100),
  firstLastName: nonBlankString(100),
  secondLastName: z
    .string()
    .transform((val) => val.trim())
    .transform((val) => (val === "" ? undefined : val))
    .pipe(z.string().max(100, "Must be at most 100 characters").optional())
    .optional(),
  phoneNumber: nonBlankString(20),
});

/**
 * Validates PATCH body for updating an employee.
 * All fields are optional. When present, they must satisfy the same constraints as creation.
 * Note: The "at least one field or file" refinement is checked in the controller
 * since req.file is not available in the Zod schema context.
 */
export const updateEmployeeSchema = z.object({
  name: nonBlankString(100).optional(),
  firstLastName: nonBlankString(100).optional(),
  secondLastName: z
    .string()
    .transform((val) => val.trim())
    .transform((val) => (val === "" ? undefined : val))
    .pipe(z.string().max(100, "Must be at most 100 characters").optional())
    .optional(),
  phoneNumber: nonBlankString(20).optional(),
  email: z
    .string()
    .email({ message: "Must be a valid email" })
    .max(150, "email must be at most 150 characters")
    .optional(),
  securityRoleId: z
    .string()
    .uuid({ message: "securityRoleId must be a valid UUID" })
    .optional(),
  jobTitleId: z
    .string()
    .uuid({ message: "jobTitleId must be a valid UUID" })
    .optional(),
  status: z.boolean({ message: "status must be a boolean" }).optional(),
});
