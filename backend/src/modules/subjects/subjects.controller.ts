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
  createSubject,
  getSubjects,
  getSubjectById,
  updateSubject,
  deactivateSubject,
  assignSubjectToGrade,
  getSubjectsByGrade,
  removeSubjectFromGrade,
} from "./subjects.service";

/**
 * Create a new subject.
 * Delegates to the service layer and responds with the created record.
 */
export async function create(req: Request, res: Response): Promise<void> {
  const result = await createSubject(req.body);
  sendSuccess(res, result, "Subject created", 201);
}

/**
 * Retrieve a paginated list of subjects.
 * Parses pagination from query params and optionally filters by search term.
 */
export async function getAll(req: Request, res: Response): Promise<void> {
  const params = parsePagination(req.query);
  const search = req.query.search as string | undefined;
  const { data, total } = await getSubjects(params, search);
  sendPaginatedSuccess(
    res,
    data,
    buildPaginationMeta(total, params),
    "Subjects retrieved",
  );
}

/**
 * Retrieve a single subject by ID.
 */
export async function getById(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const result = await getSubjectById(Number(id));
  sendSuccess(res, result, "Subject retrieved");
}

/**
 * Update an existing subject by ID.
 * Only the fields provided in the body are updated.
 */
export async function update(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const result = await updateSubject(Number(id), req.body);
  sendSuccess(res, result, "Subject updated");
}

/**
 * Deactivate a subject by ID (soft delete).
 */
export async function deactivate(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const result = await deactivateSubject(Number(id));
  sendSuccess(res, result, "Subject deactivated");
}

/**
 * Assign a subject to a grade.
 * Expects gradeId from route params and subjectId from request body.
 */
export async function assignToGrade(
  req: Request,
  res: Response,
): Promise<void> {
  const { gradeId } = req.params;
  const { subjectId } = req.body;
  const result = await assignSubjectToGrade(Number(gradeId), subjectId);
  sendSuccess(res, result, "Subject assigned to grade", 201);
}

/**
 * Retrieve a paginated list of subjects assigned to a specific grade.
 */
export async function getByGrade(req: Request, res: Response): Promise<void> {
  const { gradeId } = req.params;
  const params = parsePagination(req.query);
  const { data, total } = await getSubjectsByGrade(Number(gradeId), params);
  sendPaginatedSuccess(
    res,
    data,
    buildPaginationMeta(total, params),
    "Subjects retrieved",
  );
}

/**
 * Remove a subject assignment from a grade.
 * Deletes the grade-subject record by ID.
 */
export async function removeFromGrade(
  req: Request,
  res: Response,
): Promise<void> {
  const { id } = req.params;
  await removeSubjectFromGrade(Number(id));
  sendSuccess(res, null, "Subject removed from grade");
}
