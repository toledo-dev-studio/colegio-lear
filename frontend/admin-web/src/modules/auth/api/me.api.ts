import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import { IS_MOCKABLE } from "@/lib/constants/environment.constants";
import type { EmployeeResponse } from "@/interfaces/responses/employee.response";

export const meAsync = async (): Promise<EmployeeResponse> => {
    await sleep();

    if (IS_MOCKABLE) {
        const { data } = await api.get<EmployeeResponse>("/auth/login.json");
        return data;
    }
    
    const { data } = await api.get<EmployeeResponse>("/auth/me");

    return data;
}
