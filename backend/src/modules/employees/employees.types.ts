/**
 * TypeScript interfaces for the employees module.
 * These types define the shape of data flowing through the service layer.
 */

/** Input for creating a new employee */
export interface CreateEmployeeInput {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  employeeType: string;
}

/** Input for updating an existing employee (all fields optional) */
export interface UpdateEmployeeInput {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  employeeType?: string;
}

/** Employee data returned by the API — never includes passwordHash */
export interface EmployeeResponse {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  employeeType: string;
  isActive: boolean;
  profileId: number | null;
  createdAt: Date;
  updatedAt: Date;
}
