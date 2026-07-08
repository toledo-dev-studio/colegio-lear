import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import { VITE_ENVIRONMENT } from "@/lib/constants/environment.constants";
import type { EmployeeResponse } from "@/interfaces/responses/employee.response";

export const meActionAsync = async (): Promise<EmployeeResponse> => {
    await sleep();

    if (VITE_ENVIRONMENT === "mockable") {
        const { data } = await api.get<EmployeeResponse>("/auth/login.json");
        return data;
    }
    
    const { data } = await api.get<EmployeeResponse>("/auth/me");

    return data;
}
