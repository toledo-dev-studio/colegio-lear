import { PrismaClient } from "../../generated/prisma/client";
import { StudentGuardianType } from "../../generated/prisma/enums";
import {
  NotFoundError,
  ConflictError,
  ValidationError,
} from "../../shared/errors/app-error";
import { logger } from "../../shared/lib/logger";
import type {
  StudentGuardianRecord,
  CreateStudentGuardianDto,
  UpdateStudentGuardianDto,
} from "./student-guardian.types";

/**
 * Maps frontend/DB relationship strings ("legal-guardian") to Prisma enum
 * member names ("legal_guardian"). Most values are identical in both forms;
 * only the hyphenated ones actually need translating.
 */
const GUARDIAN_TYPE_MAP: Record<string, StudentGuardianType> = {
  father: "father",
  mother: "mother",
  grandmother: "grandmother",
  grandfather: "grandfather",
  uncle: "uncle",
  aunt: "aunt",
  brother: "brother",
  sister: "sister",
  "legal-guardian": "legal_guardian",
  "step-father": "step_father",
  "step-mother": "step_mother",
  other: "other",
};

/** Maps Prisma enum member names back to frontend/DB relationship strings */
const GUARDIAN_TYPE_REVERSE: Record<string, string> = Object.fromEntries(
  Object.entries(GUARDIAN_TYPE_MAP).map(([k, v]) => [v, k]),
);

/**
 * Business logic for student guardians sub-resource.
 */
export class StudentGuardianService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly credentialsSender?: {
      sendCredentials(studentId: string): Promise<void>;
    },
  ) {}

  /**
   * Sends the student credentials email to the principal guardian. Never
   * throws: a failure is logged and the guardian registration still succeeds.
   * Callers must have already unset any other principal, so only the
   * newly-registered principal receives the mail.
   */
  private async notifyPrincipal(
    studentId: string,
    guardianId: string,
  ): Promise<void> {
    if (!this.credentialsSender) return;
    try {
      await this.credentialsSender.sendCredentials(studentId);
    } catch (error) {
      logger.error("Failed to send student credentials email", {
        error,
        studentId,
        guardianId,
      });
    }
  }

  private toRecord(raw: Record<string, unknown>): StudentGuardianRecord {
    return {
      id: raw.id as string,
      studentId: raw.studentId as string,
      fullName: raw.fullName as string,
      relationship:
        GUARDIAN_TYPE_REVERSE[raw.relationship as string] ??
        (raw.relationship as string),
      phoneNumber: raw.phoneNumber as string | null,
      email: raw.email as string | null,
      isPrincipal: raw.isPrincipal as boolean,
      emergencyContact: raw.emergencyContact as boolean,
      authorizedToPickUp: raw.authorizedToPickUp as boolean,
      observations: raw.observations as string | null,
    };
  }

  private async verifyStudentExists(studentId: string): Promise<void> {
    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
    });
    if (!student || student.isDeleted)
      throw new NotFoundError("Alumno no encontrado");
  }

  async findAllByStudentId(
    studentId: string,
  ): Promise<StudentGuardianRecord[]> {
    await this.verifyStudentExists(studentId);
    const results = await this.prisma.studentGuardian.findMany({
      where: { studentId },
    });
    return results.map((r) =>
      this.toRecord(r as unknown as Record<string, unknown>),
    );
  }

  async create(
    studentId: string,
    dto: CreateStudentGuardianDto,
  ): Promise<StudentGuardianRecord> {
    await this.verifyStudentExists(studentId);

    // If isPrincipal, unset any existing principal
    if (dto.isPrincipal) {
      await this.prisma.studentGuardian.updateMany({
        where: { studentId, isPrincipal: true },
        data: { isPrincipal: false },
      });
    }

    const created = await this.prisma.studentGuardian.create({
      data: {
        studentId,
        fullName: dto.fullName,
        relationship:
          GUARDIAN_TYPE_MAP[dto.relationship] ??
          (dto.relationship as StudentGuardianType),
        phoneNumber: dto.phoneNumber ?? null,
        email: dto.email ?? null,
        isPrincipal: dto.isPrincipal ?? false,
        emergencyContact: dto.emergencyContact ?? false,
        authorizedToPickUp: dto.authorizedToPickUp ?? false,
        observations: dto.observations ?? null,
      },
    });

    if (created.isPrincipal && created.email) {
      await this.notifyPrincipal(studentId, created.id);
    }

    return this.toRecord(created as unknown as Record<string, unknown>);
  }

  async update(
    studentId: string,
    id: string,
    dto: UpdateStudentGuardianDto,
  ): Promise<StudentGuardianRecord> {
    await this.verifyStudentExists(studentId);

    const existing = await this.prisma.studentGuardian.findUnique({
      where: { id },
    });
    if (!existing || existing.studentId !== studentId) {
      throw new NotFoundError("Tutor no encontrado");
    }

    // If setting isPrincipal, unset others
    if (dto.isPrincipal) {
      await this.prisma.studentGuardian.updateMany({
        where: { studentId, isPrincipal: true, id: { not: id } },
        data: { isPrincipal: false },
      });
    }

    // phoneNumber/email are only required for the principal guardian. Since
    // this is a partial update, check the *resulting* record (merging the
    // patch over the existing row) rather than just the patch fields.
    const resultingIsPrincipal = dto.isPrincipal ?? existing.isPrincipal;
    const resultingPhoneNumber =
      dto.phoneNumber !== undefined ? dto.phoneNumber : existing.phoneNumber;
    const resultingEmail =
      dto.email !== undefined ? dto.email : existing.email;
    if (resultingIsPrincipal && (!resultingPhoneNumber || !resultingEmail)) {
      throw new ValidationError(
        "phoneNumber y email son requeridos cuando isPrincipal es true",
        [
          {
            field: !resultingPhoneNumber ? "phoneNumber" : "email",
            message: "Requerido cuando isPrincipal es true",
          },
        ],
      );
    }

    const updateData: Record<string, unknown> = {};
    if (dto.fullName !== undefined) updateData.fullName = dto.fullName;
    if (dto.relationship !== undefined)
      updateData.relationship =
        GUARDIAN_TYPE_MAP[dto.relationship] ??
        (dto.relationship as StudentGuardianType);
    if (dto.phoneNumber !== undefined) updateData.phoneNumber = dto.phoneNumber;
    if (dto.email !== undefined) updateData.email = dto.email;
    if (dto.isPrincipal !== undefined) updateData.isPrincipal = dto.isPrincipal;
    if (dto.emergencyContact !== undefined)
      updateData.emergencyContact = dto.emergencyContact;
    if (dto.authorizedToPickUp !== undefined)
      updateData.authorizedToPickUp = dto.authorizedToPickUp;
    if (dto.observations !== undefined)
      updateData.observations = dto.observations;

    const updated = await this.prisma.studentGuardian.update({
      where: { id },
      data: updateData,
    });

    // Only when this guardian just became principal or its email changed
    // while principal; unrelated edits do not regenerate the password.
    if (
      updated.isPrincipal &&
      updated.email &&
      (!existing.isPrincipal || existing.email !== updated.email)
    ) {
      await this.notifyPrincipal(studentId, id);
    }

    return this.toRecord(updated as unknown as Record<string, unknown>);
  }

  async delete(studentId: string, id: string): Promise<void> {
    await this.verifyStudentExists(studentId);

    const existing = await this.prisma.studentGuardian.findUnique({
      where: { id },
    });
    if (!existing || existing.studentId !== studentId) {
      throw new NotFoundError("Tutor no encontrado");
    }

    await this.prisma.studentGuardian.delete({ where: { id } });
  }
}
