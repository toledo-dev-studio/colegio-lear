import { z } from "zod";

// ─── Schemas ────────────────────────────────────────────────────────────────

/**
 * Validates POST /auth/login body.
 * - username: username or email (string, non-empty)
 * - password: string, non-empty
 */
export const loginSchema = z.object({
  username: z.string().min(1, "El nombre de usuario es requerido"),
  password: z.string().min(1, "La contraseña es requerida"),
});

/**
 * Validates POST /auth/forgot-password body.
 * - username: username or email (string, non-empty)
 */
export const forgotPasswordSchema = z.object({
  username: z.string().min(1, "El nombre de usuario es requerido"),
});

/**
 * Validates POST /auth/change-password body.
 * - token: JWT reset token from the forgot-password email link
 * - code: 6-digit code received by email
 * - password: new password, minimum 6 characters
 * - confirmPassword: must match password
 */
export const changePasswordSchema = z
  .object({
    token: z.string().min(1, "El token es requerido"),
    code: z.string().length(6, "El código debe ser de 6 dígitos"),
    password: z
      .string()
      .min(6, "La nueva contraseña debe tener al menos 6 caracteres"),
    confirmPassword: z.string().min(1, "La confirmación es requerida"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });
