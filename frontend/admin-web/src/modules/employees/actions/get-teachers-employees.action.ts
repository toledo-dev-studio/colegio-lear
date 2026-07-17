import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import { VITE_ENVIRONMENT } from "@/lib/constants/environment.constants";
import type { EmployeeResponse } from "@/interfaces/responses/employee.response";

export const getTeachersEmployeesActionAsync = async (): Promise<EmployeeResponse[]> => {
    await sleep();

    let endpoint = "/employees/teachers";

    if (VITE_ENVIRONMENT === "mockable")
        endpoint = "/employees/employees.json";

    const { data } = await api.get<EmployeeResponse[]>(endpoint);

    return data;
}
