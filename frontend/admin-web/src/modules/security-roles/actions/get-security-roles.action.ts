import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import type { SecurityRole } from "@/interfaces/entites/security-role";
import { VITE_ENVIRONMENT } from "@/lib/constants/environment.constants";

interface Options {
    query?: string;
    name?: string;
    status?: boolean
}

export const getSecurityRolesActionAsync = async ({ query, name, status }: Options): Promise<SecurityRole[]> => {
    await sleep();

    let endpoint = "/security-roles";

    if (VITE_ENVIRONMENT === "mockable")
        endpoint = "/security-roles/security-roles.json";

    const { data } = await api.get<SecurityRole[]>(endpoint, {
        params: {
            q: query,
            name,
            status
        }
    });

    return data;
}
