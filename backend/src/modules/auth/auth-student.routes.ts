import { Router } from "express";
import { validate } from "../../shared/middleware/validate.middleware";
import { authenticateStudent } from "../../shared/middleware/auth-student.middleware";
import {
  studentLoginSchema,
  studentRequestResetPasswordSchema,
  studentResetPasswordSchema,
} from "./auth-student.schema";
import {
  login,
  logout,
  requestResetPassword,
  resetPassword,
  me,
} from "./auth-student.controller";

const router = Router();

/**
 * @openapi
 * /auth/student/login:
 *   post:
 *     tags:
 *       - Auth (Student)
 *     summary: Login de alumno
 *     description: Autentica a un alumno por email o matrícula y contraseña. Establece una cookie HttpOnly con el JWT de acceso (sliding expiration).
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 description: Email o matrícula del alumno
 *                 example: "LR-2026-0001"
 *               password:
 *                 type: string
 *                 description: Contraseña del alumno
 *                 example: "Estudiante123!"
 *     responses:
 *       200:
 *         description: Login exitoso. Retorna datos del alumno y establece cookie access_token.
 *       400:
 *         description: Error de validación
 *       401:
 *         description: Credenciales inválidas
 *       403:
 *         description: Alumno inactivo o dado de baja
 */
router.post("/login", validate(studentLoginSchema, "body"), login);

/**
 * @openapi
 * /auth/student/logout:
 *   post:
 *     tags:
 *       - Auth (Student)
 *     summary: Logout de alumno
 *     description: Cierra la sesión del alumno limpiando la cookie access_token.
 *     responses:
 *       200:
 *         description: Sesión cerrada correctamente
 */
router.post("/logout", logout);

/**
 * @openapi
 * /auth/student/request-reset-password:
 *   post:
 *     tags:
 *       - Auth (Student)
 *     summary: Solicitar restablecimiento de contraseña
 *     description: Genera una nueva contraseña temporal y un código de verificación de 6 dígitos, y los envía por email. Siempre responde 200 sin importar si el email existe.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "alumno@colegiolear.com"
 *     responses:
 *       200:
 *         description: Correo enviado (respuesta idéntica sin importar si el email existe)
 *       400:
 *         description: Error de validación
 */
router.post(
  "/request-reset-password",
  validate(studentRequestResetPasswordSchema, "body"),
  requestResetPassword,
);

/**
 * @openapi
 * /auth/student/reset-password:
 *   post:
 *     tags:
 *       - Auth (Student)
 *     summary: Confirmar restablecimiento de contraseña
 *     description: Completa el restablecimiento de contraseña iniciado con POST /auth/student/request-reset-password. Requiere sesión autenticada (el alumno ya inició sesión con la contraseña temporal) y el código de 6 dígitos del mismo correo.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *               - password
 *               - confirmPassword
 *             properties:
 *               id:
 *                 type: string
 *                 description: Id del alumno de la sesión (informativo, no se usa para autorizar)
 *               code:
 *                 type: string
 *                 description: Código de 6 dígitos recibido por email
 *               password:
 *                 type: string
 *                 minLength: 6
 *               confirmPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Contraseña actualizada correctamente
 *       400:
 *         description: Error de validación (contraseñas no coinciden, etc.)
 *       401:
 *         description: No autenticado, no hay solicitud activa, código expirado o incorrecto
 */
router.post(
  "/reset-password",
  authenticateStudent,
  validate(studentResetPasswordSchema, "body"),
  resetPassword,
);

/**
 * @openapi
 * /auth/student/me:
 *   get:
 *     tags:
 *       - Auth (Student)
 *     summary: Obtener perfil del alumno autenticado
 *     description: Retorna los mismos datos que el login (con enrollments actualizadas). Requiere cookie access_token válida (o header Authorization Bearer).
 *     responses:
 *       200:
 *         description: Datos del alumno autenticado
 *       401:
 *         description: Token ausente, inválido o expirado
 */
router.get("/me", authenticateStudent, me);

export default router;
