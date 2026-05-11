import { api } from "@/api/client";

import { sleep } from "@/lib/utils";
import type { SecurityRole } from "@/interfaces/entites/security-role";

interface Options {
    query?: string;
    name?: string;
    status?: boolean
}

export const getSecurityRolesActionAsync = async ({ query = '', name, status }: Options): Promise<SecurityRole[]> => {
    await sleep();

    const { data } = await api.get<SecurityRole[]>('/security-roles/security-roles.json', {
        params: {
            q: query,
            name,
            status
        }
    });

    return data;
}
