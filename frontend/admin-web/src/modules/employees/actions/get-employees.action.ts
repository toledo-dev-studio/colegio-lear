import { api } from "@/api/client";

import { sleep } from "@/lib/utils";
import type { Employee } from "@/interfaces/entites/employee";

interface Options {
    query?: string;
    name?: string;
    status?: boolean
    roleId?: string;
    jobTitleId?: string;
}

export const getEmployeesActionAsync = async ({
    query = '',
    name,
    status,
    roleId,
    jobTitleId
}: Options): Promise<Employee[]> => {
    await sleep();

    const { data } = await api.get<Employee[]>('/employees/employees.json', {
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
