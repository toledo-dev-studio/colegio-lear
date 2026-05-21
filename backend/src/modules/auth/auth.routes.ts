import { Router } from "express";
import { validate } from "../../shared/middleware/validate.middleware";
import { authenticate } from "../../shared/middleware/auth.middleware";
import {
  loginSchema,
  forgotPasswordSchema,
  changePasswordSchema,
} from "./auth.schema";
import {
  login,
  logout,
  forgotPassword,
  changePassword,
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
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/LoginResponse'
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
 *               type: object
 *               properties:
 *                 data:
 *                   type: "null"
 */
router.post("/logout", logout);

/**
 * @openapi
 * /auth/forgot-password:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Recuperación de contraseña
 *     description: Envía un email con un código de 6 dígitos y un link con token JWT para cambiar la contraseña. Siempre responde 200 sin importar si el usuario existe.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *             properties:
 *               username:
 *                 type: string
 *                 description: Username o email del empleado
 *                 example: "otrejo"
 *     responses:
 *       200:
 *         description: Correo enviado (respuesta idéntica sin importar si el usuario existe)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: "null"
 *       400:
 *         description: Error de validación
 */
router.post(
  "/forgot-password",
  validate(forgotPasswordSchema, "body"),
  forgotPassword,
);

/**
 * @openapi
 * /auth/change-password:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Cambio de contraseña con código de verificación
 *     description: Cambia la contraseña usando el token del link del email + el código de 6 dígitos. Endpoint público (no requiere sesión).
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - code
 *               - password
 *               - confirmPassword
 *             properties:
 *               token:
 *                 type: string
 *                 description: JWT token recibido en el query param del link del email
 *                 example: "eyJhbGciOiJIUzI1NiIs..."
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
 *               type: object
 *               properties:
 *                 data:
 *                   type: "null"
 *       400:
 *         description: Error de validación (código incorrecto, contraseñas no coinciden, etc.)
 *       401:
 *         description: Token inválido o expirado, código incorrecto
 */
router.post(
  "/change-password",
  validate(changePasswordSchema, "body"),
  changePassword,
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
