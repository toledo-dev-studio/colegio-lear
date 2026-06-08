import { Router } from "express";
import { validate } from "../../shared/middleware/validate.middleware";
import { authorize } from "../../shared/middleware/rbac.middleware";
import {
  idParamSchema,
  academicCycleIdParamSchema,
  academicCycleSubResourceParamSchema,
  academicCycleFiltersSchema,
  academicCyclePagedQuerySchema,
  createAcademicCycleSchema,
  updateAcademicCycleSchema,
} from "./academic-cycle.schema";
import {
  createAcademicCycleSchoolSubjectSchema,
  updateAcademicCycleSchoolSubjectSchema,
} from "./academic-cycle-school-subject.schema";
import {
  createAcademicCycleWalletSchema,
  updateAcademicCycleWalletSchema,
} from "./academic-cycle-wallet.schema";
import {
  findAll,
  findAllPaged,
  findById,
  create,
  update,
  remove,
} from "./academic-cycle.controller";
import {
  findAllSchoolSubjects,
  createSchoolSubject,
  updateSchoolSubject,
  deleteSchoolSubject,
} from "./academic-cycle-school-subject.controller";
import {
  findAllWalletItems,
  createWalletItem,
  updateWalletItem,
  deleteWalletItem,
} from "./academic-cycle-wallet.controller";

const router = Router();

// ─── Academic Cycles CRUD ────────────────────────────────────────────────────

/**
 * @openapi
 * /academic-cycles:
 *   get:
 *     tags:
 *       - Academic Cycles
 *     summary: List all academic cycles
 *     description: Returns all academic cycles with optional filters (q, name, code, startDate, endDate, type, enrollmentOpen, status).
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *           maxLength: 100
 *         description: Free-text search on name, code, description
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *           maxLength: 100
 *         description: Filter by name (case-insensitive contains)
 *       - in: query
 *         name: code
 *         schema:
 *           type: string
 *           maxLength: 50
 *         description: Filter by code (case-insensitive contains)
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter cycles starting on or after this date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter cycles ending on or before this date
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [annual, semester, four-month-period, trimester, bimester, monthly, intensive, special]
 *         description: Filter by academic period type
 *       - in: query
 *         name: enrollmentOpen
 *         schema:
 *           type: string
 *           enum: [true, false]
 *         description: Filter by enrollment open status
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [upcoming, active, completed, cancelled, archived]
 *         description: Filter by cycle status
 *     responses:
 *       200:
 *         description: List of academic cycles
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/AcademicCycleRecord'
 *       400:
 *         description: Validation error
 */
router.get(
  "/",
  authorize("academic-cycles"),
  validate(academicCycleFiltersSchema, "query"),
  findAll,
);

/**
 * @openapi
 * /academic-cycles/paged:
 *   get:
 *     tags:
 *       - Academic Cycles
 *     summary: List academic cycles with pagination
 *     description: Returns a paginated list of academic cycles with optional filters.
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Free-text search
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: Filter by name
 *       - in: query
 *         name: code
 *         schema:
 *           type: string
 *         description: Filter by code
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter cycles starting on or after this date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter cycles ending on or before this date
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [annual, semester, four-month-period, trimester, bimester, monthly, intensive, special]
 *         description: Filter by type
 *       - in: query
 *         name: enrollmentOpen
 *         schema:
 *           type: string
 *           enum: [true, false]
 *         description: Filter by enrollment open
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [upcoming, active, completed, cancelled, archived]
 *         description: Filter by status
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
 *         description: Paginated list of academic cycles
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/AcademicCycleRecord'
 *                 totalPages:
 *                   type: integer
 *                 currentPage:
 *                   type: integer
 *                 itemsCount:
 *                   type: integer
 *       400:
 *         description: Validation error
 */
router.get(
  "/paged",
  authorize("academic-cycles"),
  validate(academicCyclePagedQuerySchema, "query"),
  findAllPaged,
);

/**
 * @openapi
 * /academic-cycles/{id}:
 *   get:
 *     tags:
 *       - Academic Cycles
 *     summary: Get an academic cycle by ID
 *     description: Returns a single academic cycle by UUID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Academic cycle UUID
 *     responses:
 *       200:
 *         description: Academic cycle found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AcademicCycleRecord'
 *       404:
 *         description: Academic cycle not found
 */
router.get(
  "/:id",
  authorize("academic-cycles"),
  validate(idParamSchema, "params"),
  findById,
);

/**
 * @openapi
 * /academic-cycles:
 *   post:
 *     tags:
 *       - Academic Cycles
 *     summary: Create a new academic cycle
 *     description: Creates a new academic cycle. Validates code uniqueness.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateAcademicCycleBody'
 *     responses:
 *       201:
 *         description: Academic cycle created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AcademicCycleRecord'
 *       400:
 *         description: Validation error
 *       409:
 *         description: Duplicate code
 */
router.post(
  "/",
  authorize("academic-cycles"),
  validate(createAcademicCycleSchema, "body"),
  create,
);

/**
 * @openapi
 * /academic-cycles/{id}:
 *   patch:
 *     tags:
 *       - Academic Cycles
 *     summary: Update an academic cycle
 *     description: Partially updates an academic cycle. At least one field must be provided.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateAcademicCycleBody'
 *     responses:
 *       200:
 *         description: Academic cycle updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AcademicCycleRecord'
 *       400:
 *         description: Validation error
 *       404:
 *         description: Academic cycle not found
 *       409:
 *         description: Duplicate code
 */
router.patch(
  "/:id",
  authorize("academic-cycles"),
  validate(idParamSchema, "params"),
  validate(updateAcademicCycleSchema, "body"),
  update,
);

/**
 * @openapi
 * /academic-cycles/{id}:
 *   delete:
 *     tags:
 *       - Academic Cycles
 *     summary: Cancel an academic cycle
 *     description: Sets the academic cycle status to "cancelled" (logical deletion).
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       204:
 *         description: Cancelled successfully
 *       404:
 *         description: Academic cycle not found
 */
router.delete(
  "/:id",
  authorize("academic-cycles"),
  validate(idParamSchema, "params"),
  remove,
);

// ─── Academic Cycle School Subjects ──────────────────────────────────────────

/**
 * @openapi
 * /academic-cycles/{academicCycleId}/school-subjects:
 *   get:
 *     tags:
 *       - Academic Cycle School Subjects
 *     summary: List school subjects for an academic cycle
 *     description: Returns all school subjects associated with the given academic cycle.
 *     parameters:
 *       - in: path
 *         name: academicCycleId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: List of school subjects
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/AcademicCycleSchoolSubjectRecord'
 *       404:
 *         description: Academic cycle not found
 */
router.get(
  "/:academicCycleId/school-subjects",
  authorize("academic-cycles"),
  validate(academicCycleIdParamSchema, "params"),
  findAllSchoolSubjects,
);

/**
 * @openapi
 * /academic-cycles/{academicCycleId}/school-subjects:
 *   post:
 *     tags:
 *       - Academic Cycle School Subjects
 *     summary: Add a school subject to an academic cycle
 *     description: Creates a new school subject association for the academic cycle.
 *     parameters:
 *       - in: path
 *         name: academicCycleId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateAcademicCycleSchoolSubjectBody'
 *     responses:
 *       201:
 *         description: School subject added
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AcademicCycleSchoolSubjectRecord'
 *       404:
 *         description: Academic cycle not found
 *       409:
 *         description: School subject already assigned
 */
router.post(
  "/:academicCycleId/school-subjects",
  authorize("academic-cycles"),
  validate(academicCycleIdParamSchema, "params"),
  validate(createAcademicCycleSchoolSubjectSchema, "body"),
  createSchoolSubject,
);

/**
 * @openapi
 * /academic-cycles/{academicCycleId}/school-subjects/{id}:
 *   patch:
 *     tags:
 *       - Academic Cycle School Subjects
 *     summary: Update a school subject association
 *     description: Partially updates a school subject association for the academic cycle.
 *     parameters:
 *       - in: path
 *         name: academicCycleId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateAcademicCycleSchoolSubjectBody'
 *     responses:
 *       200:
 *         description: School subject association updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AcademicCycleSchoolSubjectRecord'
 *       404:
 *         description: Academic cycle or school subject not found
 *       409:
 *         description: School subject already assigned
 */
router.patch(
  "/:academicCycleId/school-subjects/:id",
  authorize("academic-cycles"),
  validate(academicCycleSubResourceParamSchema, "params"),
  validate(updateAcademicCycleSchoolSubjectSchema, "body"),
  updateSchoolSubject,
);

/**
 * @openapi
 * /academic-cycles/{academicCycleId}/school-subjects/{id}:
 *   delete:
 *     tags:
 *       - Academic Cycle School Subjects
 *     summary: Remove a school subject from an academic cycle
 *     description: Permanently removes a school subject association from the academic cycle.
 *     parameters:
 *       - in: path
 *         name: academicCycleId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       204:
 *         description: Deleted successfully
 *       404:
 *         description: Academic cycle or school subject not found
 */
router.delete(
  "/:academicCycleId/school-subjects/:id",
  authorize("academic-cycles"),
  validate(academicCycleSubResourceParamSchema, "params"),
  deleteSchoolSubject,
);

// ─── Academic Cycle Wallet ───────────────────────────────────────────────────

/**
 * @openapi
 * /academic-cycles/{academicCycleId}/wallet:
 *   get:
 *     tags:
 *       - Academic Cycle Wallet
 *     summary: List wallet items for an academic cycle
 *     description: Returns all wallet (payment) items associated with the given academic cycle.
 *     parameters:
 *       - in: path
 *         name: academicCycleId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: List of wallet items
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/AcademicCycleWalletRecord'
 *       404:
 *         description: Academic cycle not found
 */
router.get(
  "/:academicCycleId/wallet",
  authorize("academic-cycles"),
  validate(academicCycleIdParamSchema, "params"),
  findAllWalletItems,
);

/**
 * @openapi
 * /academic-cycles/{academicCycleId}/wallet:
 *   post:
 *     tags:
 *       - Academic Cycle Wallet
 *     summary: Add a wallet item to an academic cycle
 *     description: Creates a new wallet (payment) item for the academic cycle.
 *     parameters:
 *       - in: path
 *         name: academicCycleId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateAcademicCycleWalletBody'
 *     responses:
 *       201:
 *         description: Wallet item created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AcademicCycleWalletRecord'
 *       404:
 *         description: Academic cycle not found
 */
router.post(
  "/:academicCycleId/wallet",
  authorize("academic-cycles"),
  validate(academicCycleIdParamSchema, "params"),
  validate(createAcademicCycleWalletSchema, "body"),
  createWalletItem,
);

/**
 * @openapi
 * /academic-cycles/{academicCycleId}/wallet/{id}:
 *   patch:
 *     tags:
 *       - Academic Cycle Wallet
 *     summary: Update a wallet item
 *     description: Partially updates a wallet item for the academic cycle.
 *     parameters:
 *       - in: path
 *         name: academicCycleId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateAcademicCycleWalletBody'
 *     responses:
 *       200:
 *         description: Wallet item updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AcademicCycleWalletRecord'
 *       404:
 *         description: Academic cycle or wallet item not found
 */
router.patch(
  "/:academicCycleId/wallet/:id",
  authorize("academic-cycles"),
  validate(academicCycleSubResourceParamSchema, "params"),
  validate(updateAcademicCycleWalletSchema, "body"),
  updateWalletItem,
);

/**
 * @openapi
 * /academic-cycles/{academicCycleId}/wallet/{id}:
 *   delete:
 *     tags:
 *       - Academic Cycle Wallet
 *     summary: Remove a wallet item from an academic cycle
 *     description: Permanently removes a wallet item from the academic cycle.
 *     parameters:
 *       - in: path
 *         name: academicCycleId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       204:
 *         description: Deleted successfully
 *       404:
 *         description: Academic cycle or wallet item not found
 */
router.delete(
  "/:academicCycleId/wallet/:id",
  authorize("academic-cycles"),
  validate(academicCycleSubResourceParamSchema, "params"),
  deleteWalletItem,
);

export default router;
