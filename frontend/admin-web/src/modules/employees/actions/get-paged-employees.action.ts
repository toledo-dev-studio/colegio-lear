import { api } from "@/api/client";
import { sleep } from "@/lib/utils";
import type { Employee } from "@/interfaces/entites/employee";
import type { PagedResponse } from "@/interfaces/responses/paged.response";

interface Options {
    query?: string;
    status?: boolean;
    roleId?: string;
    jobTitleId?: string;
    page?: number;
    pageSize?: number;
}

export const getPagedEmployeesActionAsync = async (options: Options): Promise<PagedResponse<Employee>> => {

    const { 
        query = '', 
        status = true, 
        roleId = undefined,
        jobTitleId = undefined,
        page = 1, 
        pageSize = 1 
    } = options;

    await sleep();

    const { data } = await api.get<PagedResponse<Employee>>('/employees/paged-employees.json', {
        params: {
            q: query,
            status,
            roleId,
            jobTitleId,
            page,
            pageSize,
        }
    });

    return {
        ...data
    };
}
