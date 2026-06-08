import { PrismaClient } from "../../generated/prisma/client";
import { NotFoundError, ConflictError } from "../../shared/errors/app-error";
import type {
  StudentGuardianRecord,
  CreateStudentGuardianDto,
  UpdateStudentGuardianDto,
} from "./student-guardian.types";

/**
 * Business logic for student guardians sub-resource.
 */
export class StudentGuardianService {
  constructor(private readonly prisma: PrismaClient) {}

  private toRecord(raw: Record<string, unknown>): StudentGuardianRecord {
    return {
      id: raw.id as string,
      studentId: raw.studentId as string,
      fullName: raw.fullName as string,
      relationship: raw.relationship as string,
      phoneNumber: raw.phoneNumber as string,
      email: raw.email as string,
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
      throw new NotFoundError("Student not found");
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
        relationship: dto.relationship as never,
        phoneNumber: dto.phoneNumber,
        email: dto.email,
        isPrincipal: dto.isPrincipal ?? false,
        emergencyContact: dto.emergencyContact ?? false,
        authorizedToPickUp: dto.authorizedToPickUp ?? false,
        observations: dto.observations ?? null,
      },
    });

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
      throw new NotFoundError("Guardian not found");
    }

    // If setting isPrincipal, unset others
    if (dto.isPrincipal) {
      await this.prisma.studentGuardian.updateMany({
        where: { studentId, isPrincipal: true, id: { not: id } },
        data: { isPrincipal: false },
      });
    }

    const updateData: Record<string, unknown> = {};
    if (dto.fullName !== undefined) updateData.fullName = dto.fullName;
    if (dto.relationship !== undefined)
      updateData.relationship = dto.relationship;
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

    return this.toRecord(updated as unknown as Record<string, unknown>);
  }

  async delete(studentId: string, id: string): Promise<void> {
    await this.verifyStudentExists(studentId);

    const existing = await this.prisma.studentGuardian.findUnique({
      where: { id },
    });
    if (!existing || existing.studentId !== studentId) {
      throw new NotFoundError("Guardian not found");
    }

    await this.prisma.studentGuardian.delete({ where: { id } });
  }
}
