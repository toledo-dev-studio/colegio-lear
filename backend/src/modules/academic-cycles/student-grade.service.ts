import { PrismaClient } from "../../generated/prisma/client";
import { NotFoundError } from "../../shared/errors/app-error";
import type { StudentGradeRecord } from "./student-grade.types";

const SCHOOL_SUBJECT_SELECT = {
  select: { id: true, name: true, description: true },
} as const;

/**
 * Business logic layer for the Student Grades sub-resource. findAllByEnrollmentId
 * is the read-only path used by the employee and student portals; the
 * group-scoped read plus upsert/remove below are the teacher-facing
 * ("my classes") write path — there was no create/update/delete endpoint
 * anywhere before this module.
 */
export class StudentGradeService {
  constructor(private readonly prisma: PrismaClient) {}

  private toRecord(raw: {
    id: string;
    grade: unknown;
    evaluationNumber: number;
    schoolSubjectId: string;
    schoolSubject: { id: string; name: string; description: string | null };
    academicCycleEnrollmentId: string;
  }): StudentGradeRecord {
    return {
      id: raw.id,
      grade: Number(raw.grade),
      evaluationNumber: raw.evaluationNumber,
      schoolSubjectId: raw.schoolSubjectId,
      schoolSubject: raw.schoolSubject,
      academicCycleEnrollmentId: raw.academicCycleEnrollmentId,
    };
  }

  /** GET all grades for an enrollment */
  async findAllByEnrollmentId(
    academicCycleId: string,
    academicCycleEnrollmentId: string,
  ): Promise<StudentGradeRecord[]> {
    const enrollment = await this.prisma.academicCycleEnrollment.findFirst({
      where: { id: academicCycleEnrollmentId, academicCycleId },
    });
    if (!enrollment) {
      throw new NotFoundError("Inscripción al ciclo escolar no encontrada");
    }

    const results = await this.prisma.studentGrade.findMany({
      where: { academicCycleEnrollmentId },
      include: {
        schoolSubject: { select: { id: true, name: true, description: true } },
      },
      orderBy: [{ schoolSubjectId: "asc" }, { evaluationNumber: "asc" }],
    });

    return results.map((r) => this.toRecord(r));
  }

  /**
   * GET all grades for a subject across every enrollment in a group — the
   * teacher-facing ("my classes") equivalent of findAllByEnrollmentId, one
   * row per (enrollment, evaluation) pair instead of scoped to a single
   * enrollment. schoolSubjectId here is the plain school subject id (the
   * column StudentGrade actually stores), not the cycle's join-table id.
   */
  async findAllByGroupAndSubject(
    academicCycleSchoolGroupId: string,
    schoolSubjectId: string,
  ): Promise<StudentGradeRecord[]> {
    const results = await this.prisma.studentGrade.findMany({
      where: {
        schoolSubjectId,
        academicCycleEnrollment: { academicCycleSchoolGroupId },
      },
      include: { schoolSubject: SCHOOL_SUBJECT_SELECT },
      orderBy: [{ academicCycleEnrollmentId: "asc" }, { evaluationNumber: "asc" }],
    });

    return results.map((r) => this.toRecord(r));
  }

  /** Verifies the enrollment belongs to this group before any write against it. */
  private async ensureEnrollmentInGroup(
    academicCycleEnrollmentId: string,
    academicCycleSchoolGroupId: string,
  ): Promise<void> {
    const enrollment = await this.prisma.academicCycleEnrollment.findFirst({
      where: { id: academicCycleEnrollmentId, academicCycleSchoolGroupId },
    });
    if (!enrollment) {
      throw new NotFoundError("Inscripción al ciclo escolar no encontrada en esta clase");
    }
  }

  /**
   * Idempotent upsert keyed on the same (academicCycleEnrollmentId,
   * schoolSubjectId, evaluationNumber) unique constraint the table already
   * enforces — the frontend never knows a grade's id when saving.
   */
  async upsert(
    academicCycleSchoolGroupId: string,
    schoolSubjectId: string,
    dto: { academicCycleEnrollmentId: string; evaluationNumber: number; grade: number },
  ): Promise<StudentGradeRecord> {
    await this.ensureEnrollmentInGroup(dto.academicCycleEnrollmentId, academicCycleSchoolGroupId);

    const upserted = await this.prisma.studentGrade.upsert({
      where: {
        academicCycleEnrollmentId_schoolSubjectId_evaluationNumber: {
          academicCycleEnrollmentId: dto.academicCycleEnrollmentId,
          schoolSubjectId,
          evaluationNumber: dto.evaluationNumber,
        },
      },
      create: {
        academicCycleEnrollmentId: dto.academicCycleEnrollmentId,
        schoolSubjectId,
        evaluationNumber: dto.evaluationNumber,
        grade: dto.grade,
      },
      update: { grade: dto.grade },
      include: { schoolSubject: SCHOOL_SUBJECT_SELECT },
    });

    return this.toRecord(upserted);
  }

  /** Deletes a grade — 404 if it doesn't exist or isn't in this group. */
  async remove(academicCycleSchoolGroupId: string, id: string): Promise<void> {
    const grade = await this.prisma.studentGrade.findFirst({
      where: { id, academicCycleEnrollment: { academicCycleSchoolGroupId } },
    });
    if (!grade) {
      throw new NotFoundError("Calificación no encontrada");
    }

    await this.prisma.studentGrade.delete({ where: { id } });
  }
}
