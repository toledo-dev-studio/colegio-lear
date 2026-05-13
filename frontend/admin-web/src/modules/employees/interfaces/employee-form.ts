import type { Employee } from "@/interfaces/entites/employee";

export interface EmployeeFormData extends Employee {
    file?: File;
}