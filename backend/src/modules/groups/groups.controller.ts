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
  createGroup,
  getGroups,
  getGroupById,
  updateGroup,
  deactivateGroup,
} from "./groups.service";

/**
 * Create a new group.
 * Delegates to the service layer and responds with the created record.
 */
export async function create(req: Request, res: Response): Promise<void> {
  const group = await createGroup(req.body);
  sendSuccess(res, group, "Group created", 201);
}

/**
 * Retrieve a paginated list of groups.
 * Parses pagination from query params and optionally filters by gradeId.
 */
export async function getAll(req: Request, res: Response): Promise<void> {
  const params = parsePagination(req.query);
  const gradeId = req.query.gradeId ? Number(req.query.gradeId) : undefined;
  const { data, total } = await getGroups(params, gradeId);
  sendPaginatedSuccess(
    res,
    data,
    buildPaginationMeta(total, params),
    "Groups retrieved",
  );
}

/**
 * Retrieve a single group by ID.
 */
export async function getById(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const group = await getGroupById(Number(id));
  sendSuccess(res, group, "Group retrieved");
}

/**
 * Update an existing group by ID.
 * Only the fields provided in the body are updated.
 */
export async function update(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const group = await updateGroup(Number(id), req.body);
  sendSuccess(res, group, "Group updated");
}

/**
 * Deactivate a group by ID (soft delete).
 */
export async function deactivate(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const group = await deactivateGroup(Number(id));
  sendSuccess(res, group, "Group deactivated");
}
