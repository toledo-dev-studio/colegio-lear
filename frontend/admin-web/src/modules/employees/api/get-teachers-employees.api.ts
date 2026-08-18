import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import { IS_MOCKABLE } from "@/lib/constants/environment.constants";
import type { EmployeeResponse } from "@/interfaces/responses/employee.response";

export const getTeachersEmployeesAsync = async (): Promise<EmployeeResponse[]> => {
    await sleep();

    let endpoint = "/employees/teachers";

    if (IS_MOCKABLE)
        endpoint = "/employees/employees.json";

    const { data } = await api.get<EmployeeResponse[]>(endpoint);

    return data;
}
