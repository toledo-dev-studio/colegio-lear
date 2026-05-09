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
  createEducationLevel,
  getEducationLevels,
  getEducationLevelById,
  updateEducationLevel,
  deactivateEducationLevel,
} from "./education-levels.service";

/**
 * Create a new education level.
 * Delegates to the service layer and responds with the created record.
 */
export async function create(req: Request, res: Response): Promise<void> {
  const educationLevel = await createEducationLevel(req.body);
  sendSuccess(res, educationLevel, "Education level created", 201);
}

/**
 * Retrieve a paginated list of education levels.
 * Parses pagination from query params and forwards to the service.
 */
export async function getAll(req: Request, res: Response): Promise<void> {
  const params = parsePagination(req.query);
  const { data, total } = await getEducationLevels(params);
  sendPaginatedSuccess(
    res,
    data,
    buildPaginationMeta(total, params),
    "Education levels retrieved",
  );
}

/**
 * Retrieve a single education level by ID.
 */
export async function getById(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const educationLevel = await getEducationLevelById(Number(id));
  sendSuccess(res, educationLevel, "Education level retrieved");
}

/**
 * Update an existing education level by ID.
 * Only the fields provided in the body are updated.
 */
export async function update(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const educationLevel = await updateEducationLevel(Number(id), req.body);
  sendSuccess(res, educationLevel, "Education level updated");
}

/**
 * Deactivate an education level by ID (soft delete).
 */
export async function deactivate(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const educationLevel = await deactivateEducationLevel(Number(id));
  sendSuccess(res, educationLevel, "Education level deactivated");
}
