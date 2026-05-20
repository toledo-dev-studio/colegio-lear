import { Router } from "express";
import { validate } from "../../shared/middleware/validate.middleware";
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
} from "./auth.controller";

const router = Router();

/**
 * @openapi
 * /auth/login:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Login de empleado
 *     description: Autentica un empleado por username o email y contraseña. Establece una cookie HttpOnly con el JWT de acceso.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - identifier
 *               - password
 *             properties:
 *               identifier:
 *                 type: string
 *                 description: Username o email del empleado
 *                 example: "otrejo"
 *               password:
 *                 type: string
 *                 description: Contraseña del empleado
 *                 example: "miPassword123"
 *     responses:
 *       200:
 *         description: Login exitoso. Retorna datos del empleado y establece cookie access_token.
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
 *                   example: Login exitoso
 *                 data:
 *                   $ref: '#/components/schemas/LoginResponse'
 *       400:
 *         description: Error de validación (campos vacíos o formato inválido)
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
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: Sesión cerrada correctamente
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
 *     description: Genera una contraseña temporal y la envía por correo electrónico. Siempre responde con 200 independientemente de si el email existe o no.
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
 *                 description: Email del empleado registrado
 *                 example: "empleado@colegiolear.edu.mx"
 *     responses:
 *       200:
 *         description: Correo enviado con instrucciones (respuesta idéntica sin importar si el email existe)
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
 *                   example: Se envió un correo con instrucciones para recuperar tu contraseña
 *                 data:
 *                   type: "null"
 *       400:
 *         description: Error de validación (email con formato inválido)
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
 *     summary: Cambio de contraseña
 *     description: Cambia la contraseña del empleado autenticado. Requiere sesión activa (JWT válido en cookie o header).
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 description: Contraseña actual del empleado
 *                 example: "miPasswordActual"
 *               newPassword:
 *                 type: string
 *                 minLength: 6
 *                 description: Nueva contraseña (mínimo 6 caracteres)
 *                 example: "miNuevaPassword123"
 *     responses:
 *       200:
 *         description: Contraseña actualizada correctamente
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
 *                   example: Contraseña actualizada correctamente
 *                 data:
 *                   type: "null"
 *       400:
 *         description: Error de validación (contraseña nueva muy corta o campos vacíos)
 *       401:
 *         description: Token no proporcionado, expirado, inválido, o contraseña actual incorrecta
 */
router.post(
  "/change-password",
  validate(changePasswordSchema, "body"),
  changePassword,
);

export default router;
