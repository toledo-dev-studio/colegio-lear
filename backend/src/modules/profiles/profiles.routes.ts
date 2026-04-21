import { Router } from "express";
import { authenticate } from "../../shared/middleware/auth.middleware";
import { authorize } from "../../shared/middleware/rbac.middleware";
import { validate } from "../../shared/middleware/validate.middleware";
import {
  createProfileSchema,
  updateProfileSchema,
  assignPrivilegeSchema,
  removePrivilegeSchema,
} from "./profiles.schema";
import * as controller from "./profiles.controller";

const router = Router();

/**
 * @openapi
 * /api/profiles:
 *   post:
 *     tags:
 *       - Profiles
 *     summary: Create a new profile
 *     description: Creates a new security profile. Requires "profiles:create" privilege.
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
 *                 example: "Director"
 *               description:
 *                 type: string
 *                 example: "Full access profile for school directors"
 *     responses:
 *       201:
 *         description: Profile created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized — missing or invalid token
 *       403:
 *         description: Forbidden — insufficient privileges
 *       409:
 *         description: Conflict — profile name already exists
 */
router.post(
  "/api/profiles",
  authenticate,
  authorize("profiles", "create"),
  validate(createProfileSchema),
  controller.create,
);

/**
 * @openapi
 * /api/profiles:
 *   get:
 *     tags:
 *       - Profiles
 *     summary: List profiles
 *     description: Returns a paginated list of profiles with their associated privileges. Requires "profiles:read" privilege.
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
 *         description: Profiles retrieved successfully
 *       401:
 *         description: Unauthorized — missing or invalid token
 *       403:
 *         description: Forbidden — insufficient privileges
 */
router.get(
  "/api/profiles",
  authenticate,
  authorize("profiles", "read"),
  controller.getAll,
);

/**
 * @openapi
 * /api/profiles/{id}:
 *   get:
 *     tags:
 *       - Profiles
 *     summary: Get profile by ID
 *     description: Returns a single profile with its privileges. Requires "profiles:read" privilege.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Profile ID
 *     responses:
 *       200:
 *         description: Profile retrieved successfully
 *       401:
 *         description: Unauthorized — missing or invalid token
 *       403:
 *         description: Forbidden — insufficient privileges
 *       404:
 *         description: Profile not found
 */
router.get(
  "/api/profiles/:id",
  authenticate,
  authorize("profiles", "read"),
  controller.getById,
);

/**
 * @openapi
 * /api/profiles/{id}:
 *   patch:
 *     tags:
 *       - Profiles
 *     summary: Update a profile
 *     description: Partially updates a profile record. Requires "profiles:update" privilege.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Profile ID
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
 *         description: Profile updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized — missing or invalid token
 *       403:
 *         description: Forbidden — insufficient privileges
 *       404:
 *         description: Profile not found
 *       409:
 *         description: Conflict — profile name already exists
 */
router.patch(
  "/api/profiles/:id",
  authenticate,
  authorize("profiles", "update"),
  validate(updateProfileSchema),
  controller.update,
);

/**
 * @openapi
 * /api/profiles/{id}:
 *   delete:
 *     tags:
 *       - Profiles
 *     summary: Delete a profile
 *     description: Deletes a profile if it is not assigned to any employees. Requires "profiles:delete" privilege.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Profile ID
 *     responses:
 *       200:
 *         description: Profile deleted successfully
 *       401:
 *         description: Unauthorized — missing or invalid token
 *       403:
 *         description: Forbidden — insufficient privileges
 *       404:
 *         description: Profile not found
 *       409:
 *         description: Conflict — profile is assigned to employees
 */
router.delete(
  "/api/profiles/:id",
  authenticate,
  authorize("profiles", "delete"),
  controller.remove,
);

/**
 * @openapi
 * /api/profiles/{id}/privileges:
 *   post:
 *     tags:
 *       - Profiles
 *     summary: Assign a privilege to a profile
 *     description: Associates a module+action privilege with the profile. Requires "profiles:update" privilege.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Profile ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - moduleRef
 *               - action
 *             properties:
 *               moduleRef:
 *                 type: string
 *                 example: "employees"
 *               action:
 *                 type: string
 *                 enum: [create, read, update, delete]
 *                 example: "read"
 *     responses:
 *       200:
 *         description: Privilege assigned successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized — missing or invalid token
 *       403:
 *         description: Forbidden — insufficient privileges
 *       404:
 *         description: Profile or module reference not found
 *       409:
 *         description: Conflict — privilege already assigned
 */
router.post(
  "/api/profiles/:id/privileges",
  authenticate,
  authorize("profiles", "update"),
  validate(assignPrivilegeSchema),
  controller.assignPrivilegeHandler,
);

/**
 * @openapi
 * /api/profiles/{id}/privileges:
 *   delete:
 *     tags:
 *       - Profiles
 *     summary: Remove a privilege from a profile
 *     description: Removes a module+action privilege from the profile. Requires "profiles:update" privilege.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Profile ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - moduleRef
 *               - action
 *             properties:
 *               moduleRef:
 *                 type: string
 *                 example: "employees"
 *               action:
 *                 type: string
 *                 enum: [create, read, update, delete]
 *                 example: "read"
 *     responses:
 *       200:
 *         description: Privilege removed successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized — missing or invalid token
 *       403:
 *         description: Forbidden — insufficient privileges
 *       404:
 *         description: Module reference not found
 */
router.delete(
  "/api/profiles/:id/privileges",
  authenticate,
  authorize("profiles", "update"),
  validate(removePrivilegeSchema),
  controller.removePrivilegeHandler,
);

/**
 * @openapi
 * /api/profiles/{id}/privileges:
 *   get:
 *     tags:
 *       - Profiles
 *     summary: Get privileges for a profile
 *     description: Returns all privileges grouped by module reference. Requires "profiles:read" privilege.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Profile ID
 *     responses:
 *       200:
 *         description: Privileges retrieved successfully
 *       401:
 *         description: Unauthorized — missing or invalid token
 *       403:
 *         description: Forbidden — insufficient privileges
 *       404:
 *         description: Profile not found
 */
router.get(
  "/api/profiles/:id/privileges",
  authenticate,
  authorize("profiles", "read"),
  controller.getPrivileges,
);

export default router;
