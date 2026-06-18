import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import { VITE_ENVIRONMENT } from "@/lib/constants/environment.constants";
import type { SecurityRoleResponse } from "@/interfaces/responses/security-role.response";

interface Options {
    query?: string;
    name?: string;
    isActive?: boolean
}

export const getSecurityRolesActionAsync = async ({ query, name, isActive }: Options): Promise<SecurityRoleResponse[]> => {
    await sleep();

    let endpoint = "/security-roles";

    if (VITE_ENVIRONMENT === "mockable")
        endpoint = "/security-roles/security-roles.json";

    const { data } = await api.get<SecurityRoleResponse[]>(endpoint, {
        params: {
            q: query,
            name,
            isActive
        }
    });

    return data;
}
