import { prisma } from "../../shared/lib/prisma";
import { NotFoundError } from "../../shared/errors/app-error";
import {
  PaginationParams,
  calculateSkip,
} from "../../shared/helpers/pagination.helper";
import {
  CreateGradeInput,
  UpdateGradeInput,
  GradeResponse,
  GradeDetailResponse,
} from "./grades.types";

/**
 * Create a new grade record.
 * Verifies that the referenced education level exists before creating.
 * Builds the data object conditionally to satisfy exactOptionalPropertyTypes.
 * Returns the created record with all fields.
 */
export async function createGrade(
  data: CreateGradeInput,
): Promise<GradeResponse> {
  const educationLevel = await prisma.educationLevel.findUnique({
    where: { id: data.educationLevelId },
  });

  if (!educationLevel) {
    throw new NotFoundError("Education level not found");
  }

  const grade = await prisma.grade.create({
    data: {
      name: data.name,
      educationLevelId: data.educationLevelId,
      ...(data.description !== undefined && {
        description: data.description,
      }),
      ...(data.order !== undefined && { order: data.order }),
    },
  });

  return grade;
}

/**
 * Retrieve a paginated list of grades.
 * Results are ordered by the `order` field ascending.
 * Optionally filtered by educationLevelId.
 * Returns data array and total count.
 */
export async function getGrades(
  params: PaginationParams,
  educationLevelId?: number,
): Promise<{ data: GradeResponse[]; total: number }> {
  const skip = calculateSkip(params);

  const where = educationLevelId !== undefined ? { educationLevelId } : {};

  const [data, total] = await prisma.$transaction([
    prisma.grade.findMany({
      where,
      skip,
      take: params.limit,
      orderBy: { order: "asc" },
    }),
    prisma.grade.count({ where }),
  ]);

  return { data, total };
}

/**
 * Retrieve a single grade by ID.
 * Includes the parent education level info and a count of associated groups.
 * Throws NotFoundError if the grade does not exist.
 */
export async function getGradeById(id: number): Promise<GradeDetailResponse> {
  const grade = await prisma.grade.findUnique({
    where: { id },
    include: {
      educationLevel: { select: { id: true, name: true } },
      _count: { select: { groups: true } },
    },
  });

  if (!grade) {
    throw new NotFoundError("Grade not found");
  }

  return grade;
}

/**
 * Update an existing grade record.
 * Only updates the fields provided in the input.
 * Prisma throws P2025 if the grade is not found (handled by global error handler).
 * Returns the updated record.
 */
export async function updateGrade(
  id: number,
  data: UpdateGradeInput,
): Promise<GradeResponse> {
  const updateData: Record<string, unknown> = {};

  if (data.name !== undefined) {
    updateData.name = data.name;
  }
  if (data.description !== undefined) {
    updateData.description = data.description;
  }
  if (data.order !== undefined) {
    updateData.order = data.order;
  }

  const grade = await prisma.grade.update({
    where: { id },
    data: updateData,
  });

  return grade;
}

/**
 * Deactivate a grade by setting isActive to false.
 * Returns the updated record.
 * Prisma throws P2025 if the grade is not found (handled by global error handler).
 */
export async function deactivateGrade(id: number): Promise<GradeResponse> {
  const grade = await prisma.grade.update({
    where: { id },
    data: { isActive: false },
  });

  return grade;
}
