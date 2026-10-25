import { PrismaClient } from "../../generated/prisma/client";
import { AllergySeverity } from "../../generated/prisma/enums";
import { NotFoundError } from "../../shared/errors/app-error";
import type {
  AllergyRecord,
  CreateAllergyDto,
  UpdateAllergyDto,
} from "./student-allergy.types";

/**
 * Business logic for the student allergies sub-resource.
 * Each allergy is its own record (create/update/delete one at a time),
 * scoped to a student via studentId — no bulk array sync involved.
 */
export class StudentAllergyService {
  constructor(private readonly prisma: PrismaClient) {}

  private toRecord(raw: Record<string, unknown>): AllergyRecord {
    return {
      id: raw.id as string,
      studentId: raw.studentId as string,
      name: raw.name as string,
      severity: raw.severity as string,
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

  async findAllByStudentId(studentId: string): Promise<AllergyRecord[]> {
    await this.verifyStudentExists(studentId);
    const results = await this.prisma.studentAllergy.findMany({
      where: { studentId },
    });
    return results.map((r) =>
      this.toRecord(r as unknown as Record<string, unknown>),
    );
  }

  async create(
    studentId: string,
    dto: CreateAllergyDto,
  ): Promise<AllergyRecord> {
    await this.verifyStudentExists(studentId);

    const created = await this.prisma.studentAllergy.create({
      data: {
        studentId,
        name: dto.name,
        severity: dto.severity as AllergySeverity,
        observations: dto.observations ?? null,
      },
    });

    return this.toRecord(created as unknown as Record<string, unknown>);
  }

  async update(
    studentId: string,
    id: string,
    dto: UpdateAllergyDto,
  ): Promise<AllergyRecord> {
    await this.verifyStudentExists(studentId);

    const existing = await this.prisma.studentAllergy.findUnique({
      where: { id },
    });
    if (!existing || existing.studentId !== studentId) {
      throw new NotFoundError("Alergia no encontrada");
    }

    const updateData: Record<string, unknown> = {};
    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.severity !== undefined)
      updateData.severity = dto.severity as AllergySeverity;
    if (dto.observations !== undefined)
      updateData.observations = dto.observations;

    const updated = await this.prisma.studentAllergy.update({
      where: { id },
      data: updateData,
    });

    return this.toRecord(updated as unknown as Record<string, unknown>);
  }

  async delete(studentId: string, id: string): Promise<void> {
    await this.verifyStudentExists(studentId);

    const existing = await this.prisma.studentAllergy.findUnique({
      where: { id },
    });
    if (!existing || existing.studentId !== studentId) {
      throw new NotFoundError("Alergia no encontrada");
    }

    await this.prisma.studentAllergy.delete({ where: { id } });
  }
}
