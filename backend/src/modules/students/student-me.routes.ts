import { Router } from "express";
import { authenticateStudent } from "../../shared/middleware/auth-student.middleware";
import { requireMultipart } from "../../shared/middleware/require-multipart.middleware";
import { uploadAvatarSingle } from "../../shared/middleware/avatar-upload.middleware";
import { me, myAllergies, myGuardians, uploadMyAvatar } from "./student-me.controller";

const router = Router();

/**
 * @openapi
 * /students/me:
 *   get:
 *     tags:
 *       - Students (Me)
 *     summary: Obtener los datos personales del alumno autenticado
 *     description: Resuelve el alumno desde la sesión (cookie access_token de alumno). No requiere RBAC.
 *     responses:
 *       200:
 *         description: Datos del alumno autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/StudentRecord'
 *       401:
 *         description: Token ausente, inválido o expirado
 */
router.get("/", authenticateStudent, me);

/**
 * @openapi
 * /students/me/allergies:
 *   get:
 *     tags:
 *       - Students (Me)
 *     summary: Listar las alergias del alumno autenticado
 *     responses:
 *       200:
 *         description: Lista de alergias
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/AllergyRecord'
 *       401:
 *         description: Token ausente, inválido o expirado
 */
router.get("/allergies", authenticateStudent, myAllergies);

/**
 * @openapi
 * /students/me/guardians:
 *   get:
 *     tags:
 *       - Students (Me)
 *     summary: Listar los tutores del alumno autenticado
 *     responses:
 *       200:
 *         description: Lista de tutores
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/StudentGuardianRecord'
 *       401:
 *         description: Token ausente, inválido o expirado
 */
router.get("/guardians", authenticateStudent, myGuardians);

/**
 * @openapi
 * /students/me/avatar:
 *   post:
 *     tags:
 *       - Students (Me)
 *     summary: Subir o reemplazar el avatar del alumno autenticado
 *     description: Requiere multipart/form-data con un archivo. Reemplaza el avatar anterior si existía.
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
 *     responses:
 *       200:
 *         description: Datos del alumno con el avatar actualizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/StudentRecord'
 *       400:
 *         description: Falta el archivo o el tipo no es una imagen válida
 *       401:
 *         description: Token ausente, inválido o expirado
 *       404:
 *         description: Alumno no encontrado o inactivo
 */
router.post(
  "/avatar",
  authenticateStudent,
  requireMultipart,
  uploadAvatarSingle,
  uploadMyAvatar,
);

export default router;
