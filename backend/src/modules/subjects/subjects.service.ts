import { prisma } from "../../shared/lib/prisma";
import { NotFoundError } from "../../shared/errors/app-error";
import {
  PaginationParams,
  calculateSkip,
} from "../../shared/helpers/pagination.helper";
import {
  CreateSubjectInput,
  UpdateSubjectInput,
  SubjectResponse,
  GradeSubjectResponse,
} from "./subjects.types";

/**
 * Create a new subject record.
 * Builds the data object conditionally to satisfy exactOptionalPropertyTypes.
 * Returns the created record with all fields.
 */
export async function createSubject(
  data: CreateSubjectInput,
): Promise<SubjectResponse> {
  const subject = await prisma.subject.create({
    data: {
      name: data.name,
      ...(data.description !== undefined && {
        description: data.description,
      }),
    },
  });

  return subject;
}

/**
 * Retrieve a paginated list of subjects.
 * Optionally filters by name using case-insensitive contains matching.
 * Uses $transaction for consistent data + count.
 * Returns data array and total count.
 */
export async function getSubjects(
  params: PaginationParams,
  search?: string,
): Promise<{ data: SubjectResponse[]; total: number }> {
  const skip = calculateSkip(params);

  const where = search
    ? { name: { contains: search, mode: "insensitive" as const } }
    : {};

  const [data, total] = await prisma.$transaction([
    prisma.subject.findMany({
      where,
      skip,
      take: params.limit,
    }),
    prisma.subject.count({ where }),
  ]);

  return { data, total };
}

/**
 * Retrieve a single subject by ID.
 * Throws NotFoundError if the subject does not exist.
 */
export async function getSubjectById(id: number): Promise<SubjectResponse> {
  const subject = await prisma.subject.findUnique({
    where: { id },
  });

  if (!subject) {
    throw new NotFoundError("Subject not found");
  }

  return subject;
}

/**
 * Update an existing subject record.
 * Only updates the fields provided in the input.
 * Prisma throws P2025 if the subject is not found (handled by global error handler).
 * Returns the updated record.
 */
export async function updateSubject(
  id: number,
  data: UpdateSubjectInput,
): Promise<SubjectResponse> {
  const updateData: Record<string, unknown> = {};

  if (data.name !== undefined) {
    updateData.name = data.name;
  }
  if (data.description !== undefined) {
    updateData.description = data.description;
  }

  const subject = await prisma.subject.update({
    where: { id },
    data: updateData,
  });

  return subject;
}

/**
 * Deactivate a subject by setting isActive to false.
 * Returns the updated record.
 * Prisma throws P2025 if the subject is not found (handled by global error handler).
 */
export async function deactivateSubject(id: number): Promise<SubjectResponse> {
  const subject = await prisma.subject.update({
    where: { id },
    data: { isActive: false },
  });

  return subject;
}

/**
 * Assign a subject to a grade.
 * Verifies that both the grade and subject exist before creating the assignment.
 * Throws NotFoundError if either entity is not found.
 * Returns the created grade-subject assignment.
 */
export async function assignSubjectToGrade(
  gradeId: number,
  subjectId: number,
): Promise<GradeSubjectResponse> {
  const grade = await prisma.grade.findUnique({
    where: { id: gradeId },
  });

  if (!grade) {
    throw new NotFoundError("Grade not found");
  }

  const subject = await prisma.subject.findUnique({
    where: { id: subjectId },
  });

  if (!subject) {
    throw new NotFoundError("Subject not found");
  }

  const gradeSubject = await prisma.gradeSubject.create({
    data: {
      gradeId,
      subjectId,
    },
  });

  return gradeSubject;
}

/**
 * Retrieve a paginated list of subjects assigned to a specific grade.
 * Verifies that the grade exists before querying.
 * Includes the subject data from each grade-subject assignment.
 * Uses $transaction for consistent data + count.
 * Returns data array and total count.
 */
export async function getSubjectsByGrade(
  gradeId: number,
  params: PaginationParams,
): Promise<{ data: SubjectResponse[]; total: number }> {
  const grade = await prisma.grade.findUnique({
    where: { id: gradeId },
  });

  if (!grade) {
    throw new NotFoundError("Grade not found");
  }

  const skip = calculateSkip(params);
  const where = { gradeId };

  const [gradeSubjects, total] = await prisma.$transaction([
    prisma.gradeSubject.findMany({
      where,
      skip,
      take: params.limit,
      include: { subject: true },
    }),
    prisma.gradeSubject.count({ where }),
  ]);

  const data = gradeSubjects.map((gs) => gs.subject);

  return { data, total };
}

/**
 * Remove a subject assignment from a grade.
 * Deletes the grade-subject record by ID.
 * Prisma throws P2025 if not found (handled by global error handler).
 */
export async function removeSubjectFromGrade(
  gradeSubjectId: number,
): Promise<void> {
  await prisma.gradeSubject.delete({
    where: { id: gradeSubjectId },
  });
}
