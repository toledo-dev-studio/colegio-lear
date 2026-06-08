import { z } from "zod";

const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"] as const;
const ALLERGY_SEVERITIES = ["mild", "moderate", "severe"] as const;

const allergySchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1).max(100),
  severity: z.enum(ALLERGY_SEVERITIES),
  observations: z.string().max(500).nullable().optional(),
});

/** Validates PATCH body for upserting student medical information */
export const upsertMedicalInformationSchema = z.object({
  bloodType: z.enum(BLOOD_TYPES),
  emergencyNotes: z.string().max(1000).nullable().optional(),
  allergies: z.array(allergySchema).optional(),
});
