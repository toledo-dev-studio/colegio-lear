import { prisma } from "../../shared/lib/prisma";
import { NotFoundError } from "../../shared/errors/app-error";
import {
  PaginationParams,
  calculateSkip,
} from "../../shared/helpers/pagination.helper";
import {
  CreateEducationLevelInput,
  UpdateEducationLevelInput,
  EducationLevelResponse,
  EducationLevelDetailResponse,
} from "./education-levels.types";

/**
 * Create a new education level record.
 * Builds the data object conditionally to satisfy exactOptionalPropertyTypes.
 * Returns the created record with all fields.
 */
export async function createEducationLevel(
  data: CreateEducationLevelInput,
): Promise<EducationLevelResponse> {
  const educationLevel = await prisma.educationLevel.create({
    data: {
      name: data.name,
      ...(data.description !== undefined && {
        description: data.description,
      }),
      ...(data.order !== undefined && { order: data.order }),
    },
  });

  return educationLevel;
}

/**
 * Retrieve a paginated list of education levels.
 * Results are ordered by the `order` field ascending.
 * Returns data array and total count.
 */
export async function getEducationLevels(
  params: PaginationParams,
): Promise<{ data: EducationLevelResponse[]; total: number }> {
  const skip = calculateSkip(params);

  const [data, total] = await prisma.$transaction([
    prisma.educationLevel.findMany({
      skip,
      take: params.limit,
      orderBy: { order: "asc" },
    }),
    prisma.educationLevel.count(),
  ]);

  return { data, total };
}

/**
 * Retrieve a single education level by ID.
 * Includes a count of associated grades.
 * Throws NotFoundError if the education level does not exist.
 */
export async function getEducationLevelById(
  id: number,
): Promise<EducationLevelDetailResponse> {
  const educationLevel = await prisma.educationLevel.findUnique({
    where: { id },
    include: { _count: { select: { grades: true } } },
  });

  if (!educationLevel) {
    throw new NotFoundError("Education level not found");
  }

  return educationLevel;
}

/**
 * Update an existing education level record.
 * Only updates the fields provided in the input.
 * Prisma throws P2025 if the education level is not found (handled by global error handler).
 * Returns the updated record.
 */
export async function updateEducationLevel(
  id: number,
  data: UpdateEducationLevelInput,
): Promise<EducationLevelResponse> {
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

  const educationLevel = await prisma.educationLevel.update({
    where: { id },
    data: updateData,
  });

  return educationLevel;
}

/**
 * Deactivate an education level by setting isActive to false.
 * Returns the updated record.
 * Prisma throws P2025 if the education level is not found (handled by global error handler).
 */
export async function deactivateEducationLevel(
  id: number,
): Promise<EducationLevelResponse> {
  const educationLevel = await prisma.educationLevel.update({
    where: { id },
    data: { isActive: false },
  });

  return educationLevel;
}
