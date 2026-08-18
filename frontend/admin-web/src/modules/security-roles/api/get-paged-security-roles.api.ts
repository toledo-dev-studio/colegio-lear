import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import { IS_MOCKABLE } from "@/lib/constants/environment.constants";
import type { PagedResponse } from "@/interfaces/responses/paged.response";
import type { SecurityRoleResponse } from "@/interfaces/responses/security-role.response";
import type { SecurityRoleFilter } from "@/interfaces/filters/security-role.filter";

interface Options extends SecurityRoleFilter {
    query?: string;
    page?: number;
    pageSize?: number;
}

export const getPagedSecurityRolesAsync = async ({ query, page = 1, pageSize = 1, name, isActive }: Options): Promise<PagedResponse<SecurityRoleResponse>> => {
    await sleep();

    let endpoint = "/security-roles/paged";

    if (IS_MOCKABLE)
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
