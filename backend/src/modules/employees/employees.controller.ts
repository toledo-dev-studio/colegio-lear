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
  createEmployee,
  getEmployees,
  getEmployeeById,
  updateEmployee,
  deactivateEmployee,
} from "./employees.service";

/**
 * Create a new employee.
 * Delegates to the service layer and responds with the created record.
 */
export async function create(req: Request, res: Response): Promise<void> {
  const employee = await createEmployee(req.body);
  sendSuccess(res, employee, "Employee created", 201);
}

/**
 * Retrieve a paginated list of employees with optional search.
 * Parses pagination from query params and forwards search term to the service.
 */
export async function getAll(req: Request, res: Response): Promise<void> {
  const params = parsePagination(req.query);
  const search = req.query.search as string | undefined;
  const { data, total } = await getEmployees(params, search);
  sendPaginatedSuccess(
    res,
    data,
    buildPaginationMeta(total, params),
    "Employees retrieved",
  );
}

/**
 * Retrieve a single employee by ID.
 */
export async function getById(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const employee = await getEmployeeById(Number(id));
  sendSuccess(res, employee, "Employee retrieved");
}

/**
 * Update an existing employee by ID.
 * Only the fields provided in the body are updated.
 */
export async function update(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const employee = await updateEmployee(Number(id), req.body);
  sendSuccess(res, employee, "Employee updated");
}

/**
 * Deactivate an employee by ID (soft delete).
 */
export async function deactivate(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const employee = await deactivateEmployee(Number(id));
  sendSuccess(res, employee, "Employee deactivated");
}
