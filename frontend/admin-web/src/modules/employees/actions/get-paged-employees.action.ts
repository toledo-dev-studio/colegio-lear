import { api } from "@/api/client";
import { sleep } from "@/lib/utils";
import type { Employee } from "@/interfaces/entites/employee";
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

    const { 
        query = '', 
        page = 1, 
        pageSize = 1,
        name,
        status,
        roleId,
        jobTitleId,
    } = options;

    await sleep();

    const { data } = await api.get<PagedResponse<Employee>>('/employees/paged-employees.json', {
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
