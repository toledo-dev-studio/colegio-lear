import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import type { Employee } from "@/interfaces/entites/employee";
import { VITE_ENVIRONMENT } from "@/lib/constants/environment.constants";

export const getTeachersEmployeesActionAsync = async (): Promise<Employee[]> => {
    await sleep();

    // REMOVE (UPDATE TO /employees/teachers)
    let endpoint = "/employees";

    if (VITE_ENVIRONMENT === "mockable")
        endpoint = "/employees/employees.json";

    const { data } = await api.get<Employee[]>(endpoint);

    return data;
}
