import { Router } from "express";
import { validate } from "../../shared/middleware/validate.middleware";
import { authorize } from "../../shared/middleware/rbac.middleware";
import {
  idParamSchema,
  securityRoleFiltersSchema,
  securityRolePagedQuerySchema,
  createSecurityRoleSchema,
  updateSecurityRoleSchema,
} from "./security-role.schema";
import {
  findAll,
  findAllPaged,
  findById,
  create,
  update,
  softDelete,
} from "./security-role.controller";

const router: Router = Router();

/**
 * @openapi
 * /security-roles:
 *   get:
 *     tags:
 *       - Security Roles
 *     summary: List all security roles
 *     description: Returns all security roles matching the optional query filters. Does not include permissions.
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
 *         name: isActive
 *         schema:
 *           type: string
 *           enum: [true, false]
 *         description: Filter by active/inactive status
 *     responses:
 *       200:
 *         description: List of security roles
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/SecurityRole'
 */
router.get(
  "/",
  authorize("security-roles"),
  validate(securityRoleFiltersSchema, "query"),
  findAll,
);

/**
 * @openapi
 * /security-roles/paged:
 *   get:
 *     tags:
 *       - Security Roles
 *     summary: List security roles with pagination
 *     description: Returns a paginated list of security roles matching the optional query filters. Does not include permissions.
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
 *         name: isActive
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
 *         description: Paginated list of security roles
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/SecurityRole'
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
  authorize("security-roles"),
  validate(securityRolePagedQuerySchema, "query"),
  findAllPaged,
);

/**
 * @openapi
 * /security-roles:
 *   post:
 *     tags:
 *       - Security Roles
 *     summary: Create a new security role
 *     description: Creates a new security role with the provided name, description, isActive, and permissions. isActive defaults to true.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateSecurityRoleDto'
 *     responses:
 *       201:
 *         description: Security role created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SecurityRoleDetail'
 *       400:
 *         description: Validation error
 *       409:
 *         description: Security role with this name already exists
 */
router.post(
  "/",
  authorize("security-roles"),
  validate(createSecurityRoleSchema, "body"),
  create,
);

/**
 * @openapi
 * /security-roles/{id}:
 *   get:
 *     tags:
 *       - Security Roles
 *     summary: Get security role by ID
 *     description: Returns a single security role by its UUID, including its permissions array.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Security role UUID
 *     responses:
 *       200:
 *         description: Security role detail with permissions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SecurityRoleDetail'
 *       400:
 *         description: Invalid UUID format
 *       404:
 *         description: Security role not found
 */
router.get(
  "/:id",
  authorize("security-roles"),
  validate(idParamSchema, "params"),
  findById,
);

/**
 * @openapi
 * /security-roles/{id}:
 *   patch:
 *     tags:
 *       - Security Roles
 *     summary: Update a security role
 *     description: Partially updates an existing security role. At least one field must be provided. When permissions are included, Sync_Completo is applied (all previous permissions are replaced).
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Security role UUID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateSecurityRoleDto'
 *     responses:
 *       200:
 *         description: Security role updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SecurityRoleDetail'
 *       400:
 *         description: Validation error or empty body
 *       404:
 *         description: Security role not found
 *       409:
 *         description: Name conflict with another security role
 */
router.patch(
  "/:id",
  authorize("security-roles"),
  validate(idParamSchema, "params"),
  validate(updateSecurityRoleSchema, "body"),
  update,
);

/**
 * @openapi
 * /security-roles/{id}:
 *   delete:
 *     tags:
 *       - Security Roles
 *     summary: Soft delete a security role
 *     description: Sets the security role isDeleted flag to true (logical deletion). Does not remove the record.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Security role UUID
 *     responses:
 *       204:
 *         description: Eliminado correctamente (No Content)
 *       400:
 *         description: Invalid UUID format
 *       404:
 *         description: Security role not found
 *       409:
 *         description: Security role is already inactive
 */
router.delete(
  "/:id",
  authorize("security-roles"),
  validate(idParamSchema, "params"),
  softDelete,
);

export default router;
