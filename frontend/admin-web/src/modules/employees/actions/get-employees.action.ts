import { api } from "@/api/client";

import { sleep } from "@/lib/utils";
import type { Employee } from "@/interfaces/entites/employee";

interface Options {
    query?: string;
    status?: boolean
    roleId?: string;
}

export const getEmployeesActionAsync = async ({ query = '', status = true, roleId = undefined }: Options): Promise<Employee[]> => {
    await sleep();

    const { data } = await api.get<Employee[]>('/employees/employees.json', {
        params: {
            q: query,
            status,
            roleId,
        }
    });

    return data;
}
