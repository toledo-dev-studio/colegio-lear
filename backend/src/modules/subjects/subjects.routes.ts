import { Router } from "express";
import { authenticate } from "../../shared/middleware/auth.middleware";
import { authorize } from "../../shared/middleware/rbac.middleware";
import { validate } from "../../shared/middleware/validate.middleware";
import { auditLog } from "../../shared/middleware/audit.middleware";
import {
  createSubjectSchema,
  updateSubjectSchema,
  subjectQuerySchema,
  assignSubjectSchema,
} from "./subjects.schema";
import * as controller from "./subjects.controller";

const router = Router();

/**
 * @openapi
 * /api/subjects:
 *   post:
 *     tags:
 *       - Subjects
 *     summary: Create a new subject
 *     description: Creates a new subject record. Requires "subjects:create" privilege.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Matemáticas"
 *               description:
 *                 type: string
 *                 example: "Materia de matemáticas"
 *     responses:
 *       201:
 *         description: Subject created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized — missing or invalid token
 *       403:
 *         description: Forbidden — insufficient privileges
 *       409:
 *         description: Conflict — name already exists
 */
router.post(
  "/api/subjects",
  authenticate,
  authorize("subjects", "create"),
  validate(createSubjectSchema),
  auditLog("create", "subjects"),
  controller.create,
);

/**
 * @openapi
 * /api/subjects:
 *   get:
 *     tags:
 *       - Subjects
 *     summary: List subjects
 *     description: Returns a paginated list of subjects. Optionally filters by search term (case-insensitive name match). Requires "subjects:read" privilege.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Items per page (max 100)
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search subjects by name (case-insensitive)
 *     responses:
 *       200:
 *         description: Subjects retrieved successfully
 *       401:
 *         description: Unauthorized — missing or invalid token
 *       403:
 *         description: Forbidden — insufficient privileges
 */
router.get(
  "/api/subjects",
  authenticate,
  authorize("subjects", "read"),
  validate(subjectQuerySchema, "query"),
  controller.getAll,
);

/**
 * @openapi
 * /api/subjects/{id}:
 *   get:
 *     tags:
 *       - Subjects
 *     summary: Get subject by ID
 *     description: Returns a single subject record. Requires "subjects:read" privilege.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Subject ID
 *     responses:
 *       200:
 *         description: Subject retrieved successfully
 *       401:
 *         description: Unauthorized — missing or invalid token
 *       403:
 *         description: Forbidden — insufficient privileges
 *       404:
 *         description: Subject not found
 */
router.get(
  "/api/subjects/:id",
  authenticate,
  authorize("subjects", "read"),
  controller.getById,
);

/**
 * @openapi
 * /api/subjects/{id}:
 *   patch:
 *     tags:
 *       - Subjects
 *     summary: Update a subject
 *     description: Partially updates a subject record. Requires "subjects:update" privilege.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Subject ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Subject updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized — missing or invalid token
 *       403:
 *         description: Forbidden — insufficient privileges
 *       404:
 *         description: Subject not found
 *       409:
 *         description: Conflict — name already exists
 */
router.patch(
  "/api/subjects/:id",
  authenticate,
  authorize("subjects", "update"),
  validate(updateSubjectSchema),
  auditLog("update", "subjects"),
  controller.update,
);

/**
 * @openapi
 * /api/subjects/{id}/deactivate:
 *   patch:
 *     tags:
 *       - Subjects
 *     summary: Deactivate a subject
 *     description: Soft-deletes a subject by setting isActive to false. Requires "subjects:delete" privilege.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Subject ID
 *     responses:
 *       200:
 *         description: Subject deactivated successfully
 *       401:
 *         description: Unauthorized — missing or invalid token
 *       403:
 *         description: Forbidden — insufficient privileges
 *       404:
 *         description: Subject not found
 */
router.patch(
  "/api/subjects/:id/deactivate",
  authenticate,
  authorize("subjects", "delete"),
  auditLog("delete", "subjects"),
  controller.deactivate,
);

/**
 * @openapi
 * /api/grades/{gradeId}/subjects:
 *   post:
 *     tags:
 *       - Subjects
 *     summary: Assign a subject to a grade
 *     description: Creates a grade-subject assignment. Requires "subjects:create" privilege.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: gradeId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Grade ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - subjectId
 *             properties:
 *               subjectId:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       201:
 *         description: Subject assigned to grade successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized — missing or invalid token
 *       403:
 *         description: Forbidden — insufficient privileges
 *       404:
 *         description: Grade or subject not found
 *       409:
 *         description: Conflict — subject already assigned to this grade
 */
router.post(
  "/api/grades/:gradeId/subjects",
  authenticate,
  authorize("subjects", "create"),
  validate(assignSubjectSchema),
  auditLog("create", "grade-subjects"),
  controller.assignToGrade,
);

/**
 * @openapi
 * /api/grades/{gradeId}/subjects:
 *   get:
 *     tags:
 *       - Subjects
 *     summary: List subjects assigned to a grade
 *     description: Returns a paginated list of subjects assigned to the specified grade. Requires "subjects:read" privilege.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: gradeId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Grade ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Items per page (max 100)
 *     responses:
 *       200:
 *         description: Subjects retrieved successfully
 *       401:
 *         description: Unauthorized — missing or invalid token
 *       403:
 *         description: Forbidden — insufficient privileges
 *       404:
 *         description: Grade not found
 */
router.get(
  "/api/grades/:gradeId/subjects",
  authenticate,
  authorize("subjects", "read"),
  controller.getByGrade,
);

/**
 * @openapi
 * /api/grades/{gradeId}/subjects/{id}:
 *   delete:
 *     tags:
 *       - Subjects
 *     summary: Remove a subject assignment from a grade
 *     description: Deletes the grade-subject assignment record. Requires "subjects:delete" privilege.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: gradeId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Grade ID
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Grade-subject assignment ID
 *     responses:
 *       200:
 *         description: Subject removed from grade successfully
 *       401:
 *         description: Unauthorized — missing or invalid token
 *       403:
 *         description: Forbidden — insufficient privileges
 *       404:
 *         description: Grade-subject assignment not found
 */
router.delete(
  "/api/grades/:gradeId/subjects/:id",
  authenticate,
  authorize("subjects", "delete"),
  auditLog("delete", "grade-subjects"),
  controller.removeFromGrade,
);

export default router;
