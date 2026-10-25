import { Router } from "express";
import { validate } from "../../shared/middleware/validate.middleware";
import { authenticate } from "../../shared/middleware/auth.middleware";
import {
  loginSchema,
  requestResetPasswordSchema,
  resetPasswordSchema,
} from "./auth.schema";
import {
  login,
  logout,
  requestResetPassword,
  resetPassword,
  me,
} from "./auth.controller";

const router = Router();

/**
 * @openapi
 * /auth/login:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Login de empleado
 *     description: Autentica un empleado por username o email y contraseña. Establece una cookie HttpOnly con el JWT de acceso (sliding expiration).
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
 *                 description: Username o email del empleado
 *                 example: "otrejo"
 *               password:
 *                 type: string
 *                 description: Contraseña del empleado
 *                 example: "Admin123!"
 *     responses:
 *       200:
 *         description: Login exitoso. Retorna datos del empleado y establece cookie access_token.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       400:
 *         description: Error de validación
 *       401:
 *         description: Credenciales inválidas o cuenta deshabilitada
 */
router.post("/login", validate(loginSchema, "body"), login);

/**
 * @openapi
 * /auth/logout:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Logout de empleado
 *     description: Cierra la sesión del empleado limpiando la cookie access_token.
 *     responses:
 *       200:
 *         description: Sesión cerrada correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: "null"
 */
router.post("/logout", logout);

/**
 * @openapi
 * /auth/request-reset-password:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Solicitar restablecimiento de contraseña
 *     description: Genera una nueva contraseña temporal y un código de verificación de 6 dígitos, y los envía por email. El empleado debe iniciar sesión con la contraseña temporal y luego confirmar con POST /auth/reset-password. Siempre responde 200 sin importar si el email existe.
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
 *                 description: Email del empleado
 *                 example: "otrejo@colegiolear.com"
 *     responses:
 *       200:
 *         description: Correo enviado (respuesta idéntica sin importar si el email existe)
 *         content:
 *           application/json:
 *             schema:
 *               type: "null"
 *       400:
 *         description: Error de validación
 */
router.post(
  "/request-reset-password",
  validate(requestResetPasswordSchema, "body"),
  requestResetPassword,
);

/**
 * @openapi
 * /auth/reset-password:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Confirmar restablecimiento de contraseña
 *     description: Completa el restablecimiento de contraseña iniciado con POST /auth/request-reset-password. Requiere sesión autenticada (el empleado ya inició sesión con la contraseña temporal recibida por email) y el código de 6 dígitos del mismo correo.
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
 *               code:
 *                 type: string
 *                 description: Código de 6 dígitos recibido por email
 *                 example: "847291"
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 description: Nueva contraseña (mínimo 6 caracteres)
 *                 example: "miNuevaPassword123"
 *               confirmPassword:
 *                 type: string
 *                 description: Confirmación de la nueva contraseña (debe coincidir)
 *                 example: "miNuevaPassword123"
 *     responses:
 *       200:
 *         description: Contraseña actualizada correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: "null"
 *       400:
 *         description: Error de validación (contraseñas no coinciden, etc.)
 *       401:
 *         description: No autenticado, no hay solicitud activa, código expirado o incorrecto
 */
router.post(
  "/reset-password",
  authenticate,
  validate(resetPasswordSchema, "body"),
  resetPassword,
);

/**
 * @openapi
 * /auth/me:
 *   get:
 *     tags:
 *       - Auth
 *     summary: Obtener perfil del empleado autenticado
 *     description: Retorna los datos completos del empleado autenticado, incluyendo rol de seguridad con permisos y puesto de trabajo. Requiere cookie access_token válida (o header Authorization Bearer).
 *     responses:
 *       200:
 *         description: Datos del empleado autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       401:
 *         description: Token ausente, inválido o expirado
 */
router.get("/me", authenticate, me);

export default router;
