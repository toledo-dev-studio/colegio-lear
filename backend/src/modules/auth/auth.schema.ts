import { z } from "zod";

// ─── Schemas ────────────────────────────────────────────────────────────────

/**
 * Validates POST /auth/login body.
 * - identifier: username or email (string, non-empty)
 * - password: string, non-empty
 */
export const loginSchema = z.object({
  identifier: z.string().min(1, "El identificador es requerido"),
  password: z.string().min(1, "La contraseña es requerida"),
});

/**
 * Validates POST /auth/forgot-password body.
 * - email: valid email format
 */
export const forgotPasswordSchema = z.object({
  email: z.string().email("El email no tiene un formato válido"),
});

/**
 * Validates POST /auth/change-password body.
 * - currentPassword: string, non-empty
 * - newPassword: string, minimum 6 characters
 */
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "La contraseña actual es requerida"),
  newPassword: z
    .string()
    .min(6, "La nueva contraseña debe tener al menos 6 caracteres"),
});
