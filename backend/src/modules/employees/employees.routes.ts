import { Router } from "express";
import { authenticate } from "../../shared/middleware/auth.middleware";
import { authorize } from "../../shared/middleware/rbac.middleware";
import { validate } from "../../shared/middleware/validate.middleware";
import {
  createEmployeeSchema,
  updateEmployeeSchema,
  employeeQuerySchema,
} from "./employees.schema";
import * as controller from "./employees.controller";

const router = Router();

/**
 * @openapi
 * /api/employees:
 *   post:
 *     tags:
 *       - Employees
 *     summary: Create a new employee
 *     description: Creates a new employee record. Requires "employees:create" privilege.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - email
 *               - password
 *               - employeeType
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: "John"
 *               lastName:
 *                 type: string
 *                 example: "Doe"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "john.doe@example.com"
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "Secret1234"
 *               employeeType:
 *                 type: string
 *                 example: "teacher"
 *     responses:
 *       201:
 *         description: Employee created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized — missing or invalid token
 *       403:
 *         description: Forbidden — insufficient privileges
 *       409:
 *         description: Conflict — email already exists
 */
router.post(
  "/api/employees",
  authenticate,
  authorize("employees", "create"),
  validate(createEmployeeSchema),
  controller.create,
);

/**
 * @openapi
 * /api/employees:
 *   get:
 *     tags:
 *       - Employees
 *     summary: List employees
 *     description: Returns a paginated list of employees with optional search. Requires "employees:read" privilege.
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
 *         description: Search by first name, last name, or email
 *     responses:
 *       200:
 *         description: Employees retrieved successfully
 *       401:
 *         description: Unauthorized — missing or invalid token
 *       403:
 *         description: Forbidden — insufficient privileges
 */
router.get(
  "/api/employees",
  authenticate,
  authorize("employees", "read"),
  validate(employeeQuerySchema, "query"),
  controller.getAll,
);

/**
 * @openapi
 * /api/employees/{id}:
 *   get:
 *     tags:
 *       - Employees
 *     summary: Get employee by ID
 *     description: Returns a single employee record. Requires "employees:read" privilege.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Employee ID
 *     responses:
 *       200:
 *         description: Employee retrieved successfully
 *       401:
 *         description: Unauthorized — missing or invalid token
 *       403:
 *         description: Forbidden — insufficient privileges
 *       404:
 *         description: Employee not found
 */
router.get(
  "/api/employees/:id",
  authenticate,
  authorize("employees", "read"),
  controller.getById,
);

/**
 * @openapi
 * /api/employees/{id}:
 *   patch:
 *     tags:
 *       - Employees
 *     summary: Update an employee
 *     description: Partially updates an employee record. Requires "employees:update" privilege.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Employee ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *               employeeType:
 *                 type: string
 *     responses:
 *       200:
 *         description: Employee updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized — missing or invalid token
 *       403:
 *         description: Forbidden — insufficient privileges
 *       404:
 *         description: Employee not found
 *       409:
 *         description: Conflict — email already exists
 */
router.patch(
  "/api/employees/:id",
  authenticate,
  authorize("employees", "update"),
  validate(updateEmployeeSchema),
  controller.update,
);

/**
 * @openapi
 * /api/employees/{id}/deactivate:
 *   patch:
 *     tags:
 *       - Employees
 *     summary: Deactivate an employee
 *     description: Soft-deletes an employee by setting isActive to false. Requires "employees:delete" privilege.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Employee ID
 *     responses:
 *       200:
 *         description: Employee deactivated successfully
 *       401:
 *         description: Unauthorized — missing or invalid token
 *       403:
 *         description: Forbidden — insufficient privileges
 *       404:
 *         description: Employee not found
 */
router.patch(
  "/api/employees/:id/deactivate",
  authenticate,
  authorize("employees", "delete"),
  controller.deactivate,
);

export default router;
