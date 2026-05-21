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
  id: z.string().uuid({ message: "id must be a valid UUID" }),
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
 *       name: status
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
  q: z.string().max(100, "q must be at most 100 characters").optional(),
  name: z.string().max(150, "name must be at most 150 characters").optional(),
  status: z.enum(["true", "false"]).optional(),
  academicLevelId: z
    .string()
    .uuid({ message: "academicLevelId must be a valid UUID" })
    .optional(),
  educationLevelId: z
    .string()
    .uuid({ message: "educationLevelId must be a valid UUID" })
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
 */
export const createSchoolSubjectSchema = z.object({
  name: nonBlankString(150),
  description: nonBlankString(500).optional(),
  academicLevelId: z
    .string()
    .uuid({ message: "academicLevelId must be a valid UUID" }),
  educationLevelId: z
    .string()
    .uuid({ message: "educationLevelId must be a valid UUID" }),
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
 *         status:
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
    description: nonBlankString(500).optional(),
    status: z.boolean({ message: "status must be a boolean" }).optional(),
    academicLevelId: z
      .string()
      .uuid({ message: "academicLevelId must be a valid UUID" })
      .optional(),
    educationLevelId: z
      .string()
      .uuid({ message: "educationLevelId must be a valid UUID" })
      .optional(),
  })
  .refine((data) => Object.values(data).some((value) => value !== undefined), {
    message: "At least one field is required",
  });
