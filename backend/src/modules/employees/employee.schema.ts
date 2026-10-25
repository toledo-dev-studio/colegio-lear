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
    .refine((val) => val.length >= 1, { message: "No debe estar vacío" })
    .refine((val) => val.length <= maxLength, {
      message: `Debe tener como máximo ${maxLength} caracteres`,
    });
}

/**
 * Schema for optional secondLastName field.
 * Accepts string, null, or undefined. Trims and converts empty/null to undefined.
 */
function optionalSecondLastName() {
  return z
    .string()
    .nullable()
    .optional()
    .transform((val) => {
      if (val === null || val === undefined) return undefined;
      const trimmed = val.trim();
      return trimmed === "" ? undefined : trimmed;
    })
    .pipe(
      z.string().max(100, "Debe tener como máximo 100 caracteres").optional(),
    );
}

/**
 * Boolean field that also accepts multipart/form-data string values
 * ("true"/"false"), since multer sends every field as a string.
 */
function multipartBoolean() {
  return z
    .union([z.boolean(), z.enum(["true", "false"])])
    .transform((val) => (typeof val === "boolean" ? val : val === "true"))
    .optional();
}

// ─── Schemas ────────────────────────────────────────────────────────────────

/**
 * Validates UUID path parameter.
 */
export const idParamSchema = z.object({
  id: z.string().uuid({ message: "id debe ser un UUID válido" }),
});

/**
 * Validates optional query filters for employee list endpoints.
 * - q: free-text search on name, firstLastName, secondLastName, or email (case-insensitive, max 100 chars)
 * - fullName: filter by name (case-insensitive contains, max 100 chars)
 * - isActive: filter by active/inactive status ("true" | "false")
 * - securityRoleId: filter by securityRoleId (UUID)
 * - jobTitleId: filter by jobTitleId (UUID)
 */
export const employeeFiltersSchema = z.object({
  q: z.string().max(100, "q debe tener como máximo 100 caracteres").optional(),
  fullName: z
    .string()
    .max(100, "fullName debe tener como máximo 100 caracteres")
    .optional(),
  isActive: z.enum(["true", "false"]).optional(),
  securityRoleId: z
    .string()
    .uuid({ message: "securityRoleId debe ser un UUID válido" })
    .optional(),
  jobTitleId: z
    .string()
    .uuid({ message: "jobTitleId debe ser un UUID válido" })
    .optional(),
});

/**
 * Validates query for the employees paged endpoint.
 * Extends employeeFiltersSchema with pagination parameters.
 * Query string values arrive as strings, so page and pageSize use z.coerce.number().
 */
export const employeePagedQuerySchema = employeeFiltersSchema.extend({
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
 * Validates POST body for creating an employee.
 * All fields are required. This is a plain JSON body — the avatar is
 * uploaded separately via POST /employees/:id/avatar once the employee exists.
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
  secondLastName: optionalSecondLastName(),
  phoneNumber: nonBlankString(20),
  email: z
    .string()
    .email({ message: "Debe ser un correo electrónico válido" })
    .max(150, "email debe tener como máximo 150 caracteres"),
  securityRoleId: z
    .string()
    .uuid({ message: "securityRoleId debe ser un UUID válido" }),
  jobTitleId: z
    .string()
    .uuid({ message: "jobTitleId debe ser un UUID válido" }),
  isActive: multipartBoolean(),
});

/**
 * Validates PATCH /employees/me body for updating the authenticated employee's own account.
 * Required: name, firstLastName, phoneNumber.
 * Optional: secondLastName. Avatar is uploaded separately via POST /employees/me/avatar.
 */
export const updateMyAccountSchema = z.object({
  name: nonBlankString(100),
  firstLastName: nonBlankString(100),
  secondLastName: optionalSecondLastName(),
  phoneNumber: nonBlankString(20),
});

/**
 * Validates PATCH body for updating an employee.
 * All fields are optional. When present, they must satisfy the same constraints as creation.
 * Note: The "at least one field" refinement is checked in the controller.
 */
export const updateEmployeeSchema = z.object({
  name: nonBlankString(100).optional(),
  firstLastName: nonBlankString(100).optional(),
  secondLastName: optionalSecondLastName(),
  phoneNumber: nonBlankString(20).optional(),
  email: z
    .string()
    .email({ message: "Debe ser un correo electrónico válido" })
    .max(150, "email debe tener como máximo 150 caracteres")
    .optional(),
  securityRoleId: z
    .string()
    .uuid({ message: "securityRoleId debe ser un UUID válido" })
    .optional(),
  jobTitleId: z
    .string()
    .uuid({ message: "jobTitleId debe ser un UUID válido" })
    .optional(),
  isActive: multipartBoolean(),
});
