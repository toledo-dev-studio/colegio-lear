import { api } from "@/api/client";

import { sleep } from "@/lib/utils";
import type { Employee } from "@/interfaces/entites/employee";

export const CreateUpdateEmployeeActionAsync = async (employeeLike: Partial<Employee>): Promise<Employee> => {
    await sleep(500);

    const { id } = employeeLike;

    const isCreating = id === "new";

    const { data } = await api<Employee>({
        url: isCreating ? '/employees' : `/employees/${id}`,
        method: isCreating ? 'POST' : 'PATCH',
        data: employeeLike
    });

    return {
        ...data,
    };
}
