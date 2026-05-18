import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import type { Employee } from "@/interfaces/entites/employee";
import { VITE_ENVIRONMENT } from "@/lib/constants/environment.constants";

interface Options {
    query?: string;
    name?: string;
    status?: boolean
    roleId?: string;
    jobTitleId?: string;
}

export const getEmployeesActionAsync = async ({ query = '', name, status, roleId, jobTitleId }: Options): Promise<Employee[]> => {
    await sleep();

    let endpoint = "/employees";

    if (VITE_ENVIRONMENT === "mockable")
        endpoint = "/employees/employees.json";

    const { data } = await api.get<Employee[]>(endpoint, {
        params: {
            q: query,
            name,
            status,
            roleId,
            jobTitleId
        }
    });

    return data;
}
