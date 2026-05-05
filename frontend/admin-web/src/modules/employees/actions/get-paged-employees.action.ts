import { api } from "@/api/client";
import type { Employee } from "@/interfaces/entites/employee";
import type { PagedResponse } from "@/interfaces/responses/paged.response";
import { sleep } from "@/lib/utils";

interface Options {
    query?: string;
    status?: boolean,
    roleId?: string,
    page?: number;
    pageSize?: number;
}

export const getPagedEmployeesActionAsync = async (options: Options): Promise<PagedResponse<Employee>> => {

    const { 
        query = '', 
        status = true, 
        roleId = undefined,
        page = 1, 
        pageSize = 1 
    } = options;

    await sleep();

    const { data } = await api.get<PagedResponse<Employee>>('/employees/paged-employees.json', {
        params: {
            q: query,
            status,
            roleId,
            page,
            pageSize,
        }
    });

    return {
        ...data
    };
}
