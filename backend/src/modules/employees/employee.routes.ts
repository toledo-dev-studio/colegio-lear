import { Router } from "express";
import multer from "multer";
import { validate } from "../../shared/middleware/validate.middleware";
import { ValidationError } from "../../shared/errors/app-error";
import {
  idParamSchema,
  employeeFiltersSchema,
  employeePagedQuerySchema,
  createEmployeeSchema,
  updateEmployeeSchema,
} from "./employee.schema";
import {
  findAll,
  findAllPaged,
  findById,
  create,
  update,
  softDelete,
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

/** Middleware for single optional file upload with field name "file" */
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
 *         name: roleId
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
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: Employees retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Employee'
 */
router.get("/", validate(employeeFiltersSchema, "query"), findAll);

/**
 * @openapi
 * /employees/paged:
 *   get:
 *     tags:
 *       - Employees
 *     summary: List employees with pagination
 *     description: Returns a paginated list of employees matching the optional query filters. Includes nested jobTitle and securityRole (without permissions).
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *           maxLength: 100
 *         description: Free-text search on name, firstLastName, secondLastName, or email (case-insensitive)
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
 *         name: roleId
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
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Employee'
 *                 pagination:
 *                   $ref: '#/components/schemas/PaginationMeta'
 *       400:
 *         description: Invalid pagination parameters
 */
router.get("/paged", validate(employeePagedQuerySchema, "query"), findAllPaged);

/**
 * @openapi
 * /employees:
 *   post:
 *     tags:
 *       - Employees
 *     summary: Create a new employee
 *     description: Creates a new employee with the provided data and optional image file. Generates a username automatically and sends an invitation email.
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - firstLastName
 *               - secondLastName
 *               - phoneNumber
 *               - email
 *               - securityRoleId
 *               - jobTitleId
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Optional employee image (jpeg, png, webp, gif; max 5MB)
 *               name:
 *                 type: string
 *                 maxLength: 100
 *                 description: Employee first name
 *               firstLastName:
 *                 type: string
 *                 maxLength: 100
 *                 description: Employee first last name
 *               secondLastName:
 *                 type: string
 *                 maxLength: 100
 *                 description: Employee second last name
 *               phoneNumber:
 *                 type: string
 *                 maxLength: 20
 *                 description: Employee phone number
 *               email:
 *                 type: string
 *                 format: email
 *                 maxLength: 150
 *                 description: Employee email address (must be unique)
 *               securityRoleId:
 *                 type: string
 *                 format: uuid
 *                 description: UUID of the security role to assign
 *               jobTitleId:
 *                 type: string
 *                 format: uuid
 *                 description: UUID of the job title to assign
 *     responses:
 *       201:
 *         description: Employee created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 201
 *                 message:
 *                   type: string
 *                   example: Employee created successfully
 *                 data:
 *                   $ref: '#/components/schemas/EmployeeDetail'
 *       400:
 *         description: Validation error
 *       409:
 *         description: Employee with this email already exists
 */
router.post("/", uploadSingle, validate(createEmployeeSchema, "body"), create);

/**
 * @openapi
 * /employees/{id}:
 *   get:
 *     tags:
 *       - Employees
 *     summary: Get employee by ID
 *     description: Returns a single employee by its UUID, including nested jobTitle and securityRole with permissions.
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
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/EmployeeDetail'
 *       400:
 *         description: Invalid UUID format
 *       404:
 *         description: Employee not found
 */
router.get("/:id", validate(idParamSchema, "params"), findById);

/**
 * @openapi
 * /employees/{id}:
 *   patch:
 *     tags:
 *       - Employees
 *     summary: Update an employee
 *     description: Partially updates an existing employee. At least one field or file must be provided. Username is never regenerated.
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
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Optional new employee image (jpeg, png, webp, gif; max 5MB)
 *               name:
 *                 type: string
 *                 maxLength: 100
 *                 description: Employee first name
 *               firstLastName:
 *                 type: string
 *                 maxLength: 100
 *                 description: Employee first last name
 *               secondLastName:
 *                 type: string
 *                 maxLength: 100
 *                 description: Employee second last name
 *               phoneNumber:
 *                 type: string
 *                 maxLength: 20
 *                 description: Employee phone number
 *               email:
 *                 type: string
 *                 format: email
 *                 maxLength: 150
 *                 description: Employee email address (must be unique)
 *               securityRoleId:
 *                 type: string
 *                 format: uuid
 *                 description: UUID of the security role to assign
 *               jobTitleId:
 *                 type: string
 *                 format: uuid
 *                 description: UUID of the job title to assign
 *     responses:
 *       200:
 *         description: Employee updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/EmployeeDetail'
 *       400:
 *         description: Validation error or empty body
 *       404:
 *         description: Employee not found
 *       409:
 *         description: Email conflict with another employee
 */
router.patch(
  "/:id",
  uploadSingle,
  validate(idParamSchema, "params"),
  validate(updateEmployeeSchema, "body"),
  update,
);

/**
 * @openapi
 * /employees/{id}:
 *   delete:
 *     tags:
 *       - Employees
 *     summary: Soft delete an employee
 *     description: Sets the employee status to false (logical deletion). Does not remove the record.
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
 *         description: Employee deactivated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: Empleado desactivado correctamente
 *                 data:
 *                   type: "null"
 *       400:
 *         description: Invalid UUID format
 *       404:
 *         description: Employee not found
 *       409:
 *         description: Employee is already inactive
 */
router.delete("/:id", validate(idParamSchema, "params"), softDelete);

export default router;
