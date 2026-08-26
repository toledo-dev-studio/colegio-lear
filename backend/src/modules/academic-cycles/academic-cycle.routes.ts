import { Router } from "express";
import multer from "multer";
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
  academicCycleSchoolGroupIdParamSchema,
  academicCycleSchoolGroupTeachersQuerySchema,
  createAcademicCycleSchoolGroupSchema,
  updateAcademicCycleSchoolGroupSchema,
} from "./academic-cycle-school-group.schema";
import {
  academicCycleEnrollmentPagedQuerySchema,
  academicCycleEnrollmentByGroupQuerySchema,
  academicCycleEnrollmentIdParamSchema,
  academicCycleEnrollmentWalletItemParamSchema,
  createAcademicCycleEnrollmentSchema,
  updateAcademicCycleEnrollmentSchema,
} from "./academic-cycle-enrollment.schema";
import {
  updateStudentWalletItemSchema,
  createStudentWalletPaymentSchema,
} from "./student-wallet.schema";
import {
  studentAssistIdParamSchema,
  studentAssistPagedQuerySchema,
  createStudentAssistSchema,
  updateStudentAssistSchema,
} from "./student-assist.schema";
import {
  schoolSubjectTaskParentParamsSchema,
  schoolSubjectTaskIdParamsSchema,
  schoolSubjectTaskAttachmentIdParamsSchema,
  schoolSubjectTaskPagedQuerySchema,
  createSchoolSubjectTaskSchema,
  updateSchoolSubjectTaskSchema,
} from "./school-subject-task.schema";
import {
  schoolSubjectMaterialParentParamsSchema,
  schoolSubjectMaterialIdParamsSchema,
} from "./school-subject-material.schema";
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
import {
  findAllSchoolGroups,
  findSchoolGroupById,
  createSchoolGroup,
  updateSchoolGroup,
  deleteSchoolGroup,
  findAllCalendars,
  findAllTeachers,
} from "./academic-cycle-school-group.controller";
import {
  findAllPaged as findAllEnrollmentsPaged,
  findAllByGroup as findAllEnrollmentsByGroup,
  findById as findEnrollmentById,
  create as createEnrollment,
  update as updateEnrollment,
  remove as removeEnrollment,
} from "./academic-cycle-enrollment.controller";
import { findAllGrades } from "./student-grade.controller";
import {
  findWallet,
  findPayments as findWalletPayments,
  updateItem as updateStudentWalletItem,
  createPayment as createStudentWalletPayment,
} from "./student-wallet.controller";
import {
  findAllPaged as findAllAssistsPaged,
  create as createAssist,
  update as updateAssist,
  remove as removeAssist,
} from "./student-assist.controller";
import {
  findAllPaged as findAllTasksPaged,
  create as createTask,
  update as updateTask,
  remove as removeTask,
  addAttachment as addTaskAttachment,
  removeAttachment as removeTaskAttachment,
} from "./school-subject-task.controller";
import {
  findAll as findAllMaterials,
  create as createMaterial,
  remove as removeMaterial,
} from "./school-subject-material.controller";

/**
 * In-memory storage for task/material attachments — any file type, up to
 * 10MB, same config as attachments/announcement (attachment.routes.ts).
 */
const uploadAttachment = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});
const uploadAttachmentSingle = uploadAttachment.single("file");

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
 *         description: Free-text search on name, code
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
 *         name: periodType
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
 *         name: periodType
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
// Also read by the teacher-facing "my-classes" detail screen (MyClassLayout
// reuses this endpoint), so either module grants access.
router.get(
  "/:id",
  authorize(["academic-cycles", "my-classes"]),
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
 *       409:
 *         description: A wallet item with this code already exists in this academic cycle
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
 *       409:
 *         description: A wallet item with this code already exists in this academic cycle
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

// ─── Academic Cycle School Groups ────────────────────────────────────────────

/**
 * @openapi
 * /academic-cycles/{academicCycleId}/school-groups:
 *   get:
 *     tags:
 *       - Academic Cycle School Groups
 *     summary: List school groups for an academic cycle
 *     description: Returns all school groups for the given academic cycle (list view, without calendars).
 *     parameters:
 *       - in: path
 *         name: academicCycleId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: List of school groups
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/AcademicCycleSchoolGroupRecord'
 *       404:
 *         description: Academic cycle not found
 */
router.get(
  "/:academicCycleId/school-groups",
  authorize("academic-cycles"),
  validate(academicCycleIdParamSchema, "params"),
  findAllSchoolGroups,
);

/**
 * @openapi
 * /academic-cycles/{academicCycleId}/school-groups/{id}:
 *   get:
 *     tags:
 *       - Academic Cycle School Groups
 *     summary: Get a school group by ID
 *     description: Returns a single school group with its calendar entries.
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
 *       200:
 *         description: School group found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AcademicCycleSchoolGroupRecord'
 *       404:
 *         description: Academic cycle or school group not found
 */
// Also read by the teacher-facing "my-classes" detail screen (MyClassLayout
// reuses this endpoint), so either module grants access.
router.get(
  "/:academicCycleId/school-groups/:id",
  authorize(["academic-cycles", "my-classes"]),
  validate(academicCycleSubResourceParamSchema, "params"),
  findSchoolGroupById,
);

/**
 * @openapi
 * /academic-cycles/{academicCycleId}/school-groups:
 *   post:
 *     tags:
 *       - Academic Cycle School Groups
 *     summary: Create a new school group
 *     description: Creates a new school group for the academic cycle, optionally with initial calendar entries.
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
 *             $ref: '#/components/schemas/CreateAcademicCycleSchoolGroupBody'
 *     responses:
 *       201:
 *         description: School group created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AcademicCycleSchoolGroupRecord'
 *       404:
 *         description: Academic cycle not found
 */
router.post(
  "/:academicCycleId/school-groups",
  authorize("academic-cycles"),
  validate(academicCycleIdParamSchema, "params"),
  validate(createAcademicCycleSchoolGroupSchema, "body"),
  createSchoolGroup,
);

/**
 * @openapi
 * /academic-cycles/{academicCycleId}/school-groups/{id}:
 *   patch:
 *     tags:
 *       - Academic Cycle School Groups
 *     summary: Update a school group
 *     description: Partially updates a school group. If `calendars` is provided, syncs the full set (creates ids prefixed "new_"/"new-", updates existing UUIDs, deletes any existing calendar not present in the array).
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
 *             $ref: '#/components/schemas/UpdateAcademicCycleSchoolGroupBody'
 *     responses:
 *       200:
 *         description: School group updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AcademicCycleSchoolGroupRecord'
 *       404:
 *         description: Academic cycle or school group not found
 */
router.patch(
  "/:academicCycleId/school-groups/:id",
  authorize("academic-cycles"),
  validate(academicCycleSubResourceParamSchema, "params"),
  validate(updateAcademicCycleSchoolGroupSchema, "body"),
  updateSchoolGroup,
);

/**
 * @openapi
 * /academic-cycles/{academicCycleId}/school-groups/{id}:
 *   delete:
 *     tags:
 *       - Academic Cycle School Groups
 *     summary: Delete a school group
 *     description: Permanently removes a school group and its calendar entries.
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
 *         description: Academic cycle or school group not found
 */
router.delete(
  "/:academicCycleId/school-groups/:id",
  authorize("academic-cycles"),
  validate(academicCycleSubResourceParamSchema, "params"),
  deleteSchoolGroup,
);

/**
 * @openapi
 * /academic-cycles/{academicCycleId}/school-groups/{academicCycleSchoolGroupId}/calendars:
 *   get:
 *     tags:
 *       - Academic Cycle School Groups
 *     summary: List calendar entries for a school group
 *     description: Returns the schedule (day/time/subject/teacher) configured for the school group.
 *     parameters:
 *       - in: path
 *         name: academicCycleId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: path
 *         name: academicCycleSchoolGroupId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: List of calendar entries
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/AcademicCycleSchoolGroupCalendarRecord'
 *       404:
 *         description: Academic cycle or school group not found
 */
router.get(
  "/:academicCycleId/school-groups/:academicCycleSchoolGroupId/calendars",
  authorize("academic-cycles"),
  validate(academicCycleSchoolGroupIdParamSchema, "params"),
  findAllCalendars,
);

/**
 * @openapi
 * /academic-cycles/{academicCycleId}/school-groups/{academicCycleSchoolGroupId}/teachers:
 *   get:
 *     tags:
 *       - Academic Cycle School Groups
 *     summary: List distinct teachers assigned to a school group
 *     description: Derived (not its own table) list of distinct subject/teacher pairs from the group's calendar entries. Only active teachers by default.
 *     parameters:
 *       - in: path
 *         name: academicCycleId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: path
 *         name: academicCycleSchoolGroupId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: includeInactive
 *         schema:
 *           type: string
 *           enum: [true, false]
 *         description: Include teachers whose employee record is inactive (default false, active only)
 *     responses:
 *       200:
 *         description: List of distinct subject/teacher pairs
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/AcademicCycleSchoolGroupTeacherRecord'
 *       404:
 *         description: Academic cycle or school group not found
 */
router.get(
  "/:academicCycleId/school-groups/:academicCycleSchoolGroupId/teachers",
  authorize("academic-cycles"),
  validate(academicCycleSchoolGroupIdParamSchema, "params"),
  validate(academicCycleSchoolGroupTeachersQuerySchema, "query"),
  findAllTeachers,
);

// ─── Academic Cycle Enrollments ──────────────────────────────────────────────

/**
 * @openapi
 * /academic-cycles/{academicCycleId}/enrollments/paged:
 *   get:
 *     tags:
 *       - Academic Cycle Enrollments
 *     summary: List enrollments for an academic cycle (paginated)
 *     description: Returns a paginated list of student enrollments for the academic cycle, with optional filters.
 *     parameters:
 *       - in: path
 *         name: academicCycleId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Free-text search on enrollment code, student name, or student enrollment
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [enrolled, completed, dropped]
 *       - in: query
 *         name: academicCycleSchoolGroupId
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: scholarshipId
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Paginated list of enrollments
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/AcademicCycleEnrollmentRecord'
 *                 totalPages:
 *                   type: integer
 *                 currentPage:
 *                   type: integer
 *                 itemsCount:
 *                   type: integer
 *       404:
 *         description: Academic cycle not found
 */
router.get(
  "/:academicCycleId/enrollments/paged",
  authorize("academic-cycles"),
  validate(academicCycleIdParamSchema, "params"),
  validate(academicCycleEnrollmentPagedQuerySchema, "query"),
  findAllEnrollmentsPaged,
);

/**
 * @openapi
 * /academic-cycles/{academicCycleId}/enrollments/{id}:
 *   get:
 *     tags:
 *       - Academic Cycle Enrollments
 *     summary: Get an enrollment by ID
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
 *       200:
 *         description: Enrollment found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AcademicCycleEnrollmentRecord'
 *       404:
 *         description: Academic cycle or enrollment not found
 */
router.get(
  "/:academicCycleId/enrollments/:id",
  authorize("academic-cycles"),
  validate(academicCycleSubResourceParamSchema, "params"),
  findEnrollmentById,
);

/**
 * @openapi
 * /academic-cycles/{academicCycleId}/enrollments:
 *   get:
 *     tags:
 *       - Academic Cycle Enrollments
 *     summary: List every enrollment in a group (no pagination)
 *     description: Used by "my classes" to populate its student roster for chats/grades — academicCycleSchoolGroupId is required (unlike the paged listing) since this returns every match with no limit.
 *     parameters:
 *       - in: path
 *         name: academicCycleId
 *         required: true
 *         schema: { type: string, format: uuid }
 *       - in: query
 *         name: academicCycleSchoolGroupId
 *         required: true
 *         schema: { type: string, format: uuid }
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [enrolled, completed, dropped] }
 *     responses:
 *       200:
 *         description: List of enrollments
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/AcademicCycleEnrollmentRecord' }
 *       404:
 *         description: Academic cycle not found
 *   post:
 *     tags:
 *       - Academic Cycle Enrollments
 *     summary: Enroll a student in an academic cycle
 *     description: Creates a new enrollment. Requires the academic cycle to have enrollmentOpen=true and status active/upcoming. Auto-generates `code` (e.g. INS-2026-0001).
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
 *             $ref: '#/components/schemas/CreateAcademicCycleEnrollmentBody'
 *     responses:
 *       201:
 *         description: Enrollment created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AcademicCycleEnrollmentRecord'
 *       404:
 *         description: Academic cycle or school group not found
 *       409:
 *         description: Enrollment is closed for this academic cycle, or the student is already enrolled in this academic cycle (any status)
 */
router.get(
  "/:academicCycleId/enrollments",
  authorize("academic-cycles"),
  validate(academicCycleIdParamSchema, "params"),
  validate(academicCycleEnrollmentByGroupQuerySchema, "query"),
  findAllEnrollmentsByGroup,
);

router.post(
  "/:academicCycleId/enrollments",
  authorize("academic-cycles"),
  validate(academicCycleIdParamSchema, "params"),
  validate(createAcademicCycleEnrollmentSchema, "body"),
  createEnrollment,
);

/**
 * @openapi
 * /academic-cycles/{academicCycleId}/enrollments/{id}:
 *   patch:
 *     tags:
 *       - Academic Cycle Enrollments
 *     summary: Update an enrollment
 *     description: Partially updates an enrollment (status, group, scholarship, notes). Not gated by enrollmentOpen — editing an existing record (e.g. marking completed/dropped) is always allowed.
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
 *             $ref: '#/components/schemas/UpdateAcademicCycleEnrollmentBody'
 *     responses:
 *       200:
 *         description: Enrollment updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AcademicCycleEnrollmentRecord'
 *       404:
 *         description: Academic cycle or enrollment not found
 */
router.patch(
  "/:academicCycleId/enrollments/:id",
  authorize("academic-cycles"),
  validate(academicCycleSubResourceParamSchema, "params"),
  validate(updateAcademicCycleEnrollmentSchema, "body"),
  updateEnrollment,
);

/**
 * @openapi
 * /academic-cycles/{academicCycleId}/enrollments/{id}:
 *   delete:
 *     tags:
 *       - Academic Cycle Enrollments
 *     summary: Delete an enrollment
 *     description: Permanently removes a student's enrollment from the academic cycle.
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
 *         description: Academic cycle or enrollment not found
 */
router.delete(
  "/:academicCycleId/enrollments/:id",
  authorize("academic-cycles"),
  validate(academicCycleSubResourceParamSchema, "params"),
  removeEnrollment,
);

// ─── Student Grades (read-only) ──────────────────────────────────────────────

/**
 * @openapi
 * /academic-cycles/{academicCycleId}/enrollments/{academicCycleEnrollmentId}/grades:
 *   get:
 *     tags:
 *       - Student Grades
 *     summary: List a student's grades for an enrollment
 *     description: Read-only — grades have no create/update/delete endpoint yet (pending a future teacher-facing module).
 *     parameters:
 *       - in: path
 *         name: academicCycleId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: path
 *         name: academicCycleEnrollmentId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: List of grades
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/StudentGradeRecord'
 *       404:
 *         description: Academic cycle or enrollment not found
 */
router.get(
  "/:academicCycleId/enrollments/:academicCycleEnrollmentId/grades",
  authorize("academic-cycles"),
  validate(academicCycleEnrollmentIdParamSchema, "params"),
  findAllGrades,
);

// ─── Student Assists (attendance) ────────────────────────────────────────────
// authorize("my-classes") — taking attendance is a day-to-day teacher action,
// same reasoning as tasks/materials, not an "academic-cycles" configuration
// change. The GET below shares its exact URL with
// student-assist-student.routes.ts (mounted separately, before this router,
// under gateStudentSession) — see that file for how the two audiences coexist.

/**
 * @openapi
 * /academic-cycles/{academicCycleId}/enrollments/{academicCycleEnrollmentId}/assists:
 *   get:
 *     tags:
 *       - Student Assists
 *     summary: List attendance records for an enrollment (paginated, optional date range)
 *     description: No implicit default date range is applied when fromDate/toDate are omitted.
 *     parameters:
 *       - in: path
 *         name: academicCycleId
 *         required: true
 *         schema: { type: string, format: uuid }
 *       - in: path
 *         name: academicCycleEnrollmentId
 *         required: true
 *         schema: { type: string, format: uuid }
 *       - in: query
 *         name: page
 *         schema: { type: integer, minimum: 1, default: 1 }
 *       - in: query
 *         name: pageSize
 *         schema: { type: integer, minimum: 1, maximum: 100, default: 10 }
 *       - in: query
 *         name: fromDate
 *         schema: { type: string, format: date }
 *         description: Inclusive lower bound (ISO or YYYY-MM-DD)
 *       - in: query
 *         name: toDate
 *         schema: { type: string, format: date }
 *         description: Inclusive upper bound (ISO or YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Paginated list of attendance records
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/StudentAssistRecord' }
 *                 totalPages: { type: integer }
 *                 currentPage: { type: integer }
 *                 itemsCount: { type: integer }
 *       404:
 *         description: Academic cycle or enrollment not found
 *   post:
 *     tags:
 *       - Student Assists
 *     summary: Create an attendance record for a single day
 *     parameters:
 *       - in: path
 *         name: academicCycleId
 *         required: true
 *         schema: { type: string, format: uuid }
 *       - in: path
 *         name: academicCycleEnrollmentId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/CreateStudentAssistBody' }
 *     responses:
 *       201:
 *         description: Attendance record created
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/StudentAssistRecord' }
 *       404:
 *         description: Academic cycle or enrollment not found
 *       409:
 *         description: A record already exists for this enrollment on this day
 */
router.get(
  "/:academicCycleId/enrollments/:academicCycleEnrollmentId/assists",
  authorize("my-classes"),
  validate(academicCycleEnrollmentIdParamSchema, "params"),
  validate(studentAssistPagedQuerySchema, "query"),
  findAllAssistsPaged,
);

router.post(
  "/:academicCycleId/enrollments/:academicCycleEnrollmentId/assists",
  authorize("my-classes"),
  validate(academicCycleEnrollmentIdParamSchema, "params"),
  validate(createStudentAssistSchema, "body"),
  createAssist,
);

/**
 * @openapi
 * /academic-cycles/{academicCycleId}/enrollments/{academicCycleEnrollmentId}/assists/{id}:
 *   patch:
 *     tags:
 *       - Student Assists
 *     summary: Update an attendance record
 *     parameters:
 *       - in: path
 *         name: academicCycleId
 *         required: true
 *         schema: { type: string, format: uuid }
 *       - in: path
 *         name: academicCycleEnrollmentId
 *         required: true
 *         schema: { type: string, format: uuid }
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/UpdateStudentAssistBody' }
 *     responses:
 *       200:
 *         description: Attendance record updated
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/StudentAssistRecord' }
 *       404:
 *         description: Attendance record not found
 *   delete:
 *     tags:
 *       - Student Assists
 *     summary: Delete an attendance record
 *     parameters:
 *       - in: path
 *         name: academicCycleId
 *         required: true
 *         schema: { type: string, format: uuid }
 *       - in: path
 *         name: academicCycleEnrollmentId
 *         required: true
 *         schema: { type: string, format: uuid }
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       204:
 *         description: Deleted successfully
 *       404:
 *         description: Attendance record not found
 */
router.patch(
  "/:academicCycleId/enrollments/:academicCycleEnrollmentId/assists/:id",
  authorize("my-classes"),
  validate(studentAssistIdParamSchema, "params"),
  validate(updateStudentAssistSchema, "body"),
  updateAssist,
);

router.delete(
  "/:academicCycleId/enrollments/:academicCycleEnrollmentId/assists/:id",
  authorize("my-classes"),
  validate(studentAssistIdParamSchema, "params"),
  removeAssist,
);

// ─── Student Wallet ───────────────────────────────────────────────────────────

/**
 * @openapi
 * /academic-cycles/{academicCycleId}/enrollments/{academicCycleEnrollmentId}/wallet:
 *   get:
 *     tags:
 *       - Student Wallet
 *     summary: Get a student's wallet (summary + items) for an enrollment
 *     description: Items are snapshotted from the academic cycle's wallet catalog when the student enrolls. `status` (pending/paid/overdue/forgiven) is computed on every read, never stored.
 *     parameters:
 *       - in: path
 *         name: academicCycleId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: path
 *         name: academicCycleEnrollmentId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Wallet summary and items
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/StudentWalletRecord'
 *       404:
 *         description: Academic cycle or enrollment not found
 */
router.get(
  "/:academicCycleId/enrollments/:academicCycleEnrollmentId/wallet",
  authorize("academic-cycles"),
  validate(academicCycleEnrollmentIdParamSchema, "params"),
  findWallet,
);

/**
 * @openapi
 * /academic-cycles/{academicCycleId}/enrollments/{academicCycleEnrollmentId}/wallet/payments:
 *   get:
 *     tags:
 *       - Student Wallet
 *     summary: List payments registered against a student's wallet
 *     parameters:
 *       - in: path
 *         name: academicCycleId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: path
 *         name: academicCycleEnrollmentId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: List of payments
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/StudentWalletPaymentRecord'
 *       404:
 *         description: Academic cycle or enrollment not found
 */
router.get(
  "/:academicCycleId/enrollments/:academicCycleEnrollmentId/wallet/payments",
  authorize("academic-cycles"),
  validate(academicCycleEnrollmentIdParamSchema, "params"),
  findWalletPayments,
);

/**
 * @openapi
 * /academic-cycles/{academicCycleId}/enrollments/{academicCycleEnrollmentId}/wallet/{id}:
 *   patch:
 *     tags:
 *       - Student Wallet
 *     summary: Update a student wallet item (forgiveness / payment extension)
 *     description: Setting isForgiven=true requires allowForgiveness=true (existing or in the same request), and settles the outstanding balance to 0.
 *     parameters:
 *       - in: path
 *         name: academicCycleId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: path
 *         name: academicCycleEnrollmentId
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
 *             $ref: '#/components/schemas/UpdateStudentWalletItemBody'
 *     responses:
 *       200:
 *         description: Wallet item updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/StudentWalletItemRecord'
 *       404:
 *         description: Academic cycle, enrollment, or wallet item not found
 *       409:
 *         description: isForgiven requires allowForgiveness
 */
router.patch(
  "/:academicCycleId/enrollments/:academicCycleEnrollmentId/wallet/:id",
  authorize("academic-cycles"),
  validate(academicCycleEnrollmentWalletItemParamSchema, "params"),
  validate(updateStudentWalletItemSchema, "body"),
  updateStudentWalletItem,
);

/**
 * @openapi
 * /academic-cycles/{academicCycleId}/enrollments/{academicCycleEnrollmentId}/wallet/{id}/payments:
 *   post:
 *     tags:
 *       - Student Wallet
 *     summary: Register a payment against a student wallet item
 *     description: Auto-generates `folio` (e.g. PAG-2026-000001). amount cannot exceed the item's outstanding balance, and the item cannot already be paid/forgiven.
 *     parameters:
 *       - in: path
 *         name: academicCycleId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: path
 *         name: academicCycleEnrollmentId
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
 *         description: studentWalletItemId
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateStudentWalletPaymentBody'
 *     responses:
 *       201:
 *         description: Payment registered
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/StudentWalletPaymentRecord'
 *       404:
 *         description: Academic cycle, enrollment, or wallet item not found
 *       409:
 *         description: Amount exceeds outstanding balance, or item already settled
 */
router.post(
  "/:academicCycleId/enrollments/:academicCycleEnrollmentId/wallet/:id/payments",
  authorize("academic-cycles"),
  validate(academicCycleEnrollmentWalletItemParamSchema, "params"),
  validate(createStudentWalletPaymentSchema, "body"),
  createStudentWalletPayment,
);

// ─── School Subject Tasks ─────────────────────────────────────────────────────
// Employee CRUD (authorize("my-classes")) — the student portal only ever
// reads these via school-subject-task-student.routes.ts, mounted separately.

/**
 * @openapi
 * /academic-cycles/{academicCycleId}/school-groups/{academicCycleSchoolGroupId}/school-subjects/{academicCycleSchoolSubjectId}/tasks:
 *   get:
 *     tags:
 *       - School Subject Tasks
 *     summary: List tasks for a school subject in a group (paginated)
 *     parameters:
 *       - in: path
 *         name: academicCycleId
 *         required: true
 *         schema: { type: string, format: uuid }
 *       - in: path
 *         name: academicCycleSchoolGroupId
 *         required: true
 *         schema: { type: string, format: uuid }
 *       - in: path
 *         name: academicCycleSchoolSubjectId
 *         required: true
 *         schema: { type: string, format: uuid }
 *       - in: query
 *         name: page
 *         schema: { type: integer, minimum: 1, default: 1 }
 *       - in: query
 *         name: pageSize
 *         schema: { type: integer, minimum: 1, maximum: 100, default: 5 }
 *     responses:
 *       200:
 *         description: Paginated list of tasks
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/SchoolSubjectTaskRecord' }
 *                 totalPages: { type: integer }
 *                 currentPage: { type: integer }
 *                 itemsCount: { type: integer }
 *       404:
 *         description: Academic cycle, school group, or school subject not found
 *   post:
 *     tags:
 *       - School Subject Tasks
 *     summary: Create a task
 *     parameters:
 *       - in: path
 *         name: academicCycleId
 *         required: true
 *         schema: { type: string, format: uuid }
 *       - in: path
 *         name: academicCycleSchoolGroupId
 *         required: true
 *         schema: { type: string, format: uuid }
 *       - in: path
 *         name: academicCycleSchoolSubjectId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/CreateSchoolSubjectTaskBody' }
 *     responses:
 *       201:
 *         description: Task created
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/SchoolSubjectTaskRecord' }
 *       404:
 *         description: Academic cycle, school group, or school subject not found
 */
router.get(
  "/:academicCycleId/school-groups/:academicCycleSchoolGroupId/school-subjects/:academicCycleSchoolSubjectId/tasks",
  authorize("my-classes"),
  validate(schoolSubjectTaskParentParamsSchema, "params"),
  validate(schoolSubjectTaskPagedQuerySchema, "query"),
  findAllTasksPaged,
);

router.post(
  "/:academicCycleId/school-groups/:academicCycleSchoolGroupId/school-subjects/:academicCycleSchoolSubjectId/tasks",
  authorize("my-classes"),
  validate(schoolSubjectTaskParentParamsSchema, "params"),
  validate(createSchoolSubjectTaskSchema, "body"),
  createTask,
);

/**
 * @openapi
 * /academic-cycles/{academicCycleId}/school-groups/{academicCycleSchoolGroupId}/school-subjects/{academicCycleSchoolSubjectId}/tasks/{taskId}:
 *   patch:
 *     tags:
 *       - School Subject Tasks
 *     summary: Update a task
 *     parameters:
 *       - in: path
 *         name: academicCycleId
 *         required: true
 *         schema: { type: string, format: uuid }
 *       - in: path
 *         name: academicCycleSchoolGroupId
 *         required: true
 *         schema: { type: string, format: uuid }
 *       - in: path
 *         name: academicCycleSchoolSubjectId
 *         required: true
 *         schema: { type: string, format: uuid }
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/UpdateSchoolSubjectTaskBody' }
 *     responses:
 *       200:
 *         description: Task updated
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/SchoolSubjectTaskRecord' }
 *       404:
 *         description: Task not found
 *   delete:
 *     tags:
 *       - School Subject Tasks
 *     summary: Delete a task (and its attachments, in storage and the DB)
 *     parameters:
 *       - in: path
 *         name: academicCycleId
 *         required: true
 *         schema: { type: string, format: uuid }
 *       - in: path
 *         name: academicCycleSchoolGroupId
 *         required: true
 *         schema: { type: string, format: uuid }
 *       - in: path
 *         name: academicCycleSchoolSubjectId
 *         required: true
 *         schema: { type: string, format: uuid }
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       204:
 *         description: Deleted successfully
 *       404:
 *         description: Task not found
 */
router.patch(
  "/:academicCycleId/school-groups/:academicCycleSchoolGroupId/school-subjects/:academicCycleSchoolSubjectId/tasks/:taskId",
  authorize("my-classes"),
  validate(schoolSubjectTaskIdParamsSchema, "params"),
  validate(updateSchoolSubjectTaskSchema, "body"),
  updateTask,
);

router.delete(
  "/:academicCycleId/school-groups/:academicCycleSchoolGroupId/school-subjects/:academicCycleSchoolSubjectId/tasks/:taskId",
  authorize("my-classes"),
  validate(schoolSubjectTaskIdParamsSchema, "params"),
  removeTask,
);

/**
 * @openapi
 * /academic-cycles/{academicCycleId}/school-groups/{academicCycleSchoolGroupId}/school-subjects/{academicCycleSchoolSubjectId}/tasks/{taskId}/attachments:
 *   post:
 *     tags:
 *       - School Subject Tasks
 *     summary: Upload an attachment for a task
 *     description: Accepts any file type up to 10MB.
 *     parameters:
 *       - in: path
 *         name: academicCycleId
 *         required: true
 *         schema: { type: string, format: uuid }
 *       - in: path
 *         name: academicCycleSchoolGroupId
 *         required: true
 *         schema: { type: string, format: uuid }
 *       - in: path
 *         name: academicCycleSchoolSubjectId
 *         required: true
 *         schema: { type: string, format: uuid }
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [file]
 *             properties:
 *               file: { type: string, format: binary }
 *     responses:
 *       201:
 *         description: Attachment added — returns the full task with its attachments
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/SchoolSubjectTaskRecord' }
 *       400:
 *         description: File is required
 *       404:
 *         description: Task not found
 */
router.post(
  "/:academicCycleId/school-groups/:academicCycleSchoolGroupId/school-subjects/:academicCycleSchoolSubjectId/tasks/:taskId/attachments",
  authorize("my-classes"),
  validate(schoolSubjectTaskIdParamsSchema, "params"),
  uploadAttachmentSingle,
  addTaskAttachment,
);

/**
 * @openapi
 * /academic-cycles/{academicCycleId}/school-groups/{academicCycleSchoolGroupId}/school-subjects/{academicCycleSchoolSubjectId}/tasks/{taskId}/attachments/{attachmentId}:
 *   delete:
 *     tags:
 *       - School Subject Tasks
 *     summary: Delete a task attachment
 *     parameters:
 *       - in: path
 *         name: academicCycleId
 *         required: true
 *         schema: { type: string, format: uuid }
 *       - in: path
 *         name: academicCycleSchoolGroupId
 *         required: true
 *         schema: { type: string, format: uuid }
 *       - in: path
 *         name: academicCycleSchoolSubjectId
 *         required: true
 *         schema: { type: string, format: uuid }
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema: { type: string, format: uuid }
 *       - in: path
 *         name: attachmentId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       204:
 *         description: Deleted successfully
 *       404:
 *         description: Task or attachment not found
 */
router.delete(
  "/:academicCycleId/school-groups/:academicCycleSchoolGroupId/school-subjects/:academicCycleSchoolSubjectId/tasks/:taskId/attachments/:attachmentId",
  authorize("my-classes"),
  validate(schoolSubjectTaskAttachmentIdParamsSchema, "params"),
  removeTaskAttachment,
);

// ─── School Subject Materials ─────────────────────────────────────────────────
// Employee CRUD (authorize("my-classes")) — the student portal only ever
// reads these via school-subject-material-student.routes.ts, mounted separately.

/**
 * @openapi
 * /academic-cycles/{academicCycleId}/school-groups/{academicCycleSchoolGroupId}/school-subjects/{academicCycleSchoolSubjectId}/materials:
 *   get:
 *     tags:
 *       - School Subject Materials
 *     summary: List materials for a school subject in a group
 *     parameters:
 *       - in: path
 *         name: academicCycleId
 *         required: true
 *         schema: { type: string, format: uuid }
 *       - in: path
 *         name: academicCycleSchoolGroupId
 *         required: true
 *         schema: { type: string, format: uuid }
 *       - in: path
 *         name: academicCycleSchoolSubjectId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: List of materials
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/SchoolSubjectMaterialRecord' }
 *       404:
 *         description: Academic cycle, school group, or school subject not found
 *   post:
 *     tags:
 *       - School Subject Materials
 *     summary: Create a material (uploads its single attachment in the same call)
 *     description: Accepts any file type up to 10MB.
 *     parameters:
 *       - in: path
 *         name: academicCycleId
 *         required: true
 *         schema: { type: string, format: uuid }
 *       - in: path
 *         name: academicCycleSchoolGroupId
 *         required: true
 *         schema: { type: string, format: uuid }
 *       - in: path
 *         name: academicCycleSchoolSubjectId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [file]
 *             properties:
 *               file: { type: string, format: binary }
 *     responses:
 *       201:
 *         description: Material created
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/SchoolSubjectMaterialRecord' }
 *       400:
 *         description: File is required
 *       404:
 *         description: Academic cycle, school group, or school subject not found
 */
router.get(
  "/:academicCycleId/school-groups/:academicCycleSchoolGroupId/school-subjects/:academicCycleSchoolSubjectId/materials",
  authorize("my-classes"),
  validate(schoolSubjectMaterialParentParamsSchema, "params"),
  findAllMaterials,
);

router.post(
  "/:academicCycleId/school-groups/:academicCycleSchoolGroupId/school-subjects/:academicCycleSchoolSubjectId/materials",
  authorize("my-classes"),
  validate(schoolSubjectMaterialParentParamsSchema, "params"),
  uploadAttachmentSingle,
  createMaterial,
);

/**
 * @openapi
 * /academic-cycles/{academicCycleId}/school-groups/{academicCycleSchoolGroupId}/school-subjects/{academicCycleSchoolSubjectId}/materials/{materialId}:
 *   delete:
 *     tags:
 *       - School Subject Materials
 *     summary: Delete a material (and its attachment, in storage and the DB)
 *     parameters:
 *       - in: path
 *         name: academicCycleId
 *         required: true
 *         schema: { type: string, format: uuid }
 *       - in: path
 *         name: academicCycleSchoolGroupId
 *         required: true
 *         schema: { type: string, format: uuid }
 *       - in: path
 *         name: academicCycleSchoolSubjectId
 *         required: true
 *         schema: { type: string, format: uuid }
 *       - in: path
 *         name: materialId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       204:
 *         description: Deleted successfully
 *       404:
 *         description: Material not found
 */
router.delete(
  "/:academicCycleId/school-groups/:academicCycleSchoolGroupId/school-subjects/:academicCycleSchoolSubjectId/materials/:materialId",
  authorize("my-classes"),
  validate(schoolSubjectMaterialIdParamsSchema, "params"),
  removeMaterial,
);

export default router;
