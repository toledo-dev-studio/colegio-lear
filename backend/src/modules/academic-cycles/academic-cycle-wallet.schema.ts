import { z } from "zod";

function nonBlankString(maxLength: number) {
  return z
    .string()
    .transform((val) => val.trim())
    .refine((val) => val.length >= 1, { message: "Must not be blank" })
    .refine((val) => val.length <= maxLength, {
      message: `Must be at most ${maxLength} characters`,
    });
}

/** Validates POST body for creating an academic cycle wallet item */
export const createAcademicCycleWalletSchema = z.object({
  name: nonBlankString(100),
  description: z.string().max(500).optional(),
  dueDate: z.string().datetime({ message: "dueDate must be a valid ISO date" }),
  amount: z.number().positive({ message: "amount must be a positive number" }),
  allowForgiveness: z.boolean().optional(),
});

/** Validates PATCH body for updating an academic cycle wallet item */
export const updateAcademicCycleWalletSchema = z
  .object({
    name: nonBlankString(100).optional(),
    description: z.string().max(500).optional(),
    dueDate: z.string().datetime().optional(),
    amount: z.number().positive().optional(),
    allowForgiveness: z.boolean().optional(),
  })
  .refine((data) => Object.values(data).some((v) => v !== undefined), {
    message: "At least one field is required",
  });
