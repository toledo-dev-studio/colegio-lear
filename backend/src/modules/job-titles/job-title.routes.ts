import { Router } from "express";
import { validate } from "../../shared/middleware/validate.middleware";
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
 *         name: status
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
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: Job titles retrieved
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/JobTitle'
 */
router.get("/", validate(jobTitleFiltersSchema, "query"), findAll);

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
 *         name: status
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
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/JobTitle'
 *                 pagination:
 *                   $ref: '#/components/schemas/PaginationMeta'
 *       400:
 *         description: Invalid pagination parameters
 */
router.get("/paged", validate(jobTitlePagedQuerySchema, "query"), findAllPaged);

/**
 * @openapi
 * /job-titles:
 *   post:
 *     tags:
 *       - Job Titles
 *     summary: Create a new job title
 *     description: Creates a new job title with the provided name, description, and type. Status defaults to true.
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
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 201
 *                 message:
 *                   type: string
 *                   example: Puesto creado correctamente
 *                 data:
 *                   $ref: '#/components/schemas/JobTitle'
 *       400:
 *         description: Validation error
 *       409:
 *         description: Job title with this name already exists
 */
router.post("/", validate(createJobTitleSchema, "body"), create);

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
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/JobTitle'
 *       400:
 *         description: Invalid UUID format
 *       404:
 *         description: Job title not found
 */
router.get("/:id", validate(idParamSchema, "params"), findById);

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
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/JobTitle'
 *       400:
 *         description: Validation error or empty body
 *       404:
 *         description: Job title not found
 *       409:
 *         description: Name conflict with another job title
 */
router.patch(
  "/:id",
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
 *     description: Sets the job title status to false (logical deletion). Does not remove the record.
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
 *         description: Job title deactivated
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
 *                   example: Puesto desactivado correctamente
 *                 data:
 *                   type: "null"
 *       400:
 *         description: Invalid UUID format
 *       404:
 *         description: Job title not found
 *       409:
 *         description: Job title is already inactive
 */
router.delete("/:id", validate(idParamSchema, "params"), softDelete);

export default router;
