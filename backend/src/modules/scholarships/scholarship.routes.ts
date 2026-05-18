import { Router } from "express";
import { validate } from "../../shared/middleware/validate.middleware";
import {
  idParamSchema,
  scholarshipFiltersSchema,
  scholarshipPagedQuerySchema,
  createScholarshipSchema,
  updateScholarshipSchema,
} from "./scholarship.schema";
import {
  findAll,
  findAllPaged,
  findById,
  create,
  update,
  softDelete,
} from "./scholarship.controller";

const router = Router();

/**
 * @openapi
 * /scholarships:
 *   get:
 *     tags:
 *       - Scholarships
 *     summary: List all scholarships
 *     description: Returns all scholarships with optional filters (q, name, status, discountPercentage). Filters are combined with AND logic.
 *     parameters:
 *       - $ref: '#/components/parameters/ScholarshipFilterQ'
 *       - $ref: '#/components/parameters/ScholarshipFilterName'
 *       - $ref: '#/components/parameters/ScholarshipFilterStatus'
 *       - $ref: '#/components/parameters/ScholarshipFilterDiscountPercentage'
 *     responses:
 *       200:
 *         description: List of scholarships
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
 *                   example: Scholarships retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ScholarshipRecord'
 *       400:
 *         description: Validation error
 */
router.get("/", validate(scholarshipFiltersSchema, "query"), findAll);

/**
 * @openapi
 * /scholarships/paged:
 *   get:
 *     tags:
 *       - Scholarships
 *     summary: List scholarships with pagination
 *     description: Returns a paginated list of scholarships with optional filters and pagination parameters.
 *     parameters:
 *       - $ref: '#/components/parameters/ScholarshipFilterQ'
 *       - $ref: '#/components/parameters/ScholarshipFilterName'
 *       - $ref: '#/components/parameters/ScholarshipFilterStatus'
 *       - $ref: '#/components/parameters/ScholarshipFilterDiscountPercentage'
 *       - $ref: '#/components/parameters/ScholarshipPageParam'
 *       - $ref: '#/components/parameters/ScholarshipPageSizeParam'
 *     responses:
 *       200:
 *         description: Paginated list of scholarships
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
 *                   example: Scholarships retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ScholarshipRecord'
 *                 pagination:
 *                   $ref: '#/components/schemas/PaginationMeta'
 *       400:
 *         description: Validation error
 */
router.get(
  "/paged",
  validate(scholarshipPagedQuerySchema, "query"),
  findAllPaged,
);

/**
 * @openapi
 * /scholarships/{id}:
 *   get:
 *     tags:
 *       - Scholarships
 *     summary: Get a scholarship by ID
 *     description: Returns a single scholarship by its UUID.
 *     parameters:
 *       - $ref: '#/components/parameters/ScholarshipIdParam'
 *     responses:
 *       200:
 *         description: Scholarship found
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
 *                   example: Scholarship retrieved successfully
 *                 data:
 *                   $ref: '#/components/schemas/ScholarshipRecord'
 *       400:
 *         description: Invalid UUID format
 *       404:
 *         description: Scholarship not found
 */
router.get("/:id", validate(idParamSchema, "params"), findById);

/**
 * @openapi
 * /scholarships:
 *   post:
 *     tags:
 *       - Scholarships
 *     summary: Create a new scholarship
 *     description: Creates a new scholarship with the provided data. Validates uniqueness of name (case-insensitive).
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateScholarshipBody'
 *     responses:
 *       201:
 *         description: Scholarship created successfully
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
 *                   example: Scholarship created successfully
 *                 data:
 *                   $ref: '#/components/schemas/ScholarshipRecord'
 *       400:
 *         description: Validation error
 *       409:
 *         description: Duplicate scholarship name
 */
router.post("/", validate(createScholarshipSchema, "body"), create);

/**
 * @openapi
 * /scholarships/{id}:
 *   patch:
 *     tags:
 *       - Scholarships
 *     summary: Update a scholarship
 *     description: Partially updates a scholarship. At least one field must be provided.
 *     parameters:
 *       - $ref: '#/components/parameters/ScholarshipIdParam'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateScholarshipBody'
 *     responses:
 *       200:
 *         description: Scholarship updated successfully
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
 *                   example: Scholarship updated successfully
 *                 data:
 *                   $ref: '#/components/schemas/ScholarshipRecord'
 *       400:
 *         description: Validation error or empty body
 *       404:
 *         description: Scholarship not found
 *       409:
 *         description: Duplicate scholarship name
 */
router.patch(
  "/:id",
  validate(idParamSchema, "params"),
  validate(updateScholarshipSchema, "body"),
  update,
);

/**
 * @openapi
 * /scholarships/{id}:
 *   delete:
 *     tags:
 *       - Scholarships
 *     summary: Soft delete a scholarship
 *     description: Sets the scholarship status to inactive (soft delete). Returns 409 if already inactive.
 *     parameters:
 *       - $ref: '#/components/parameters/ScholarshipIdParam'
 *     responses:
 *       200:
 *         description: Scholarship deactivated successfully
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
 *                   example: Beca desactivada correctamente
 *                 data:
 *                   type: object
 *                   nullable: true
 *                   example: null
 *       400:
 *         description: Invalid UUID format
 *       404:
 *         description: Scholarship not found
 *       409:
 *         description: Scholarship is already inactive
 */
router.delete("/:id", validate(idParamSchema, "params"), softDelete);

export default router;
