/** Filters applicable to employee list endpoints */
export interface EmployeeFilters {
  q?: string;
  name?: string;
  status?: boolean;
  roleId?: string;
  jobTitleId?: string;
}

/** Nested JobTitle in employee responses */
export interface EmployeeJobTitle {
  id: string;
  name: string;
  description: string;
  jobTitleType: string;
  status: boolean;
}

/** Nested SecurityRole in list responses (no permissions) */
export interface EmployeeSecurityRoleBasic {
  id: string;
  name: string;
  description: string;
  status: boolean;
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
  secondLastName: string;
  phoneNumber: string;
  email: string;
  username: string;
  image: string | null;
  status: boolean;
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
  secondLastName: string;
  phoneNumber: string;
  email: string;
  username: string;
  image: string | null;
  status: boolean;
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
  secondLastName: string;
  phoneNumber: string;
  email: string;
  securityRoleId: string;
  jobTitleId: string;
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
}

/** Result of a paginated query */
export interface PagedResult<T> {
  data: T[];
  totalPages: number;
  currentPage: number;
  itemsCount: number;
}

/** Prisma include for list endpoints — jobTitle + securityRole without permissions */
export const EMPLOYEE_LIST_INCLUDE = {
  jobTitle: true,
  securityRole: {
    select: { id: true, name: true, description: true, status: true },
  },
} as const;

/** Prisma include for detail endpoint — jobTitle + securityRole with permissions */
export const EMPLOYEE_DETAIL_INCLUDE = {
  jobTitle: true,
  securityRole: {
    include: { permissions: true },
  },
} as const;
