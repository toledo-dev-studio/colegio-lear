import { Request, Response } from "express";

import { sendPaginatedSuccess } from "../../shared/helpers/response.helper";
import {
  parsePagination,
  buildPaginationMeta,
} from "../../shared/helpers/pagination.helper";
import { getAuditLogs } from "./audit.service";
import { AuditLogFilters } from "./audit.types";

/**
 * Retrieve a paginated list of audit logs with optional filters.
 * Parses pagination and filter params from the validated query string.
 */
export async function getAll(req: Request, res: Response): Promise<void> {
  const params = parsePagination(req.query);

  const filters: AuditLogFilters = {};

  if (req.query.employeeId !== undefined) {
    filters.employeeId = Number(req.query.employeeId);
  }
  if (req.query.action !== undefined) {
    filters.action = req.query.action as string;
  }
  if (req.query.resource !== undefined) {
    filters.resource = req.query.resource as string;
  }
  if (req.query.dateFrom !== undefined) {
    filters.dateFrom = new Date(req.query.dateFrom as string);
  }
  if (req.query.dateTo !== undefined) {
    filters.dateTo = new Date(req.query.dateTo as string);
  }

  const { data, total } = await getAuditLogs(params, filters);

  sendPaginatedSuccess(
    res,
    data,
    buildPaginationMeta(total, params),
    "Audit logs retrieved",
  );
}
