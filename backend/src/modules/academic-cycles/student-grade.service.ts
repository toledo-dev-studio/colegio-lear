import { PrismaClient } from "../../generated/prisma/client";
import { NotFoundError } from "../../shared/errors/app-error";
import type { StudentGradeRecord } from "./student-grade.types";

/**
 * Business logic layer for the Student Grades sub-resource.
 * Read-only for now — there is no create/update/delete endpoint anywhere in
 * the frontend yet (grades would be entered by teachers in the not-yet-built
 * "my-classes" module).
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
      throw new NotFoundError("Academic cycle enrollment not found");
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
}
