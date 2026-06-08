import { z } from "zod";

const GUARDIAN_TYPES = [
  "father",
  "mother",
  "grandmother",
  "grandfather",
  "uncle",
  "aunt",
  "brother",
  "sister",
  "legal-guardian",
  "step-father",
  "step-mother",
  "other",
] as const;

/** Validates POST body for creating a student guardian */
export const createStudentGuardianSchema = z.object({
  fullName: z.string().min(1).max(200),
  relationship: z.enum(GUARDIAN_TYPES),
  phoneNumber: z.string().min(1).max(20),
  email: z.string().email().max(150),
  isPrincipal: z.boolean().default(false),
  emergencyContact: z.boolean().default(false),
  authorizedToPickUp: z.boolean().default(false),
  observations: z.string().max(500).optional(),
});

/** Validates PATCH body for updating a student guardian */
export const updateStudentGuardianSchema = z
  .object({
    fullName: z.string().min(1).max(200).optional(),
    relationship: z.enum(GUARDIAN_TYPES).optional(),
    phoneNumber: z.string().min(1).max(20).optional(),
    email: z.string().email().max(150).optional(),
    isPrincipal: z.boolean().optional(),
    emergencyContact: z.boolean().optional(),
    authorizedToPickUp: z.boolean().optional(),
    observations: z.string().max(500).nullable().optional(),
  })
  .refine((data) => Object.values(data).some((v) => v !== undefined), {
    message: "At least one field is required",
  });
