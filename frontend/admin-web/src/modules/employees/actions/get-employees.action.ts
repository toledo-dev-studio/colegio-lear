import { api } from "@/api/client";

import { sleep } from "@/lib/utils";
import type { Employee } from "@/interfaces/entites/employee";

interface Options {
    query?: string;
    status?: boolean
    roleId?: string;
    jobTitleId?: string;
}

export const getEmployeesActionAsync = async ({ query = '', status = true, roleId = undefined, jobTitleId = undefined }: Options): Promise<Employee[]> => {
    await sleep();

    const { data } = await api.get<Employee[]>('/employees/employees.json', {
        params: {
            q: query,
            status,
            roleId,
            jobTitleId
        }
    });

    return data;
}
