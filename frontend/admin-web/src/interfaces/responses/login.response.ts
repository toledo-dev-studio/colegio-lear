import type { EmployeeResponse } from "./employee.response";

export interface LoginResponse extends EmployeeResponse {
    mustChangePassword: boolean;
}