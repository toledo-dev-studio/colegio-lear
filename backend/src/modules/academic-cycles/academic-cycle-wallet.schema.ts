import { z } from "zod";

function nonBlankString(maxLength: number) {
  return z
    .string()
    .transform((val) => val.trim())
    .refine((val) => val.length >= 1, { message: "No debe estar en blanco" })
    .refine((val) => val.length <= maxLength, {
      message: `Debe tener como máximo ${maxLength} caracteres`,
    });
}

/**
 * Internal control code: trimmed, uppercased, 1-10 chars, letters/digits
 * only. Unique per academic cycle, not globally — enforced in the service.
 */
function codeField() {
  return z
    .string()
    .transform((val) => val.trim().toUpperCase())
    .refine((val) => val.length >= 1, { message: "No debe estar en blanco" })
    .refine((val) => val.length <= 10, {
      message: "Debe tener como máximo 10 caracteres",
    })
    .refine((val) => /^[A-Z0-9]+$/.test(val), {
      message: "Debe contener solo letras y números",
    });
}

/** Validates POST body for creating an academic cycle wallet item */
export const createAcademicCycleWalletSchema = z.object({
  name: nonBlankString(100),
  code: codeField(),
  description: z.string().max(500).optional(),
  dueDate: z.string().datetime({ message: "dueDate debe ser una fecha ISO válida" }),
  amount: z.number().positive({ message: "amount debe ser un número positivo" }),
  allowForgiveness: z.boolean().optional(),
});

/** Validates PATCH body for updating an academic cycle wallet item */
export const updateAcademicCycleWalletSchema = z
  .object({
    name: nonBlankString(100).optional(),
    code: codeField().optional(),
    description: z.string().max(500).optional(),
    dueDate: z.string().datetime().optional(),
    amount: z.number().positive().optional(),
    allowForgiveness: z.boolean().optional(),
  })
  .refine((data) => Object.values(data).some((v) => v !== undefined), {
    message: "Se requiere al menos un campo",
  });
