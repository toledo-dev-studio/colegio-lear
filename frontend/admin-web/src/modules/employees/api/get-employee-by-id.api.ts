import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import { IS_MOCKABLE } from "@/lib/constants/environment.constants";
import type { EmployeeResponse } from "@/interfaces/responses/employee.response";

interface Options {
    id: string;
}

export const getEmployeeByIdAsync = async ({ id }: Options): Promise<EmployeeResponse> => {
    await sleep();

    if (IS_MOCKABLE) {
        const { data } = await api.get<EmployeeResponse[]>(`/employees/employees.json`);
        const response = data.find(item => item.id === id);
        if (!response)
            throw new Error("No se encontró el registro solicitado");
        return response;
    }

    const { data } = await api.get<EmployeeResponse>(`/employees/${id}`);

    return data;
}
