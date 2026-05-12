import { api } from "@/api/client";
import { sleep } from "@/lib/utils";
import type { SecurityRole } from "@/interfaces/entites/security-role";
import type { PagedResponse } from "@/interfaces/responses/paged.response";

interface Options {
    query?: string;
    page?: number;
    pageSize?: number;
    name?: string;
    status?: boolean,
}

export const getPagedSecurityRolesActionAsync = async ({ query = '', page = 1, pageSize = 1, name, status }: Options): Promise<PagedResponse<SecurityRole>> => {
    await sleep();

    const { data } = await api.get<PagedResponse<SecurityRole>>('/security-roles/paged-security-roles.json', {
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