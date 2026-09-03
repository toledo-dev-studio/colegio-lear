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
 *     IdParam:
 *       in: path
 *       name: id
 *       required: true
 *       schema:
 *         type: string
 *         format: uuid
 *       description: UUID of the school subject
 */
export const idParamSchema = z.object({
  id: z.string().uuid({ message: "id debe ser un UUID válido" }),
});

/**
 * Validates optional query filters for list endpoints.
 *
 * @swagger
 * components:
 *   parameters:
 *     SubjectFilterQ:
 *       in: query
 *       name: q
 *       schema:
 *         type: string
 *         maxLength: 100
 *       description: Free-text search on name and description (case-insensitive)
 *     SubjectFilterName:
 *       in: query
 *       name: name
 *       schema:
 *         type: string
 *         maxLength: 150
 *       description: Filter by subject name (case-insensitive contains)
 *     SubjectFilterStatus:
 *       in: query
 *       name: isActive
 *       schema:
 *         type: string
 *         enum: [true, false]
 *       description: Filter by active/inactive status
 *     SubjectFilterAcademicLevelId:
 *       in: query
 *       name: academicLevelId
 *       schema:
 *         type: string
 *         format: uuid
 *       description: Filter by academic level UUID
 *     SubjectFilterEducationLevelId:
 *       in: query
 *       name: educationLevelId
 *       schema:
 *         type: string
 *         format: uuid
 *       description: Filter by education level UUID
 */
export const subjectFiltersSchema = z.object({
  q: z.string().max(100, "q debe tener como máximo 100 caracteres").optional(),
  name: z
    .string()
    .max(150, "name debe tener como máximo 150 caracteres")
    .optional(),
  isActive: z.enum(["true", "false"]).optional(),
  academicLevelId: z
    .string()
    .uuid({ message: "academicLevelId debe ser un UUID válido" })
    .optional(),
  educationLevelId: z
    .string()
    .uuid({ message: "educationLevelId debe ser un UUID válido" })
    .optional(),
});

/**
 * Validates query for the paged endpoint.
 * Extends subjectFiltersSchema with pagination parameters.
 * Query string values arrive as strings, so page and pageSize use z.coerce.number().
 *
 * @swagger
 * components:
 *   parameters:
 *     PageParam:
 *       in: query
 *       name: page
 *       schema:
 *         type: integer
 *         minimum: 1
 *         default: 1
 *       description: Page number (positive integer, defaults to 1)
 *     PageSizeParam:
 *       in: query
 *       name: pageSize
 *       schema:
 *         type: integer
 *         minimum: 1
 *         maximum: 100
 *         default: 10
 *       description: Items per page (positive integer, max 100, defaults to 10)
 */
export const pagedQuerySchema = subjectFiltersSchema.extend({
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
 * Validates POST body for creating a school subject.
 *
 * @swagger
 * components:
 *   schemas:
 *     CreateSchoolSubjectBody:
 *       type: object
 *       required:
 *         - name
 *         - description
 *         - academicLevelId
 *         - educationLevelId
 *       properties:
 *         name:
 *           type: string
 *           minLength: 1
 *           maxLength: 150
 *           description: Subject name (trimmed, non-blank)
 *         description:
 *           type: string
 *           minLength: 1
 *           maxLength: 500
 *           description: Subject description (trimmed, non-blank)
 *         academicLevelId:
 *           type: string
 *           format: uuid
 *           description: UUID of the academic level
 *         educationLevelId:
 *           type: string
 *           format: uuid
 *           description: UUID of the education level
 *         isActive:
 *           type: boolean
 *           default: true
 *           description: Whether the subject is active
 */
export const createSchoolSubjectSchema = z.object({
  name: nonBlankString(150),
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
  academicLevelId: z
    .string()
    .uuid({ message: "academicLevelId debe ser un UUID válido" }),
  educationLevelId: z
    .string()
    .uuid({ message: "educationLevelId debe ser un UUID válido" }),
  isActive: z.boolean({ message: "isActive debe ser un booleano" }).optional(),
});

/**
 * Validates PATCH body for updating a school subject.
 * All fields are optional but at least one must be provided.
 *
 * @swagger
 * components:
 *   schemas:
 *     UpdateSchoolSubjectBody:
 *       type: object
 *       minProperties: 1
 *       properties:
 *         name:
 *           type: string
 *           minLength: 1
 *           maxLength: 150
 *           description: Subject name (trimmed, non-blank)
 *         description:
 *           type: string
 *           minLength: 1
 *           maxLength: 500
 *           description: Subject description (trimmed, non-blank)
 *         isActive:
 *           type: boolean
 *           description: Active/inactive status
 *         academicLevelId:
 *           type: string
 *           format: uuid
 *           description: UUID of the academic level
 *         educationLevelId:
 *           type: string
 *           format: uuid
 *           description: UUID of the education level
 */
export const updateSchoolSubjectSchema = z
  .object({
    name: nonBlankString(150).optional(),
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
    isActive: z.boolean({ message: "isActive debe ser un booleano" }).optional(),
    academicLevelId: z
      .string()
      .uuid({ message: "academicLevelId debe ser un UUID válido" })
      .optional(),
    educationLevelId: z
      .string()
      .uuid({ message: "educationLevelId debe ser un UUID válido" })
      .optional(),
  })
  .refine((data) => Object.values(data).some((value) => value !== undefined), {
    message: "Se requiere al menos un campo",
  });
