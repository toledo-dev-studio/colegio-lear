import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import type { Employee } from "@/interfaces/entites/employee";
import type { AuthCredentials } from "../interfaces/auth-credentials";
import { VITE_ENVIRONMENT } from "@/lib/constants/environment.constants";

export const loginActionAsync = async ({ identifier, password }: Partial<AuthCredentials>): Promise<Employee> => {
    await sleep();

    if (!identifier || !password)
        throw new Error("Correo electrónico (usuario) y contraseña son requeridos");

    if (VITE_ENVIRONMENT === "mockable") {
        const { data } = await api.get<Employee>("/auth/login.json");
        return data;
    }

    const { data } = await api.post<Employee>("/auth/login", {
        identifier: identifier,
        password: password
    });

    return data;
}
