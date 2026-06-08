import { PrismaClient } from "../../generated/prisma/client";
import { BloodType, AllergySeverity } from "../../generated/prisma/enums";
import { NotFoundError } from "../../shared/errors/app-error";
import type {
  StudentMedicalInformationRecord,
  UpsertMedicalInformationDto,
} from "./student-medical-information.types";

/** Maps frontend blood type strings ("O+") to Prisma enum values ("O_POSITIVE") */
const BLOOD_TYPE_MAP: Record<string, BloodType> = {
  "A+": "A_POSITIVE",
  "A-": "A_NEGATIVE",
  "B+": "B_POSITIVE",
  "B-": "B_NEGATIVE",
  "AB+": "AB_POSITIVE",
  "AB-": "AB_NEGATIVE",
  "O+": "O_POSITIVE",
  "O-": "O_NEGATIVE",
};

/** Maps Prisma enum values back to frontend blood type strings */
const BLOOD_TYPE_REVERSE: Record<string, string> = Object.fromEntries(
  Object.entries(BLOOD_TYPE_MAP).map(([k, v]) => [v, k]),
);

/** Maps frontend severity strings to Prisma enum values */
const SEVERITY_MAP: Record<string, AllergySeverity> = {
  mild: "mild",
  moderate: "moderate",
  severe: "severe",
};

/**
 * Business logic for student medical information sub-resource.
 * Uses upsert pattern: creates if not exists, updates if exists.
 * Allergies are synced completely (delete all + re-create).
 */
export class StudentMedicalInformationService {
  constructor(private readonly prisma: PrismaClient) {}

  private async verifyStudentExists(studentId: string): Promise<void> {
    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
    });
    if (!student || student.isDeleted)
      throw new NotFoundError("Student not found");
  }

  private toRecord(
    raw: Record<string, unknown>,
  ): StudentMedicalInformationRecord {
    const allergies = (raw.allergies as Array<Record<string, unknown>>) ?? [];
    return {
      id: raw.id as string,
      studentId: raw.studentId as string,
      bloodType:
        BLOOD_TYPE_REVERSE[raw.bloodType as string] ??
        (raw.bloodType as string),
      emergencyNotes: raw.emergencyNotes as string | null,
      allergies: allergies.map((a) => ({
        id: a.id as string,
        name: a.name as string,
        severity: a.severity as string,
        observations: a.observations as string | null,
      })),
    };
  }

  async findByStudentId(
    studentId: string,
  ): Promise<StudentMedicalInformationRecord | null> {
    await this.verifyStudentExists(studentId);

    const record = await this.prisma.studentMedicalInformation.findUnique({
      where: { studentId },
      include: { allergies: true },
    });

    if (!record) return null;

    return this.toRecord(record as unknown as Record<string, unknown>);
  }

  async upsert(
    studentId: string,
    dto: UpsertMedicalInformationDto,
  ): Promise<StudentMedicalInformationRecord> {
    await this.verifyStudentExists(studentId);

    const bloodType =
      BLOOD_TYPE_MAP[dto.bloodType] ?? (dto.bloodType as BloodType);
    const allergiesData = (dto.allergies ?? []).map((a) => ({
      name: a.name,
      severity: SEVERITY_MAP[a.severity] ?? (a.severity as AllergySeverity),
      observations: a.observations ?? null,
    }));

    const existing = await this.prisma.studentMedicalInformation.findUnique({
      where: { studentId },
    });

    if (existing) {
      // Delete all existing allergies and re-create (full sync)
      await this.prisma.studentAllergy.deleteMany({
        where: { medicalInformationId: existing.id },
      });

      const updated = await this.prisma.studentMedicalInformation.update({
        where: { id: existing.id },
        data: {
          bloodType,
          emergencyNotes: dto.emergencyNotes ?? null,
          allergies: { create: allergiesData },
        },
        include: { allergies: true },
      });

      return this.toRecord(updated as unknown as Record<string, unknown>);
    }

    // Create new
    const created = await this.prisma.studentMedicalInformation.create({
      data: {
        studentId,
        bloodType,
        emergencyNotes: dto.emergencyNotes ?? null,
        allergies: { create: allergiesData },
      },
      include: { allergies: true },
    });

    return this.toRecord(created as unknown as Record<string, unknown>);
  }
}
