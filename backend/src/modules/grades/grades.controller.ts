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
  createGrade,
  getGrades,
  getGradeById,
  updateGrade,
  deactivateGrade,
} from "./grades.service";

/**
 * Create a new grade.
 * Delegates to the service layer and responds with the created record.
 */
export async function create(req: Request, res: Response): Promise<void> {
  const grade = await createGrade(req.body);
  sendSuccess(res, grade, "Grade created", 201);
}

/**
 * Retrieve a paginated list of grades.
 * Parses pagination from query params and optionally filters by educationLevelId.
 */
export async function getAll(req: Request, res: Response): Promise<void> {
  const params = parsePagination(req.query);
  const educationLevelId = req.query.educationLevelId
    ? Number(req.query.educationLevelId)
    : undefined;
  const { data, total } = await getGrades(params, educationLevelId);
  sendPaginatedSuccess(
    res,
    data,
    buildPaginationMeta(total, params),
    "Grades retrieved",
  );
}

/**
 * Retrieve a single grade by ID.
 */
export async function getById(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const grade = await getGradeById(Number(id));
  sendSuccess(res, grade, "Grade retrieved");
}

/**
 * Update an existing grade by ID.
 * Only the fields provided in the body are updated.
 */
export async function update(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const grade = await updateGrade(Number(id), req.body);
  sendSuccess(res, grade, "Grade updated");
}

/**
 * Deactivate a grade by ID (soft delete).
 */
export async function deactivate(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const grade = await deactivateGrade(Number(id));
  sendSuccess(res, grade, "Grade deactivated");
}
