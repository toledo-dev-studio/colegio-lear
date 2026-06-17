import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import { VITE_ENVIRONMENT } from "@/lib/constants/environment.constants";
import type { PagedResponse } from "@/interfaces/responses/paged.response";
import type { SecurityRoleResponse } from "@/interfaces/responses/security-role.response";

interface Options {
    query?: string;
    page?: number;
    pageSize?: number;
    name?: string;
    isActive?: boolean,
}

export const getPagedSecurityRolesActionAsync = async ({ query, page = 1, pageSize = 1, name, isActive }: Options): Promise<PagedResponse<SecurityRoleResponse>> => {
    await sleep();

    let endpoint = "/security-roles/paged";

    if (VITE_ENVIRONMENT === "mockable")
        endpoint = "/security-roles/paged-security-roles.json";

    const { data } = await api.get<PagedResponse<SecurityRoleResponse>>(endpoint, {
        params: {
            q: query,
            page,
            pageSize,
            name,
            isActive,
        }
    });

    return {
        ...data
    };
}
