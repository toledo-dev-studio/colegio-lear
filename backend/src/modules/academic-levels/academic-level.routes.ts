import { Router } from "express";
import { validate } from "../../shared/middleware/validate.middleware";
import {
  idParamSchema,
  academicLevelFiltersSchema,
  academicLevelPagedQuerySchema,
  educationLevelPagedQuerySchema,
  createAcademicLevelSchema,
  updateAcademicLevelSchema,
} from "./academic-level.schema";
import {
  findAll,
  findAllPaged,
  findById,
  create,
  update,
  softDelete,
  findEducationLevelsPaged,
} from "./academic-level.controller";

const router = Router();

/**
 * @openapi
 * /academic-levels:
 *   get:
 *     tags:
 *       - Academic Levels
 *     summary: List all academic levels
 *     description: Returns all academic levels matching the optional query filters.
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
 *         name: status
 *         schema:
 *           type: string
 *           enum: [true, false]
 *         description: Filter by active/inactive status
 *     responses:
 *       200:
 *         description: List of academic levels
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/AcademicLevel'
 */
router.get("/", validate(academicLevelFiltersSchema, "query"), findAll);

/**
 * @openapi
 * /academic-levels/paged:
 *   get:
 *     tags:
 *       - Academic Levels
 *     summary: List academic levels with pagination
 *     description: Returns a paginated list of academic levels matching the optional query filters.
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *           maxLength: 100
 *         description: Free-text search on name and description
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *           maxLength: 100
 *         description: Filter by name (case-insensitive contains)
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
 *         description: Paginated list of academic levels
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/AcademicLevel'
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
router.get(
  "/paged",
  validate(academicLevelPagedQuerySchema, "query"),
  findAllPaged,
);

/**
 * @openapi
 * /academic-levels/education-levels/paged:
 *   get:
 *     tags:
 *       - Academic Levels
 *     summary: List education levels with pagination
 *     description: Returns a paginated list of education levels (sub-resource) with optional filters.
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *           maxLength: 100
 *         description: Search by education level name (case-insensitive)
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [true, false]
 *         description: Filter by parent academic level status
 *       - in: query
 *         name: academicLevelId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by parent academic level ID
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
 *         description: Paginated list of education levels
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/EducationLevel'
 *                 totalPages:
 *                   type: integer
 *                   example: 2
 *                 currentPage:
 *                   type: integer
 *                   example: 1
 *                 itemsCount:
 *                   type: integer
 *                   example: 12
 *       400:
 *         description: Invalid parameters
 */
router.get(
  "/education-levels/paged",
  validate(educationLevelPagedQuerySchema, "query"),
  findEducationLevelsPaged,
);

/**
 * @openapi
 * /academic-levels:
 *   post:
 *     tags:
 *       - Academic Levels
 *     summary: Create a new academic level
 *     description: Creates a new academic level with the provided name and description. Status defaults to true.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateAcademicLevelDto'
 *     responses:
 *       201:
 *         description: Academic level created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AcademicLevelDetail'
 *       400:
 *         description: Validation error
 *       409:
 *         description: Academic level with this name already exists
 */
router.post("/", validate(createAcademicLevelSchema, "body"), create);

/**
 * @openapi
 * /academic-levels/{id}:
 *   get:
 *     tags:
 *       - Academic Levels
 *     summary: Get academic level by ID
 *     description: Returns a single academic level with its associated education levels.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Academic level UUID
 *     responses:
 *       200:
 *         description: Academic level detail with education levels
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AcademicLevelDetail'
 *       400:
 *         description: Invalid UUID format
 *       404:
 *         description: Academic level not found
 */
router.get("/:id", validate(idParamSchema, "params"), findById);

/**
 * @openapi
 * /academic-levels/{id}:
 *   patch:
 *     tags:
 *       - Academic Levels
 *     summary: Update an academic level
 *     description: Partially updates an existing academic level. At least one field must be provided.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Academic level UUID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateAcademicLevelDto'
 *     responses:
 *       200:
 *         description: Academic level updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AcademicLevelDetail'
 *       400:
 *         description: Validation error or empty body
 *       404:
 *         description: Academic level not found
 *       409:
 *         description: Name conflict with another academic level
 */
router.patch(
  "/:id",
  validate(idParamSchema, "params"),
  validate(updateAcademicLevelSchema, "body"),
  update,
);

/**
 * @openapi
 * /academic-levels/{id}:
 *   delete:
 *     tags:
 *       - Academic Levels
 *     summary: Soft delete an academic level
 *     description: Sets the academic level status to false (logical deletion). Does not remove the record.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Academic level UUID
 *     responses:
 *       204:
 *         description: Eliminado correctamente (No Content)
 *       400:
 *         description: Invalid UUID format
 *       404:
 *         description: Academic level not found
 *       409:
 *         description: Academic level is already inactive
 */
router.delete("/:id", validate(idParamSchema, "params"), softDelete);

export default router;
