import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import type { Employee } from "@/interfaces/entites/employee";
import type { AuthCredentials } from "../interfaces/auth-credentials";
import { VITE_ENVIRONMENT } from "@/lib/constants/environment.constants";

export const loginActionAsync = async (credentials: AuthCredentials): Promise<Employee> => {
    await sleep();

    if (VITE_ENVIRONMENT === "mockable") {
        const { data } = await api.get<Employee>("/auth/login.json");
        return data;
    }
    console.log(credentials);
    
    const { data } = await api.post<Employee>("/auth/login", credentials);
console.log(data);

    return data;
}
