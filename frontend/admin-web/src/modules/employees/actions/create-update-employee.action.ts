import { api } from "@/api/client";

import { sleep } from "@/lib/utils";
import type { Employee } from "@/interfaces/entites/employee";
import type { EmployeeFormData } from "../interfaces/employee-form";

export const createUpdateEmployeeActionAsync = async (employeeLike: Partial<EmployeeFormData>): Promise<Employee> => {
    await sleep(500);

    const { id } = employeeLike;

    const isCreating = id === "new";

    // TODO: LOGICA PARA SUBIR IMAGEN (QUIZÁS OTRO SERVICIO)

    const { data } = await api<Employee>({
        url: isCreating ? '/employees' : `/employees/${id}`,
        method: isCreating ? 'POST' : 'PATCH',
        data: employeeLike
    });

    return {
        ...data,
    };
}
