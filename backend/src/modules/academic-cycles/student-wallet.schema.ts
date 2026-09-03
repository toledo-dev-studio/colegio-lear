import { z } from "zod";

const paymentMethodEnum = z.enum(["online-payment", "cash"]);

/**
 * Optional ISO datetime string for PATCH bodies: blank string or explicit
 * null both mean "clear it" (-> null, e.g. when the user picks
 * "condonación" instead of "prórroga" and leaves the date empty); omitting
 * the key entirely (-> undefined) means "don't touch it". Plain
 * .nullable().optional() only bypasses .datetime() for null/undefined, not
 * for "", which is what the front sends in that case.
 */
function optionalNullableDatetime() {
  return z
    .string()
    .nullable()
    .optional()
    .transform((val) => {
      if (val === undefined) return undefined;
      if (val === null) return null;
      return val.trim() === "" ? null : val;
    })
    .pipe(z.string().datetime().nullable().optional());
}

/** Validates PATCH body for updating a student wallet item */
export const updateStudentWalletItemSchema = z
  .object({
    allowForgiveness: z.boolean().optional(),
    isForgiven: z.boolean().optional(),
    extensionDate: optionalNullableDatetime(),
  })
  .refine((data) => Object.values(data).some((v) => v !== undefined), {
    message: "Se requiere al menos un campo",
  });

/** Validates POST body for creating a student wallet payment */
export const createStudentWalletPaymentSchema = z.object({
  amount: z
    .number()
    .int({ message: "amount no debe tener decimales" })
    .positive({ message: "amount debe ser un número positivo" }),
  paymentMethod: paymentMethodEnum,
  studentWalletItemId: z.string().uuid().optional(),
});
