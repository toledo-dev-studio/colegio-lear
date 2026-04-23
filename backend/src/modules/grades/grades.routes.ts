import { Router } from "express";
import { authenticate } from "../../shared/middleware/auth.middleware";
import { authorize } from "../../shared/middleware/rbac.middleware";
import { validate } from "../../shared/middleware/validate.middleware";
import { auditLog } from "../../shared/middleware/audit.middleware";
import {
  createGradeSchema,
  updateGradeSchema,
  gradeQuerySchema,
} from "./grades.schema";
import * as controller from "./grades.controller";

const router = Router();

/**
 * @openapi
 * /api/grades:
 *   post:
 *     tags:
 *       - Grades
 *     summary: Create a new grade
 *     description: Creates a new grade record linked to an education level. Requires "grades:create" privilege.
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
 *               - educationLevelId
 *             properties:
 *               name:
 *                 type: string
 *                 example: "1er Grado"
 *               educationLevelId:
 *                 type: integer
 *                 example: 1
 *               description:
 *                 type: string
 *                 example: "Primer grado de primaria"
 *               order:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       201:
 *         description: Grade created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized — missing or invalid token
 *       403:
 *         description: Forbidden — insufficient privileges
 *       404:
 *         description: Education level not found
 *       409:
 *         description: Conflict — name already exists within the same education level
 */
router.post(
  "/api/grades",
  authenticate,
  authorize("grades", "create"),
  validate(createGradeSchema),
  auditLog("create", "grades"),
  controller.create,
);

/**
 * @openapi
 * /api/grades:
 *   get:
 *     tags:
 *       - Grades
 *     summary: List grades
 *     description: Returns a paginated list of grades ordered by "order" field. Optionally filters by educationLevelId. Requires "grades:read" privilege.
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
 *         name: educationLevelId
 *         schema:
 *           type: integer
 *         description: Filter grades by education level ID
 *     responses:
 *       200:
 *         description: Grades retrieved successfully
 *       401:
 *         description: Unauthorized — missing or invalid token
 *       403:
 *         description: Forbidden — insufficient privileges
 */
router.get(
  "/api/grades",
  authenticate,
  authorize("grades", "read"),
  validate(gradeQuerySchema, "query"),
  controller.getAll,
);

/**
 * @openapi
 * /api/grades/{id}:
 *   get:
 *     tags:
 *       - Grades
 *     summary: Get grade by ID
 *     description: Returns a single grade record including its education level and group count. Requires "grades:read" privilege.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Grade ID
 *     responses:
 *       200:
 *         description: Grade retrieved successfully
 *       401:
 *         description: Unauthorized — missing or invalid token
 *       403:
 *         description: Forbidden — insufficient privileges
 *       404:
 *         description: Grade not found
 */
router.get(
  "/api/grades/:id",
  authenticate,
  authorize("grades", "read"),
  controller.getById,
);

/**
 * @openapi
 * /api/grades/{id}:
 *   patch:
 *     tags:
 *       - Grades
 *     summary: Update a grade
 *     description: Partially updates a grade record. Requires "grades:update" privilege.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
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
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               order:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Grade updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized — missing or invalid token
 *       403:
 *         description: Forbidden — insufficient privileges
 *       404:
 *         description: Grade not found
 *       409:
 *         description: Conflict — name already exists within the same education level
 */
router.patch(
  "/api/grades/:id",
  authenticate,
  authorize("grades", "update"),
  validate(updateGradeSchema),
  auditLog("update", "grades"),
  controller.update,
);

/**
 * @openapi
 * /api/grades/{id}/deactivate:
 *   patch:
 *     tags:
 *       - Grades
 *     summary: Deactivate a grade
 *     description: Soft-deletes a grade by setting isActive to false. Requires "grades:delete" privilege.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Grade ID
 *     responses:
 *       200:
 *         description: Grade deactivated successfully
 *       401:
 *         description: Unauthorized — missing or invalid token
 *       403:
 *         description: Forbidden — insufficient privileges
 *       404:
 *         description: Grade not found
 */
router.patch(
  "/api/grades/:id/deactivate",
  authenticate,
  authorize("grades", "delete"),
  auditLog("delete", "grades"),
  controller.deactivate,
);

export default router;
