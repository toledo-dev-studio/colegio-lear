import { z } from "zod";

/** Validates POST body for creating an academic cycle wallet item */
export const createAcademicCycleWalletSchema = z.object({
  paymentConceptId: z
    .string()
    .uuid({ message: "paymentConceptId must be a valid UUID" }),
  dueDate: z.string().datetime({ message: "dueDate must be a valid ISO date" }),
  amount: z.number().positive({ message: "amount must be a positive number" }),
  allowForgiveness: z.boolean().optional(),
});

/** Validates PATCH body for updating an academic cycle wallet item */
export const updateAcademicCycleWalletSchema = z
  .object({
    paymentConceptId: z.string().uuid().optional(),
    dueDate: z.string().datetime().optional(),
    amount: z.number().positive().optional(),
    allowForgiveness: z.boolean().optional(),
  })
  .refine((data) => Object.values(data).some((v) => v !== undefined), {
    message: "At least one field is required",
  });
