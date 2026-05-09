import { prisma } from "../../shared/lib/prisma";
import { NotFoundError, ConflictError } from "../../shared/errors/app-error";
import {
  PaginationParams,
  calculateSkip,
} from "../../shared/helpers/pagination.helper";
import {
  CreateProfileInput,
  UpdateProfileInput,
  ProfileResponse,
  PrivilegesByModule,
} from "./profiles.types";

/** Reusable Prisma include clause for loading privileges with their module reference. */
const PRIVILEGES_INCLUDE = {
  privileges: { include: { moduleReference: true } },
} as const;

/**
 * Create a new profile.
 * Returns the created profile with an empty privileges array.
 * Prisma P2002 (duplicate name) is handled by the global error handler.
 */
export async function createProfile(
  data: CreateProfileInput,
): Promise<ProfileResponse> {
  const profile = await prisma.profile.create({
    data: {
      name: data.name,
      description: data.description,
    },
    include: PRIVILEGES_INCLUDE,
  });

  return profile;
}

/**
 * Retrieve a paginated list of profiles with their associated privileges.
 * Uses $transaction for consistent count + findMany.
 */
export async function getProfiles(
  params: PaginationParams,
): Promise<{ data: ProfileResponse[]; total: number }> {
  const skip = calculateSkip(params);

  const [data, total] = await prisma.$transaction([
    prisma.profile.findMany({
      skip,
      take: params.limit,
      include: PRIVILEGES_INCLUDE,
    }),
    prisma.profile.count(),
  ]);

  return { data, total };
}

/**
 * Retrieve a single profile by ID with its privileges.
 * Throws NotFoundError if the profile does not exist.
 */
export async function getProfileById(id: number): Promise<ProfileResponse> {
  const profile = await prisma.profile.findUnique({
    where: { id },
    include: PRIVILEGES_INCLUDE,
  });

  if (!profile) {
    throw new NotFoundError("Profile not found");
  }

  return profile;
}

/**
 * Update an existing profile.
 * Returns the updated profile with privileges included.
 * Prisma P2002 (duplicate name) and P2025 (not found) are handled by the global error handler.
 */
export async function updateProfile(
  id: number,
  data: UpdateProfileInput,
): Promise<ProfileResponse> {
  const profile = await prisma.profile.update({
    where: { id },
    data: {
      name: data.name,
      description: data.description,
    },
    include: PRIVILEGES_INCLUDE,
  });

  return profile;
}

/**
 * Delete a profile by ID.
 * Checks if the profile is assigned to any employees first.
 * Throws ConflictError if employees are using this profile.
 * Cascade delete removes associated privileges automatically (onDelete: Cascade in schema).
 */
export async function deleteProfile(id: number): Promise<void> {
  const employeeCount = await prisma.employee.count({
    where: { profileId: id },
  });

  if (employeeCount > 0) {
    throw new ConflictError(
      "Profile is assigned to employees and cannot be deleted",
    );
  }

  await prisma.profile.delete({ where: { id } });
}

/**
 * Assign a privilege (module + action) to a profile.
 * Looks up the module reference by name and the profile by ID.
 * Throws NotFoundError if either does not exist.
 * Prisma P2002 (duplicate privilege) is handled by the global error handler.
 */
export async function assignPrivilege(
  profileId: number,
  moduleRef: string,
  action: string,
): Promise<void> {
  const moduleReference = await prisma.moduleReference.findUnique({
    where: { name: moduleRef },
  });

  if (!moduleReference) {
    throw new NotFoundError(`Module reference "${moduleRef}" not found`);
  }

  const profile = await prisma.profile.findUnique({
    where: { id: profileId },
  });

  if (!profile) {
    throw new NotFoundError("Profile not found");
  }

  await prisma.privilege.create({
    data: {
      profileId,
      moduleReferenceId: moduleReference.id,
      action,
    },
  });
}

/**
 * Remove a privilege (module + action) from a profile.
 * Looks up the module reference by name.
 * Uses deleteMany so no error is thrown if the privilege does not exist.
 */
export async function removePrivilege(
  profileId: number,
  moduleRef: string,
  action: string,
): Promise<void> {
  const moduleReference = await prisma.moduleReference.findUnique({
    where: { name: moduleRef },
  });

  if (!moduleReference) {
    throw new NotFoundError(`Module reference "${moduleRef}" not found`);
  }

  await prisma.privilege.deleteMany({
    where: {
      profileId,
      moduleReferenceId: moduleReference.id,
      action,
    },
  });
}

/**
 * Get all privileges for a profile, grouped by module reference name.
 * Returns an object where keys are module names and values are arrays of action strings.
 * Throws NotFoundError if the profile does not exist.
 */
export async function getPrivilegesByProfile(
  profileId: number,
): Promise<PrivilegesByModule> {
  const profile = await prisma.profile.findUnique({
    where: { id: profileId },
  });

  if (!profile) {
    throw new NotFoundError("Profile not found");
  }

  const privileges = await prisma.privilege.findMany({
    where: { profileId },
    include: { moduleReference: true },
  });

  const grouped: PrivilegesByModule = {};

  for (const privilege of privileges) {
    const moduleName = privilege.moduleReference.name;
    if (!grouped[moduleName]) {
      grouped[moduleName] = [];
    }
    grouped[moduleName].push(privilege.action);
  }

  return grouped;
}
