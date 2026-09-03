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
 *
 * @swagger
 * components:
 *   parameters:
 *     ScholarshipIdParam:
 *       in: path
 *       name: id
 *       required: true
 *       schema:
 *         type: string
 *         format: uuid
 *       description: UUID of the scholarship
 */
export const idParamSchema = z.object({
  id: z.string().uuid({ message: "id debe ser un UUID válido" }),
});

/**
 * Validates optional query filters for scholarship list endpoints.
 *
 * @swagger
 * components:
 *   parameters:
 *     ScholarshipFilterQ:
 *       in: query
 *       name: q
 *       schema:
 *         type: string
 *         maxLength: 100
 *       description: Free-text search on name and description (case-insensitive)
 *     ScholarshipFilterName:
 *       in: query
 *       name: name
 *       schema:
 *         type: string
 *         maxLength: 100
 *       description: Filter by scholarship name (case-insensitive contains)
 *     ScholarshipFilterStatus:
 *       in: query
 *       name: isActive
 *       schema:
 *         type: string
 *         enum: [true, false]
 *       description: Filter by active/inactive status
 *     ScholarshipFilterDiscountPercentage:
 *       in: query
 *       name: discountPercentage
 *       schema:
 *         type: number
 *         minimum: 0
 *         maximum: 100
 *       description: Filter by maximum discount percentage (matches scholarships at or below this value)
 */
export const scholarshipFiltersSchema = z.object({
  q: z.string().max(100, "q debe tener como máximo 100 caracteres").optional(),
  name: z
    .string()
    .max(100, "name debe tener como máximo 100 caracteres")
    .optional(),
  isActive: z.enum(["true", "false"]).optional(),
  discountPercentage: z.coerce
    .number({ message: "discountPercentage debe ser un número" })
    .min(0, "discountPercentage debe ser al menos 0")
    .max(100, "discountPercentage debe ser como máximo 100")
    .optional(),
});

/**
 * Validates query for the scholarships paged endpoint.
 * Extends scholarshipFiltersSchema with pagination parameters.
 * Query string values arrive as strings, so page and pageSize use z.coerce.number().
 *
 * @swagger
 * components:
 *   parameters:
 *     ScholarshipPageParam:
 *       in: query
 *       name: page
 *       schema:
 *         type: integer
 *         minimum: 1
 *         default: 1
 *       description: Page number (positive integer, defaults to 1)
 *     ScholarshipPageSizeParam:
 *       in: query
 *       name: pageSize
 *       schema:
 *         type: integer
 *         minimum: 1
 *         maximum: 100
 *         default: 10
 *       description: Items per page (positive integer, max 100, defaults to 10)
 */
export const scholarshipPagedQuerySchema = scholarshipFiltersSchema.extend({
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
 * Validates POST body for creating a scholarship.
 *
 * @swagger
 * components:
 *   schemas:
 *     CreateScholarshipBody:
 *       type: object
 *       required:
 *         - name
 *         - description
 *         - discountPercentage
 *       properties:
 *         name:
 *           type: string
 *           minLength: 1
 *           maxLength: 100
 *           description: Scholarship name (trimmed, non-blank)
 *         description:
 *           type: string
 *           minLength: 1
 *           maxLength: 500
 *           description: Scholarship description (trimmed, non-blank)
 *         discountPercentage:
 *           type: number
 *           minimum: 0
 *           maximum: 100
 *           description: Discount percentage (0-100)
 *         isActive:
 *           type: boolean
 *           default: true
 *           description: Whether the scholarship is active
 */
export const createScholarshipSchema = z.object({
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
  discountPercentage: z
    .number({ message: "discountPercentage debe ser un número" })
    .min(0, "discountPercentage debe ser al menos 0")
    .max(100, "discountPercentage debe ser como máximo 100"),
  isActive: z.boolean({ message: "isActive debe ser un booleano" }).optional(),
});

/**
 * Validates PATCH body for updating a scholarship.
 * All fields are optional but at least one must be provided.
 *
 * @swagger
 * components:
 *   schemas:
 *     UpdateScholarshipBody:
 *       type: object
 *       minProperties: 1
 *       properties:
 *         name:
 *           type: string
 *           minLength: 1
 *           maxLength: 100
 *           description: Scholarship name (trimmed, non-blank)
 *         description:
 *           type: string
 *           minLength: 1
 *           maxLength: 500
 *           description: Scholarship description (trimmed, non-blank)
 *         discountPercentage:
 *           type: number
 *           minimum: 0
 *           maximum: 100
 *           description: Discount percentage (0-100)
 *         isActive:
 *           type: boolean
 *           description: Whether the scholarship is active
 */
export const updateScholarshipSchema = z
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
    discountPercentage: z
      .number({ message: "discountPercentage debe ser un número" })
      .min(0, "discountPercentage debe ser al menos 0")
      .max(100, "discountPercentage debe ser como máximo 100")
      .optional(),
    isActive: z.boolean({ message: "isActive debe ser un booleano" }).optional(),
  })
  .refine((data) => Object.values(data).some((value) => value !== undefined), {
    message: "Se requiere al menos un campo",
  });
