import { z } from "zod";

const ALLERGY_SEVERITIES = ["mild", "moderate", "severe"] as const;

/** Validates POST body for creating a student allergy */
export const createAllergySchema = z.object({
  name: z.string().min(1).max(100),
  severity: z.enum(ALLERGY_SEVERITIES),
  observations: z.string().max(500).optional(),
});

/** Validates PATCH body for updating a student allergy */
export const updateAllergySchema = z
  .object({
    name: z.string().min(1).max(100).optional(),
    severity: z.enum(ALLERGY_SEVERITIES).optional(),
    observations: z.string().max(500).nullable().optional(),
  })
  .refine((data) => Object.values(data).some((v) => v !== undefined), {
    message: "Se requiere al menos un campo",
  });
