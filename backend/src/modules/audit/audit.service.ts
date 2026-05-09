import { prisma } from "../../shared/lib/prisma";
import { logger } from "../../shared/lib/logger";
import {
  PaginationParams,
  calculateSkip,
} from "../../shared/helpers/pagination.helper";
import {
  AuditLogInput,
  AuditLogResponse,
  AuditLogFilters,
} from "./audit.types";

/**
 * Insert an audit log record into the database.
 * Wrapped in try-catch for fire-and-forget isolation — this function
 * NEVER throws so it cannot break the main request flow.
 */
export async function createAuditLog(entry: AuditLogInput): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        employeeId: entry.employeeId,
        action: entry.action,
        resource: entry.resource,
        resourceId: entry.resourceId ?? null,
        details:
          entry.details !== undefined ? (entry.details as object) : undefined,
      },
    });
  } catch (error) {
    logger.error("Failed to create audit log", { error, entry });
  }
}

/**
 * Retrieve a paginated list of audit logs sorted by createdAt descending.
 * Supports optional filters: employeeId, action, resource, and date range.
 * Uses $transaction for consistent count + findMany.
 */
export async function getAuditLogs(
  params: PaginationParams,
  filters?: AuditLogFilters,
): Promise<{ data: AuditLogResponse[]; total: number }> {
  const skip = calculateSkip(params);

  // Build where clause from filters
  const where: Record<string, unknown> = {};

  if (filters?.employeeId !== undefined) {
    where.employeeId = filters.employeeId;
  }
  if (filters?.action !== undefined) {
    where.action = filters.action;
  }
  if (filters?.resource !== undefined) {
    where.resource = filters.resource;
  }
  if (filters?.dateFrom !== undefined || filters?.dateTo !== undefined) {
    const createdAt: Record<string, Date> = {};
    if (filters?.dateFrom !== undefined) {
      createdAt.gte = filters.dateFrom;
    }
    if (filters?.dateTo !== undefined) {
      createdAt.lte = filters.dateTo;
    }
    where.createdAt = createdAt;
  }

  const [data, total] = await prisma.$transaction([
    prisma.auditLog.findMany({
      where,
      skip,
      take: params.limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.auditLog.count({ where }),
  ]);

  return { data, total };
}
