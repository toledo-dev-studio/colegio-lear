import { Router } from "express";
import { authenticate } from "../../shared/middleware/auth.middleware";
import { authorize } from "../../shared/middleware/rbac.middleware";
import { validate } from "../../shared/middleware/validate.middleware";
import { loginSchema, refreshSchema, assignProfileSchema } from "./auth.schema";
import {
  loginHandler,
  refreshHandler,
  assignProfileHandler,
} from "./auth.controller";

const router = Router();

/**
 * @openapi
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Authenticate an employee
 *     description: Validates email and password, returns access and refresh tokens.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "admin@colegiolear.com"
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "Secret1234"
 *     responses:
 *       200:
 *         description: Login successful
 *       400:
 *         description: Validation error
 *       401:
 *         description: Invalid credentials
 *       403:
 *         description: Account is deactivated
 */
router.post("/api/auth/login", validate(loginSchema), loginHandler);

/**
 * @openapi
 * /api/auth/refresh:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Refresh access token
 *     description: Rotates the refresh token and returns a new access + refresh token pair.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 example: "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
 *     responses:
 *       200:
 *         description: Tokens refreshed successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Invalid or expired refresh token
 */
router.post("/api/auth/refresh", validate(refreshSchema), refreshHandler);

/**
 * @openapi
 * /api/auth/assign-profile:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Assign a profile to an employee
 *     description: Updates the employee's profileId. Requires "employees:update" privilege.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - employeeId
 *               - profileId
 *             properties:
 *               employeeId:
 *                 type: integer
 *                 example: 1
 *               profileId:
 *                 type: integer
 *                 example: 2
 *     responses:
 *       200:
 *         description: Profile assigned successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized — missing or invalid token
 *       403:
 *         description: Forbidden — insufficient privileges
 *       404:
 *         description: Employee or profile not found
 */
router.post(
  "/api/auth/assign-profile",
  authenticate,
  authorize("employees", "update"),
  validate(assignProfileSchema),
  assignProfileHandler,
);

export default router;
