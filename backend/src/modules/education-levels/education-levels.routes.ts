import { Router } from "express";
import { authenticate } from "../../shared/middleware/auth.middleware";
import { authorize } from "../../shared/middleware/rbac.middleware";
import { validate } from "../../shared/middleware/validate.middleware";
import { auditLog } from "../../shared/middleware/audit.middleware";
import {
  createEducationLevelSchema,
  updateEducationLevelSchema,
  educationLevelQuerySchema,
} from "./education-levels.schema";
import * as controller from "./education-levels.controller";

const router = Router();

/**
 * @openapi
 * /api/education-levels:
 *   post:
 *     tags:
 *       - Education Levels
 *     summary: Create a new education level
 *     description: Creates a new education level record. Requires "education-levels:create" privilege.
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
 *                 example: "Primaria"
 *               description:
 *                 type: string
 *                 example: "Nivel de educación primaria"
 *               order:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       201:
 *         description: Education level created successfully
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
  "/api/education-levels",
  authenticate,
  authorize("education-levels", "create"),
  validate(createEducationLevelSchema),
  auditLog("create", "education-levels"),
  controller.create,
);

/**
 * @openapi
 * /api/education-levels:
 *   get:
 *     tags:
 *       - Education Levels
 *     summary: List education levels
 *     description: Returns a paginated list of education levels ordered by "order" field. Requires "education-levels:read" privilege.
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
 *     responses:
 *       200:
 *         description: Education levels retrieved successfully
 *       401:
 *         description: Unauthorized — missing or invalid token
 *       403:
 *         description: Forbidden — insufficient privileges
 */
router.get(
  "/api/education-levels",
  authenticate,
  authorize("education-levels", "read"),
  validate(educationLevelQuerySchema, "query"),
  controller.getAll,
);

/**
 * @openapi
 * /api/education-levels/{id}:
 *   get:
 *     tags:
 *       - Education Levels
 *     summary: Get education level by ID
 *     description: Returns a single education level record including grade count. Requires "education-levels:read" privilege.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Education level ID
 *     responses:
 *       200:
 *         description: Education level retrieved successfully
 *       401:
 *         description: Unauthorized — missing or invalid token
 *       403:
 *         description: Forbidden — insufficient privileges
 *       404:
 *         description: Education level not found
 */
router.get(
  "/api/education-levels/:id",
  authenticate,
  authorize("education-levels", "read"),
  controller.getById,
);

/**
 * @openapi
 * /api/education-levels/{id}:
 *   patch:
 *     tags:
 *       - Education Levels
 *     summary: Update an education level
 *     description: Partially updates an education level record. Requires "education-levels:update" privilege.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Education level ID
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
 *         description: Education level updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized — missing or invalid token
 *       403:
 *         description: Forbidden — insufficient privileges
 *       404:
 *         description: Education level not found
 *       409:
 *         description: Conflict — name already exists
 */
router.patch(
  "/api/education-levels/:id",
  authenticate,
  authorize("education-levels", "update"),
  validate(updateEducationLevelSchema),
  auditLog("update", "education-levels"),
  controller.update,
);

/**
 * @openapi
 * /api/education-levels/{id}/deactivate:
 *   patch:
 *     tags:
 *       - Education Levels
 *     summary: Deactivate an education level
 *     description: Soft-deletes an education level by setting isActive to false. Requires "education-levels:delete" privilege.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Education level ID
 *     responses:
 *       200:
 *         description: Education level deactivated successfully
 *       401:
 *         description: Unauthorized — missing or invalid token
 *       403:
 *         description: Forbidden — insufficient privileges
 *       404:
 *         description: Education level not found
 */
router.patch(
  "/api/education-levels/:id/deactivate",
  authenticate,
  authorize("education-levels", "delete"),
  auditLog("delete", "education-levels"),
  controller.deactivate,
);

export default router;
