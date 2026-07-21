import { z } from "zod";

const paymentMethodEnum = z.enum(["online-payment", "cash"]);

/** Validates PATCH body for updating a student wallet item */
export const updateStudentWalletItemSchema = z
  .object({
    allowForgiveness: z.boolean().optional(),
    isForgiven: z.boolean().optional(),
    extensionDate: z.string().datetime().nullable().optional(),
  })
  .refine((data) => Object.values(data).some((v) => v !== undefined), {
    message: "At least one field is required",
  });

/** Validates POST body for creating a student wallet payment */
export const createStudentWalletPaymentSchema = z.object({
  amount: z
    .number()
    .int({ message: "amount must not have decimals" })
    .positive({ message: "amount must be a positive number" }),
  paymentMethod: paymentMethodEnum,
  studentWalletItemId: z.string().uuid().optional(),
});
