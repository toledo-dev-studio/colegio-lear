import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import { VITE_ENVIRONMENT } from "@/lib/constants/environment.constants";
import type { PagedResponse } from "@/interfaces/responses/paged.response";
import type { EmployeeFilter } from "@/interfaces/filters/employee.filter";
import type { EmployeeResponse } from "@/interfaces/responses/employee.response";

interface Options extends EmployeeFilter {
    query?: string;
    page?: number;
    pageSize?: number;
}

export const getPagedEmployeesActionAsync = async (options: Options): Promise<PagedResponse<EmployeeResponse>> => {
    await sleep();

    const { query, page = 1, pageSize = 1, fullName, isActive, securityRoleId, jobTitleId } = options;

    let endpoint = "/employees/paged";

    if (VITE_ENVIRONMENT === "mockable")
        endpoint = "/employees/paged-employees.json";

    const { data } = await api.get<PagedResponse<EmployeeResponse>>(endpoint, {
        params: {
            q: query,
            page,
            pageSize,
            fullName,
            isActive,
            securityRoleId,
            jobTitleId,
        }
    });

    return {
        ...data
    };
}
