import { Router } from "express";
import { authenticate } from "../../shared/middleware/auth.middleware";
import { authorize } from "../../shared/middleware/rbac.middleware";
import { validate } from "../../shared/middleware/validate.middleware";
import { auditLog } from "../../shared/middleware/audit.middleware";
import {
  createGroupSchema,
  updateGroupSchema,
  groupQuerySchema,
} from "./groups.schema";
import * as controller from "./groups.controller";

const router = Router();

/**
 * @openapi
 * /api/groups:
 *   post:
 *     tags:
 *       - Groups
 *     summary: Create a new group
 *     description: Creates a new group record linked to a grade. Requires "groups:create" privilege.
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
 *               - gradeId
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Grupo A"
 *               gradeId:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       201:
 *         description: Group created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized — missing or invalid token
 *       403:
 *         description: Forbidden — insufficient privileges
 *       404:
 *         description: Grade not found
 *       409:
 *         description: Conflict — name already exists within the same grade
 */
router.post(
  "/api/groups",
  authenticate,
  authorize("groups", "create"),
  validate(createGroupSchema),
  auditLog("create", "groups"),
  controller.create,
);

/**
 * @openapi
 * /api/groups:
 *   get:
 *     tags:
 *       - Groups
 *     summary: List groups
 *     description: Returns a paginated list of groups. Optionally filters by gradeId. Requires "groups:read" privilege.
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
 *         name: gradeId
 *         schema:
 *           type: integer
 *         description: Filter groups by grade ID
 *     responses:
 *       200:
 *         description: Groups retrieved successfully
 *       401:
 *         description: Unauthorized — missing or invalid token
 *       403:
 *         description: Forbidden — insufficient privileges
 */
router.get(
  "/api/groups",
  authenticate,
  authorize("groups", "read"),
  validate(groupQuerySchema, "query"),
  controller.getAll,
);

/**
 * @openapi
 * /api/groups/{id}:
 *   get:
 *     tags:
 *       - Groups
 *     summary: Get group by ID
 *     description: Returns a single group record including its grade and education level. Requires "groups:read" privilege.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Group ID
 *     responses:
 *       200:
 *         description: Group retrieved successfully
 *       401:
 *         description: Unauthorized — missing or invalid token
 *       403:
 *         description: Forbidden — insufficient privileges
 *       404:
 *         description: Group not found
 */
router.get(
  "/api/groups/:id",
  authenticate,
  authorize("groups", "read"),
  controller.getById,
);

/**
 * @openapi
 * /api/groups/{id}:
 *   patch:
 *     tags:
 *       - Groups
 *     summary: Update a group
 *     description: Partially updates a group record. Requires "groups:update" privilege.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Group ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       200:
 *         description: Group updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized — missing or invalid token
 *       403:
 *         description: Forbidden — insufficient privileges
 *       404:
 *         description: Group not found
 *       409:
 *         description: Conflict — name already exists within the same grade
 */
router.patch(
  "/api/groups/:id",
  authenticate,
  authorize("groups", "update"),
  validate(updateGroupSchema),
  auditLog("update", "groups"),
  controller.update,
);

/**
 * @openapi
 * /api/groups/{id}/deactivate:
 *   patch:
 *     tags:
 *       - Groups
 *     summary: Deactivate a group
 *     description: Soft-deletes a group by setting isActive to false. Requires "groups:delete" privilege.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Group ID
 *     responses:
 *       200:
 *         description: Group deactivated successfully
 *       401:
 *         description: Unauthorized — missing or invalid token
 *       403:
 *         description: Forbidden — insufficient privileges
 *       404:
 *         description: Group not found
 */
router.patch(
  "/api/groups/:id/deactivate",
  authenticate,
  authorize("groups", "delete"),
  auditLog("delete", "groups"),
  controller.deactivate,
);

export default router;
