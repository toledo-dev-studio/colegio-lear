import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import { VITE_ENVIRONMENT } from "@/lib/constants/environment.constants";
import type { EmployeeFilter } from "@/interfaces/filters/employee.filter";
import type { EmployeeResponse } from "@/interfaces/responses/employee.response";

interface Options extends EmployeeFilter {
    query?: string;
}

export const getEmployeesActionAsync = async ({ query, fullName, isActive, securityRoleId, jobTitleId }: Options): Promise<EmployeeResponse[]> => {
    await sleep();

    let endpoint = "/employees";

    if (VITE_ENVIRONMENT === "mockable")
        endpoint = "/employees/employees.json";

    const { data } = await api.get<EmployeeResponse[]>(endpoint, {
        params: {
            q: query,
            fullName,
            isActive,
            securityRoleId,
            jobTitleId
        }
    });

    return data;
}
