import { Router } from "express";
import multer from "multer";
import { validate } from "../../shared/middleware/validate.middleware";
import { authorize } from "../../shared/middleware/rbac.middleware";
import { requireMultipart } from "../../shared/middleware/require-multipart.middleware";
import { ValidationError } from "../../shared/errors/app-error";
import {
  idParamSchema,
  employeeFiltersSchema,
  employeePagedQuerySchema,
  createEmployeeSchema,
  updateEmployeeSchema,
  updateMyAccountSchema,
} from "./employee.schema";
import {
  findAll,
  findAllPaged,
  findById,
  create,
  update,
  softDelete,
  resendInvitation,
  updateMyAccount,
  uploadMyAvatar,
  uploadAvatarById,
  findAllTeachers,
} from "./employee.controller";

// ─── Multer Configuration ───────────────────────────────────────────────────────

/**
 * In-memory storage — file is available as req.file.buffer.
 * Limits file size to 5MB and only allows image MIME types.
 */
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowedMimes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new ValidationError(
          "Only image files are allowed (jpeg, png, webp, gif)",
          [{ field: "file", message: "Only image files are allowed" }],
        ),
      );
    }
  },
});

const uploadSingle = upload.single("file");

// ─── Router ─────────────────────────────────────────────────────────────────────

const router = Router();

/**
 * @openapi
 * /employees:
 *   get:
 *     tags:
 *       - Employees
 *     summary: List all employees
 *     description: Returns all employees matching the optional query filters. Includes nested jobTitle and securityRole (without permissions).
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *           maxLength: 100
 *         description: Free-text search on name, firstLastName, secondLastName, or email (case-insensitive)
 *       - in: query
 *         name: fullName
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
 *         name: securityRoleId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by securityRoleId
 *       - in: query
 *         name: jobTitleId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by jobTitleId
 *     responses:
 *       200:
 *         description: List of employees
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Employee'
 */
router.get(
  "/",
  authorize("employees"),
  validate(employeeFiltersSchema, "query"),
  findAll,
);

/**
 * @openapi
 * /employees/paged:
 *   get:
 *     tags:
 *       - Employees
 *     summary: List employees with pagination
 *     description: Returns a paginated list of employees. Includes nested jobTitle and securityRole (without permissions).
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *           maxLength: 100
 *         description: Free-text search on name, firstLastName, secondLastName, or email (case-insensitive)
 *       - in: query
 *         name: fullName
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
 *         name: securityRoleId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by securityRoleId
 *       - in: query
 *         name: jobTitleId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by jobTitleId
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
 *         description: Paginated list of employees
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Employee'
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
  authorize("employees"),
  validate(employeePagedQuerySchema, "query"),
  findAllPaged,
);

/**
 * @openapi
 * /employees:
 *   post:
 *     tags:
 *       - Employees
 *     summary: Create a new employee
 *     description: Creates a new employee. Generates username automatically and sends an invitation email. Avatar is uploaded separately via POST /employees/{id}/avatar once the employee exists.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - firstLastName
 *               - phoneNumber
 *               - email
 *               - securityRoleId
 *               - jobTitleId
 *             properties:
 *               name:
 *                 type: string
 *               firstLastName:
 *                 type: string
 *               secondLastName:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               securityRoleId:
 *                 type: string
 *                 format: uuid
 *               jobTitleId:
 *                 type: string
 *                 format: uuid
 *               isActive:
 *                 type: boolean
 *                 default: true
 *     responses:
 *       201:
 *         description: Employee created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EmployeeDetail'
 *       400:
 *         description: Validation error
 *       409:
 *         description: Employee with this email already exists
 */
router.post(
  "/",
  authorize("employees"),
  validate(createEmployeeSchema, "body"),
  create,
);

/**
 * @openapi
 * /employees/me:
 *   patch:
 *     tags:
 *       - Employees
 *     summary: Update authenticated employee's own account
 *     description: Updates the current user's profile (name, firstLastName, secondLastName, phoneNumber). Avatar is updated separately via POST /employees/me/avatar. Returns the same shape as GET /auth/me. No RBAC check — any authenticated user can update their own account.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - firstLastName
 *               - phoneNumber
 *             properties:
 *               name:
 *                 type: string
 *               firstLastName:
 *                 type: string
 *               secondLastName:
 *                 type: string
 *                 description: Optional
 *               phoneNumber:
 *                 type: string
 *     responses:
 *       200:
 *         description: Account updated successfully. Returns same shape as /auth/me.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Not authenticated
 *       404:
 *         description: Employee not found or inactive
 */
// PATCH /me does NOT require RBAC — any authenticated employee can update their own profile
router.patch(
  "/me",
  validate(updateMyAccountSchema, "body"),
  updateMyAccount,
);

/**
 * @openapi
 * /employees/me/avatar:
 *   post:
 *     tags:
 *       - Employees
 *     summary: Upload or replace authenticated employee's own avatar
 *     description: Uploads a new avatar for the authenticated employee, replacing the previous one if present. Requires multipart/form-data with a file. Returns the same shape as GET /auth/me. No RBAC check — any authenticated user can update their own avatar.
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Avatar image (jpeg, png, webp, gif; max 5MB)
 *     responses:
 *       200:
 *         description: Avatar updated successfully. Returns same shape as /auth/me.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       400:
 *         description: Validation error or missing file
 *       401:
 *         description: Not authenticated
 *       404:
 *         description: Employee not found or inactive
 */
// POST /me/avatar does NOT require RBAC — any authenticated employee can update their own avatar
router.post(
  "/me/avatar",
  requireMultipart,
  uploadSingle,
  uploadMyAvatar,
);

/**
 * @openapi
 * /employees/teachers:
 *   get:
 *     tags:
 *       - Employees
 *     summary: List active teachers
 *     description: Returns all active employees whose job title type is "teacher". Useful for dropdowns in other modules.
 *     responses:
 *       200:
 *         description: List of teacher employees
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Employee'
 */
// Must be registered BEFORE "/:id" — otherwise Express matches "/:id" first
// and "teachers" gets treated as a UUID path param, failing validation.
router.get("/teachers", authorize("employees"), findAllTeachers);

/**
 * @openapi
 * /employees/{id}:
 *   get:
 *     tags:
 *       - Employees
 *     summary: Get employee by ID
 *     description: Returns a single employee including nested jobTitle and securityRole with permissions.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Employee UUID
 *     responses:
 *       200:
 *         description: Employee detail with relations
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EmployeeDetail'
 *       400:
 *         description: Invalid UUID format
 *       404:
 *         description: Employee not found
 */
router.get(
  "/:id",
  authorize("employees"),
  validate(idParamSchema, "params"),
  findById,
);

/**
 * @openapi
 * /employees/{id}:
 *   patch:
 *     tags:
 *       - Employees
 *     summary: Update an employee
 *     description: Partially updates an existing employee. At least one field must be provided. Username is never regenerated. Avatar is updated separately via POST /employees/{id}/avatar.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Employee UUID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               firstLastName:
 *                 type: string
 *               secondLastName:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               securityRoleId:
 *                 type: string
 *                 format: uuid
 *               jobTitleId:
 *                 type: string
 *                 format: uuid
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Employee updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EmployeeDetail'
 *       400:
 *         description: Validation error or empty body
 *       404:
 *         description: Employee not found
 *       409:
 *         description: Email conflict with another employee
 */
router.patch(
  "/:id",
  authorize("employees"),
  validate(idParamSchema, "params"),
  validate(updateEmployeeSchema, "body"),
  update,
);

/**
 * @openapi
 * /employees/{id}/avatar:
 *   post:
 *     tags:
 *       - Employees
 *     summary: Upload or replace an employee's avatar
 *     description: Uploads a new avatar for the given employee, replacing the previous one if present. Requires multipart/form-data with a file.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Employee UUID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Avatar image (jpeg, png, webp, gif; max 5MB)
 *     responses:
 *       200:
 *         description: Avatar updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EmployeeDetail'
 *       400:
 *         description: Validation error or missing file
 *       404:
 *         description: Employee not found
 */
router.post(
  "/:id/avatar",
  authorize("employees"),
  validate(idParamSchema, "params"),
  requireMultipart,
  uploadSingle,
  uploadAvatarById,
);

/**
 * @openapi
 * /employees/{id}:
 *   delete:
 *     tags:
 *       - Employees
 *     summary: Soft delete an employee
 *     description: Sets the employee isDeleted to true (logical deletion). Does not remove the record.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Employee UUID
 *     responses:
 *       204:
 *         description: Eliminado correctamente (No Content)
 *       400:
 *         description: Invalid UUID format
 *       404:
 *         description: Employee not found
 *       409:
 *         description: Employee is already deleted
 */
router.delete(
  "/:id",
  authorize("employees"),
  validate(idParamSchema, "params"),
  softDelete,
);

/**
 * @openapi
 * /employees/{id}/resend-invitation:
 *   post:
 *     tags:
 *       - Employees
 *     summary: Resend invitation email
 *     description: Regenerates a temporary password and resends the invitation email to the employee.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Employee UUID
 *     responses:
 *       200:
 *         description: Invitation email resent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: "null"
 *       400:
 *         description: Invalid UUID format
 *       404:
 *         description: Employee not found
 */
router.post(
  "/:id/resend-invitation",
  authorize("employees"),
  validate(idParamSchema, "params"),
  resendInvitation,
);

export default router;
