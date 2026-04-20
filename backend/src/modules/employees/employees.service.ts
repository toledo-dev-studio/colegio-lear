import bcrypt from "bcrypt";

import { prisma } from "../../shared/lib/prisma";
import { NotFoundError } from "../../shared/errors/app-error";
import { env } from "../../shared/config/env.config";
import {
  PaginationParams,
  calculateSkip,
} from "../../shared/helpers/pagination.helper";
import {
  CreateEmployeeInput,
  UpdateEmployeeInput,
  EmployeeResponse,
} from "./employees.types";

/**
 * Create a new employee record.
 * Hashes the password with bcrypt, normalizes email to lowercase,
 * and returns the created record without the passwordHash field.
 */
export async function createEmployee(
  data: CreateEmployeeInput,
): Promise<EmployeeResponse> {
  const passwordHash = await bcrypt.hash(data.password, env.BCRYPT_SALT_ROUNDS);
  const normalizedEmail = data.email.toLowerCase();

  const employee = await prisma.employee.create({
    data: {
      firstName: data.firstName,
      lastName: data.lastName,
      email: normalizedEmail,
      passwordHash,
      employeeType: data.employeeType,
    },
    omit: { passwordHash: true },
  });

  return employee;
}

/**
 * Retrieve a paginated list of employees with optional search.
 * When search is provided, filters by firstName, lastName, or email
 * using case-insensitive contains matching.
 * Returns data array and total count, excluding passwordHash.
 */
export async function getEmployees(
  params: PaginationParams,
  search?: string,
): Promise<{ data: EmployeeResponse[]; total: number }> {
  const skip = calculateSkip(params);

  const where = search
    ? {
        OR: [
          { firstName: { contains: search, mode: "insensitive" as const } },
          { lastName: { contains: search, mode: "insensitive" as const } },
          { email: { contains: search, mode: "insensitive" as const } },
        ],
      }
    : {};

  const [data, total] = await prisma.$transaction([
    prisma.employee.findMany({
      where,
      skip,
      take: params.limit,
      omit: { passwordHash: true },
    }),
    prisma.employee.count({ where }),
  ]);

  return { data, total };
}

/**
 * Retrieve a single employee by ID.
 * Throws NotFoundError if the employee does not exist.
 * Returns the record without passwordHash.
 */
export async function getEmployeeById(id: number): Promise<EmployeeResponse> {
  const employee = await prisma.employee.findUnique({
    where: { id },
    omit: { passwordHash: true },
  });

  if (!employee) {
    throw new NotFoundError("Employee not found");
  }

  return employee;
}

/**
 * Update an existing employee record.
 * Only updates the fields provided in the input.
 * If a new password is provided, it is hashed before storing.
 * If email is provided, it is normalized to lowercase.
 * Prisma throws P2025 if the employee is not found (handled by global error handler).
 * Returns the updated record without passwordHash.
 */
export async function updateEmployee(
  id: number,
  data: UpdateEmployeeInput,
): Promise<EmployeeResponse> {
  const updateData: Record<string, unknown> = {};

  if (data.firstName !== undefined) {
    updateData.firstName = data.firstName;
  }
  if (data.lastName !== undefined) {
    updateData.lastName = data.lastName;
  }
  if (data.email !== undefined) {
    updateData.email = data.email.toLowerCase();
  }
  if (data.employeeType !== undefined) {
    updateData.employeeType = data.employeeType;
  }
  if (data.password !== undefined) {
    updateData.passwordHash = await bcrypt.hash(
      data.password,
      env.BCRYPT_SALT_ROUNDS,
    );
  }

  const employee = await prisma.employee.update({
    where: { id },
    data: updateData,
    omit: { passwordHash: true },
  });

  return employee;
}

/**
 * Deactivate an employee by setting isActive to false.
 * Returns the updated record without passwordHash.
 * Prisma throws P2025 if the employee is not found (handled by global error handler).
 */
export async function deactivateEmployee(
  id: number,
): Promise<EmployeeResponse> {
  const employee = await prisma.employee.update({
    where: { id },
    data: { isActive: false },
    omit: { passwordHash: true },
  });

  return employee;
}
