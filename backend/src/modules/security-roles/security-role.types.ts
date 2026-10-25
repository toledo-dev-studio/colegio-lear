/**
 * Valid module key values — identifies each module in the system.
 * Stored as VarChar in the database, validated with Zod enum at the schema layer.
 */
export type ModuleKey =
  | "dashboard"
  | "my-account"
  | "my-classes"
  | "students"
  | "academic-cycles"
  | "announcements"
  | "academic-levels"
  | "school-subjects"
  | "scholarships"
  | "payment-concepts"
  | "employees"
  | "job-titles"
  | "security-roles"
  | "settings";

/** Filters applicable to security roles list endpoints */
export interface SecurityRoleFilters {
  q?: string;
  name?: string;
  isActive?: boolean;
}

/** Row returned from list endpoints (no permissions included) */
export interface SecurityRoleRecord {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
}

/** Permission object as returned in responses (excludes id and securityRoleId) */
export interface SecurityRolePermissionView {
  moduleKey: ModuleKey;
  canRead: boolean;
  canWrite: boolean;
  canDelete: boolean;
}

/** Detail response for findById and write operations (includes permissions) */
export interface SecurityRoleDetail {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  permissions: SecurityRolePermissionView[];
}

/** Input DTO for a single permission entry */
export interface SecurityRolePermissionInput {
  moduleKey: ModuleKey;
  canRead: boolean;
  canWrite: boolean;
  canDelete: boolean;
}

/** Input DTO for creating a security role */
export interface CreateSecurityRoleDto {
  name: string;
  description?: string;
  isActive?: boolean;
  permissions?: SecurityRolePermissionInput[];
}

/** Input DTO for updating a security role (all fields optional) */
export interface UpdateSecurityRoleDto {
  name?: string;
  description?: string;
  isActive?: boolean;
  permissions?: SecurityRolePermissionInput[];
}

/** Result of a paginated query */
export interface PagedResult<T> {
  data: T[];
  totalPages: number;
  currentPage: number;
  itemsCount: number;
}
