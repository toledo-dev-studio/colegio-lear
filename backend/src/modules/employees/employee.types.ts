/** Filters applicable to employee list endpoints */
export interface EmployeeFilters {
  q?: string;
  fullName?: string;
  isActive?: boolean;
  securityRoleId?: string;
  jobTitleId?: string;
}

/** Nested JobTitle in employee responses */
export interface EmployeeJobTitle {
  id: string;
  name: string;
  description: string | null;
  jobTitleType: string;
  isActive: boolean;
}

/** Nested SecurityRole in list responses (no permissions) */
export interface EmployeeSecurityRoleBasic {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
}

/** Permission view for security role detail */
export interface SecurityRolePermissionView {
  moduleKey: string;
  canRead: boolean;
  canWrite: boolean;
  canDelete: boolean;
}

/** Nested SecurityRole in detail response (with permissions) */
export interface EmployeeSecurityRoleDetail extends EmployeeSecurityRoleBasic {
  permissions: SecurityRolePermissionView[];
}

/** Employee record for list endpoints (jobTitle + securityRole without permissions) */
export interface EmployeeRecord {
  id: string;
  name: string;
  firstLastName: string;
  secondLastName: string | null;
  phoneNumber: string;
  email: string;
  username: string;
  avatar: string | null;
  isActive: boolean;
  securityRoleId: string;
  jobTitleId: string;
  jobTitle: EmployeeJobTitle;
  securityRole: EmployeeSecurityRoleBasic;
}

/** Employee detail for getById and write responses (securityRole with permissions) */
export interface EmployeeDetail {
  id: string;
  name: string;
  firstLastName: string;
  secondLastName: string | null;
  phoneNumber: string;
  email: string;
  username: string;
  avatar: string | null;
  isActive: boolean;
  securityRoleId: string;
  jobTitleId: string;
  jobTitle: EmployeeJobTitle;
  securityRole: EmployeeSecurityRoleDetail;
}

/** File upload data passed from controller to service */
export interface FileUpload {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
}

/** Input DTO for creating an employee */
export interface CreateEmployeeDto {
  name: string;
  firstLastName: string;
  secondLastName?: string;
  phoneNumber: string;
  email: string;
  securityRoleId: string;
  jobTitleId: string;
  isActive?: boolean;
}

/** Input DTO for updating an employee (all fields optional) */
export interface UpdateEmployeeDto {
  name?: string;
  firstLastName?: string;
  secondLastName?: string;
  phoneNumber?: string;
  email?: string;
  securityRoleId?: string;
  jobTitleId?: string;
  isActive?: boolean;
}

/** Input DTO for updating the authenticated employee's own account */
export interface UpdateMyAccountDto {
  name: string;
  firstLastName: string;
  secondLastName?: string;
  phoneNumber: string;
}

/** Result of a paginated query */
export interface PagedResult<T> {
  data: T[];
  totalPages: number;
  currentPage: number;
  itemsCount: number;
}

/**
 * Prisma select for list endpoints — whitelists exactly the scalar fields
 * exposed in EmployeeRecord (jobTitle + securityRole without permissions).
 * Uses `select` instead of `include` so sensitive fields (password, isDeleted,
 * mustChangePassword) are never fetched, let alone returned to the client.
 */
export const EMPLOYEE_LIST_SELECT = {
  id: true,
  name: true,
  firstLastName: true,
  secondLastName: true,
  phoneNumber: true,
  email: true,
  username: true,
  avatar: true,
  isActive: true,
  securityRoleId: true,
  jobTitleId: true,
  jobTitle: {
    select: {
      id: true,
      name: true,
      description: true,
      jobTitleType: true,
      isActive: true,
    },
  },
  securityRole: {
    select: { id: true, name: true, description: true, isActive: true },
  },
} as const;

/** Prisma include for detail endpoint — jobTitle + securityRole with permissions */
export const EMPLOYEE_DETAIL_INCLUDE = {
  jobTitle: true,
  securityRole: {
    include: { permissions: true },
  },
} as const;
