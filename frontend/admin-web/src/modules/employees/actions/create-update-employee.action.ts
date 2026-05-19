import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import { generateTemporalId } from "@/lib/extensions/utils";
import type { Employee } from "@/interfaces/entites/employee";
import type { EmployeeFormData } from "../interfaces/employee-form";
import { VITE_ENVIRONMENT } from "@/lib/constants/environment.constants";

export const createUpdateEmployeeActionAsync = async (employeeLike: Partial<EmployeeFormData>): Promise<Employee> => {
    await sleep();

    const { id } = employeeLike;
    const isCreating = id === undefined;

    if (VITE_ENVIRONMENT === "mockable") {
        employeeLike.id = isCreating ? generateTemporalId() : id;
        return employeeLike as Employee;
    }

    let fileFormData = new FormData();
    if (employeeLike.file)
        fileFormData.append('file', employeeLike.file);

    const { data } = await api<Employee>({
        url: isCreating ? "/employees" : `/employees/${id}`,
        method: isCreating ? 'POST' : 'PATCH',
        data: {
            ...employeeLike,
            file: employeeLike.file ? fileFormData : undefined
        }
    });

    return {
        ...data,
    };
}
