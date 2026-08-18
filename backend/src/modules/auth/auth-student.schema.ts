import { z } from "zod";

/**
 * Validates POST /auth/student/login body.
 * - username: email or enrollment (matrícula), non-empty
 * - password: string, non-empty
 */
export const studentLoginSchema = z.object({
  username: z.string().min(1, "El usuario es requerido"),
  password: z.string().min(1, "La contraseña es requerida"),
});

/**
 * Validates POST /auth/student/request-reset-password body.
 */
export const studentRequestResetPasswordSchema = z.object({
  email: z.string().email("Debe ser un email válido"),
});

/**
 * Validates POST /auth/student/reset-password body.
 * The student is identified via the authenticated session (req.student), not
 * via `id` — accepted (and ignored) here only because student-web sends it.
 */
export const studentResetPasswordSchema = z
  .object({
    id: z.string().uuid().optional(),
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
