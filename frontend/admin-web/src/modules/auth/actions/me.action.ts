import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import type { Employee } from "@/interfaces/entites/employee";
import { VITE_ENVIRONMENT } from "@/lib/constants/environment.constants";

export const meActionAsync = async (): Promise<Employee> => {
    await sleep();

    if (VITE_ENVIRONMENT === "mockable") {
        const { data } = await api.get<Employee>("/auth/login.json");
        return data;
    }
    
    const { data } = await api.get<Employee>("/auth/me");

    return data;
}
