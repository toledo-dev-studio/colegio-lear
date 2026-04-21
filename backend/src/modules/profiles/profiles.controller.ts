import { Request, Response } from "express";

import {
  sendSuccess,
  sendPaginatedSuccess,
} from "../../shared/helpers/response.helper";
import {
  parsePagination,
  buildPaginationMeta,
} from "../../shared/helpers/pagination.helper";
import {
  createProfile,
  getProfiles,
  getProfileById,
  updateProfile,
  deleteProfile,
  assignPrivilege,
  removePrivilege,
  getPrivilegesByProfile,
} from "./profiles.service";

/**
 * Create a new profile.
 * Delegates to the service layer and responds with the created record.
 */
export async function create(req: Request, res: Response): Promise<void> {
  const profile = await createProfile(req.body);
  sendSuccess(res, profile, "Profile created", 201);
}

/**
 * Retrieve a paginated list of profiles with their associated privileges.
 */
export async function getAll(req: Request, res: Response): Promise<void> {
  const params = parsePagination(req.query);
  const { data, total } = await getProfiles(params);
  sendPaginatedSuccess(
    res,
    data,
    buildPaginationMeta(total, params),
    "Profiles retrieved",
  );
}

/**
 * Retrieve a single profile by ID.
 */
export async function getById(req: Request, res: Response): Promise<void> {
  const profile = await getProfileById(Number(req.params.id));
  sendSuccess(res, profile, "Profile retrieved");
}

/**
 * Update an existing profile by ID.
 */
export async function update(req: Request, res: Response): Promise<void> {
  const profile = await updateProfile(Number(req.params.id), req.body);
  sendSuccess(res, profile, "Profile updated");
}

/**
 * Delete a profile by ID.
 */
export async function remove(req: Request, res: Response): Promise<void> {
  await deleteProfile(Number(req.params.id));
  sendSuccess(res, null, "Profile deleted");
}

/**
 * Assign a privilege (module + action) to a profile.
 */
export async function assignPrivilegeHandler(
  req: Request,
  res: Response,
): Promise<void> {
  await assignPrivilege(
    Number(req.params.id),
    req.body.moduleRef,
    req.body.action,
  );
  sendSuccess(res, null, "Privilege assigned");
}

/**
 * Remove a privilege (module + action) from a profile.
 */
export async function removePrivilegeHandler(
  req: Request,
  res: Response,
): Promise<void> {
  await removePrivilege(
    Number(req.params.id),
    req.body.moduleRef,
    req.body.action,
  );
  sendSuccess(res, null, "Privilege removed");
}

/**
 * Get all privileges for a profile, grouped by module.
 */
export async function getPrivileges(
  req: Request,
  res: Response,
): Promise<void> {
  const privileges = await getPrivilegesByProfile(Number(req.params.id));
  sendSuccess(res, privileges, "Privileges retrieved");
}
