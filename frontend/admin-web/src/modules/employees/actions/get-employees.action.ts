import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import { VITE_ENVIRONMENT } from "@/lib/constants/environment.constants";
import type { EmployeeResponse } from "@/interfaces/responses/employee.response";

interface Options {
    query?: string;
    name?: string;
    isActive?: boolean
    securityRoleId?: string;
    jobTitleId?: string;
}

export const getEmployeesActionAsync = async ({ query = '', name, isActive, securityRoleId, jobTitleId }: Options): Promise<EmployeeResponse[]> => {
    await sleep();

    let endpoint = "/employees";

    if (VITE_ENVIRONMENT === "mockable")
        endpoint = "/employees/employees.json";

    const { data } = await api.get<EmployeeResponse[]>(endpoint, {
        params: {
            q: query,
            name,
            isActive,
            securityRoleId,
            jobTitleId
        }
    });

    return data;
}
