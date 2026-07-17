import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import { VITE_ENVIRONMENT } from "@/lib/constants/environment.constants";
import type { EmployeeResponse } from "@/interfaces/responses/employee.response";

interface Options {
    id: string;
}

export const getEmployeeByIdActionAsync = async ({ id }: Options): Promise<EmployeeResponse> => {
    await sleep();

    if (VITE_ENVIRONMENT === "mockable") {
        const { data } = await api.get<EmployeeResponse[]>(`/employees/employees.json`);
        const response = data.find(item => item.id === id);
        if (!response)
            throw new Error("No se encontró el registro solicitado");
        return response;
    }

    const { data } = await api.get<EmployeeResponse>(`/employees/${id}`);

    return data;
}
