import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import { IS_MOCKABLE } from "@/lib/constants/environment.constants";
import type { SecurityRoleResponse } from "@/interfaces/responses/security-role.response";

interface Options {
    query?: string;
    name?: string;
    isActive?: boolean
}

export const getSecurityRolesAsync = async ({ query, name, isActive }: Options): Promise<SecurityRoleResponse[]> => {
    await sleep();

    let endpoint = "/security-roles";

    if (IS_MOCKABLE)
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
