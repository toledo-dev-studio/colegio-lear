import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import type { Employee } from "@/interfaces/entites/employee";
import { VITE_ENVIRONMENT } from "@/lib/constants/environment.constants";
import type { PagedResponse } from "@/interfaces/responses/paged.response";

interface Options {
    query?: string;
    page?: number;
    pageSize?: number;
    name?: string;
    status?: boolean;
    roleId?: string;
    jobTitleId?: string;
}

export const getPagedEmployeesActionAsync = async (options: Options): Promise<PagedResponse<Employee>> => {
    await sleep();

    const { query, page = 1, pageSize = 1, name, status, roleId, jobTitleId } = options;

    let endpoint = "/employees/paged";

    if (VITE_ENVIRONMENT === "mockable")
        endpoint = "/employees/paged-employees.json";

    const { data } = await api.get<PagedResponse<Employee>>(endpoint, {
        params: {
            q: query,
            page,
            pageSize,
            name,
            status,
            roleId,
            jobTitleId,
        }
    });

    return {
        ...data
    };
}
