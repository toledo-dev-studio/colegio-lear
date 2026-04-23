import { prisma } from "../../shared/lib/prisma";
import { NotFoundError } from "../../shared/errors/app-error";
import {
  PaginationParams,
  calculateSkip,
} from "../../shared/helpers/pagination.helper";
import {
  CreateGroupInput,
  UpdateGroupInput,
  GroupResponse,
  GroupDetailResponse,
} from "./groups.types";

/**
 * Create a new group record.
 * Verifies that the referenced grade exists before creating.
 * Returns the created record with all fields.
 */
export async function createGroup(
  data: CreateGroupInput,
): Promise<GroupResponse> {
  const grade = await prisma.grade.findUnique({
    where: { id: data.gradeId },
  });

  if (!grade) {
    throw new NotFoundError("Grade not found");
  }

  const group = await prisma.group.create({
    data: {
      name: data.name,
      gradeId: data.gradeId,
    },
  });

  return group;
}

/**
 * Retrieve a paginated list of groups.
 * Optionally filtered by gradeId.
 * Uses $transaction for consistent data + count.
 * Returns data array and total count.
 */
export async function getGroups(
  params: PaginationParams,
  gradeId?: number,
): Promise<{ data: GroupResponse[]; total: number }> {
  const skip = calculateSkip(params);

  const where = gradeId !== undefined ? { gradeId } : {};

  const [data, total] = await prisma.$transaction([
    prisma.group.findMany({
      where,
      skip,
      take: params.limit,
    }),
    prisma.group.count({ where }),
  ]);

  return { data, total };
}

/**
 * Retrieve a single group by ID.
 * Includes the parent grade and its education level.
 * Throws NotFoundError if the group does not exist.
 */
export async function getGroupById(id: number): Promise<GroupDetailResponse> {
  const group = await prisma.group.findUnique({
    where: { id },
    include: {
      grade: {
        select: {
          id: true,
          name: true,
          educationLevel: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  });

  if (!group) {
    throw new NotFoundError("Group not found");
  }

  return group;
}

/**
 * Update an existing group record.
 * Only updates the fields provided in the input.
 * Prisma throws P2025 if the group is not found (handled by global error handler).
 * Returns the updated record.
 */
export async function updateGroup(
  id: number,
  data: UpdateGroupInput,
): Promise<GroupResponse> {
  const updateData: Record<string, unknown> = {};

  if (data.name !== undefined) {
    updateData.name = data.name;
  }

  const group = await prisma.group.update({
    where: { id },
    data: updateData,
  });

  return group;
}

/**
 * Deactivate a group by setting isActive to false.
 * Returns the updated record.
 * Prisma throws P2025 if the group is not found (handled by global error handler).
 */
export async function deactivateGroup(id: number): Promise<GroupResponse> {
  const group = await prisma.group.update({
    where: { id },
    data: { isActive: false },
  });

  return group;
}
