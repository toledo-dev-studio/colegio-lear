import { Router } from "express";
import { validate } from "../../shared/middleware/validate.middleware";
import { authorize } from "../../shared/middleware/rbac.middleware";
import {
  idParamSchema,
  jobTitleFiltersSchema,
  jobTitlePagedQuerySchema,
  createJobTitleSchema,
  updateJobTitleSchema,
} from "./job-title.schema";
import {
  findAll,
  findAllPaged,
  findById,
  create,
  update,
  softDelete,
} from "./job-title.controller";

const router = Router();

/**
 * @openapi
 * /job-titles:
 *   get:
 *     tags:
 *       - Job Titles
 *     summary: List all job titles
 *     description: Returns all job titles matching the optional query filters.
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *           maxLength: 100
 *         description: Free-text search on name and description (case-insensitive)
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *           maxLength: 100
 *         description: Filter by name (case-insensitive contains)
 *       - in: query
 *         name: jobTitleType
 *         schema:
 *           type: string
 *           enum: [teacher, administrative-staff]
 *         description: Filter by job title type
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: string
 *           enum: [true, false]
 *         description: Filter by active/inactive status
 *     responses:
 *       200:
 *         description: List of job titles
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/JobTitle'
 */
router.get(
  "/",
  authorize("job-titles"),
  validate(jobTitleFiltersSchema, "query"),
  findAll,
);

/**
 * @openapi
 * /job-titles/paged:
 *   get:
 *     tags:
 *       - Job Titles
 *     summary: List job titles with pagination
 *     description: Returns a paginated list of job titles matching the optional query filters.
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *           maxLength: 100
 *         description: Free-text search on name and description (case-insensitive)
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *           maxLength: 100
 *         description: Filter by name (case-insensitive contains)
 *       - in: query
 *         name: jobTitleType
 *         schema:
 *           type: string
 *           enum: [teacher, administrative-staff]
 *         description: Filter by job title type
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: string
 *           enum: [true, false]
 *         description: Filter by active/inactive status
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Items per page
 *     responses:
 *       200:
 *         description: Paginated list of job titles
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/JobTitle'
 *                 totalPages:
 *                   type: integer
 *                   example: 3
 *                 currentPage:
 *                   type: integer
 *                   example: 1
 *                 itemsCount:
 *                   type: integer
 *                   example: 25
 *       400:
 *         description: Invalid pagination parameters
 */
// Also read by the employee form's job-title picker, so either module
// grants access.
router.get(
  "/paged",
  authorize(["job-titles", "employees"]),
  validate(jobTitlePagedQuerySchema, "query"),
  findAllPaged,
);

/**
 * @openapi
 * /job-titles:
 *   post:
 *     tags:
 *       - Job Titles
 *     summary: Create a new job title
 *     description: Creates a new job title with the provided name, description, type, and isActive. isActive defaults to true.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateJobTitleDto'
 *     responses:
 *       201:
 *         description: Job title created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JobTitle'
 *       400:
 *         description: Validation error
 *       409:
 *         description: Job title with this name already exists
 */
router.post(
  "/",
  authorize("job-titles"),
  validate(createJobTitleSchema, "body"),
  create,
);

/**
 * @openapi
 * /job-titles/{id}:
 *   get:
 *     tags:
 *       - Job Titles
 *     summary: Get job title by ID
 *     description: Returns a single job title by its UUID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Job title UUID
 *     responses:
 *       200:
 *         description: Job title detail
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JobTitle'
 *       400:
 *         description: Invalid UUID format
 *       404:
 *         description: Job title not found
 */
router.get(
  "/:id",
  authorize("job-titles"),
  validate(idParamSchema, "params"),
  findById,
);

/**
 * @openapi
 * /job-titles/{id}:
 *   patch:
 *     tags:
 *       - Job Titles
 *     summary: Update a job title
 *     description: Partially updates an existing job title. At least one field must be provided.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Job title UUID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateJobTitleDto'
 *     responses:
 *       200:
 *         description: Job title updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JobTitle'
 *       400:
 *         description: Validation error or empty body
 *       404:
 *         description: Job title not found
 *       409:
 *         description: Name conflict with another job title
 */
router.patch(
  "/:id",
  authorize("job-titles"),
  validate(idParamSchema, "params"),
  validate(updateJobTitleSchema, "body"),
  update,
);

/**
 * @openapi
 * /job-titles/{id}:
 *   delete:
 *     tags:
 *       - Job Titles
 *     summary: Soft delete a job title
 *     description: Sets the job title isDeleted flag to true (logical deletion). Does not remove the record.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Job title UUID
 *     responses:
 *       204:
 *         description: Eliminado correctamente (No Content)
 *       400:
 *         description: Invalid UUID format
 *       404:
 *         description: Job title not found
 *       409:
 *         description: Job title is already inactive
 */
router.delete(
  "/:id",
  authorize("job-titles"),
  validate(idParamSchema, "params"),
  softDelete,
);

export default router;
