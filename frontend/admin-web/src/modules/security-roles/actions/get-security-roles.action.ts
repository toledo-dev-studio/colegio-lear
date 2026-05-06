import { api } from "@/api/client";

import { sleep } from "@/lib/utils";
import type { SecurityRole } from "@/interfaces/entites/security-role";

interface Options {
    query?: string;
    status?: boolean
}

export const getSecurityRolesActionAsync = async ({ query = '', status = true }: Options): Promise<SecurityRole[]> => {
    await sleep();

    const { data } = await api.get<SecurityRole[]>('/security-roles/security-roles.json', {
        params: {
            q: query,
            status
        }
    });

    return data;
}
