/**
 * TypeScript interfaces for the audit module.
 * These types define the shape of data flowing through the audit service layer.
 */

/** Input for creating a new audit log entry */
export interface AuditLogInput {
  employeeId: number;
  action: string;
  resource: string;
  resourceId?: string;
  details?: unknown;
}

/** Audit log data returned by the API */
export interface AuditLogResponse {
  id: number;
  employeeId: number;
  action: string;
  resource: string;
  resourceId: string | null;
  details: unknown;
  createdAt: Date;
}

/** Optional filters for querying audit logs */
export interface AuditLogFilters {
  employeeId?: number;
  action?: string;
  resource?: string;
  dateFrom?: Date;
  dateTo?: Date;
}
