import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import type { Employee } from "@/interfaces/entites/employee";
import { VITE_ENVIRONMENT } from "@/lib/constants/environment.constants";
import type { EmployeeFormData } from "@/modules/employees/interfaces/employee-form";

export const updateMyAccountActionAsync = async (employeeLike: Partial<EmployeeFormData>): Promise<Employee> => {
    await sleep();

    if (VITE_ENVIRONMENT === "mockable") {
        return employeeLike as Employee;
    }
    
    let fileFormData = new FormData();
    if (employeeLike.file)
        fileFormData.append('file', employeeLike.file);

    const { data } = await api.patch<Employee>("/employees/me", {
        name: employeeLike.name,
        firstLastName: employeeLike.firstLastName,
        secondLastName: employeeLike.secondLastName,
        phoneNumber: employeeLike.phoneNumber,
        file: employeeLike.file ? fileFormData : undefined
    });

    return {
        ...data,
    };
}
