import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import type { SecurityRole } from "@/interfaces/entites/security-role";
import { VITE_ENVIRONMENT } from "@/lib/constants/environment.constants";
import type { PagedResponse } from "@/interfaces/responses/paged.response";

interface Options {
    query?: string;
    page?: number;
    pageSize?: number;
    name?: string;
    status?: boolean,
}

export const getPagedSecurityRolesActionAsync = async ({ query, page = 1, pageSize = 1, name, status }: Options): Promise<PagedResponse<SecurityRole>> => {
    await sleep();

    let endpoint = "/security-roles/paged";

    if (VITE_ENVIRONMENT === "mockable")
        endpoint = "/security-roles/paged-security-roles.json";

    const { data } = await api.get<PagedResponse<SecurityRole>>(endpoint, {
        params: {
            q: query,
            page,
            pageSize,
            name,
            status,
        }
    });

    return {
        ...data
    };
}
