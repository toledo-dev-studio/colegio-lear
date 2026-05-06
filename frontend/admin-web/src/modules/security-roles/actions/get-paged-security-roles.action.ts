import { api } from "@/api/client";
import { sleep } from "@/lib/utils";
import type { SecurityRole } from "@/interfaces/entites/security-role";
import type { PagedResponse } from "@/interfaces/responses/paged.response";

interface Options {
    query?: string;
    status?: boolean,
    page?: number;
    pageSize?: number;
}

export const getPagedSecurityRolesActionAsync = async ({ query = '', status = true, page = 1, pageSize = 1 }: Options): Promise<PagedResponse<SecurityRole>> => {
    await sleep();

    const { data } = await api.get<PagedResponse<SecurityRole>>('/security-roles/paged-security-roles.json', {
        params: {
            q: query,
            status,
            page,
            pageSize,
        }
    });

    return {
        ...data
    };
}