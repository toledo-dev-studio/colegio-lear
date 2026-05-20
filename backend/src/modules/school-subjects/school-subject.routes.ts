import { Router } from "express";
import { validate } from "../../shared/middleware/validate.middleware";
import {
  idParamSchema,
  subjectFiltersSchema,
  pagedQuerySchema,
  createSchoolSubjectSchema,
  updateSchoolSubjectSchema,
} from "./school-subject.schema";
import {
  findAll,
  findAllPaged,
  findById,
  create,
  update,
  softDelete,
} from "./school-subject.controller";

const router = Router();

/**
 * @openapi
 * /school-subjects:
 *   get:
 *     tags:
 *       - School Subjects
 *     summary: List all school subjects
 *     description: Returns all school subjects with optional filters (q, name, status, academicLevelId, educationLevelId). Filters are combined with AND logic.
 *     parameters:
 *       - $ref: '#/components/parameters/SubjectFilterQ'
 *       - $ref: '#/components/parameters/SubjectFilterName'
 *       - $ref: '#/components/parameters/SubjectFilterStatus'
 *       - $ref: '#/components/parameters/SubjectFilterAcademicLevelId'
 *       - $ref: '#/components/parameters/SubjectFilterEducationLevelId'
 *     responses:
 *       200:
 *         description: List of school subjects
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: Success
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/SubjectView'
 *       400:
 *         description: Validation error
 */
router.get("/", validate(subjectFiltersSchema, "query"), findAll);

/**
 * @openapi
 * /school-subjects/paged:
 *   get:
 *     tags:
 *       - School Subjects
 *     summary: List school subjects with pagination
 *     description: Returns a paginated list of school subjects with optional filters and pagination parameters.
 *     parameters:
 *       - $ref: '#/components/parameters/SubjectFilterQ'
 *       - $ref: '#/components/parameters/SubjectFilterName'
 *       - $ref: '#/components/parameters/SubjectFilterStatus'
 *       - $ref: '#/components/parameters/SubjectFilterAcademicLevelId'
 *       - $ref: '#/components/parameters/SubjectFilterEducationLevelId'
 *       - $ref: '#/components/parameters/PageParam'
 *       - $ref: '#/components/parameters/PageSizeParam'
 *     responses:
 *       200:
 *         description: Paginated list of school subjects
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: Success
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/SubjectView'
 *                 pagination:
 *                   $ref: '#/components/schemas/PaginationMeta'
 *       400:
 *         description: Validation error
 */
router.get("/paged", validate(pagedQuerySchema, "query"), findAllPaged);

/**
 * @openapi
 * /school-subjects/{id}:
 *   get:
 *     tags:
 *       - School Subjects
 *     summary: Get a school subject by ID
 *     description: Returns a single school subject by its UUID.
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: School subject found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: Success
 *                 data:
 *                   $ref: '#/components/schemas/SubjectView'
 *       400:
 *         description: Invalid UUID format
 *       404:
 *         description: School subject not found
 */
router.get("/:id", validate(idParamSchema, "params"), findById);

/**
 * @openapi
 * /school-subjects:
 *   post:
 *     tags:
 *       - School Subjects
 *     summary: Create a new school subject
 *     description: Creates a new school subject with the provided data. Validates uniqueness of name within the same education level.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateSchoolSubjectBody'
 *     responses:
 *       201:
 *         description: School subject created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 201
 *                 message:
 *                   type: string
 *                   example: School subject created
 *                 data:
 *                   $ref: '#/components/schemas/SchoolSubjectRecord'
 *       400:
 *         description: Validation error
 *       404:
 *         description: Academic level or education level not found
 *       409:
 *         description: Duplicate name for the same education level
 */
router.post("/", validate(createSchoolSubjectSchema, "body"), create);

/**
 * @openapi
 * /school-subjects/{id}:
 *   patch:
 *     tags:
 *       - School Subjects
 *     summary: Update a school subject
 *     description: Partially updates a school subject. At least one field must be provided.
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateSchoolSubjectBody'
 *     responses:
 *       200:
 *         description: School subject updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: School subject updated
 *                 data:
 *                   $ref: '#/components/schemas/SchoolSubjectRecord'
 *       400:
 *         description: Validation error or empty body
 *       404:
 *         description: School subject not found
 *       409:
 *         description: Duplicate name for the same education level
 */
router.patch(
  "/:id",
  validate(idParamSchema, "params"),
  validate(updateSchoolSubjectSchema, "body"),
  update,
);

/**
 * @openapi
 * /school-subjects/{id}:
 *   delete:
 *     tags:
 *       - School Subjects
 *     summary: Soft delete a school subject
 *     description: Sets the school subject status to inactive (soft delete). Returns 409 if already inactive.
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       204:
 *         description: Eliminado correctamente (No Content)
 *       400:
 *         description: Invalid UUID format
 *       404:
 *         description: School subject not found
 *       409:
 *         description: School subject is already inactive
 */
router.delete("/:id", validate(idParamSchema, "params"), softDelete);

export default router;
