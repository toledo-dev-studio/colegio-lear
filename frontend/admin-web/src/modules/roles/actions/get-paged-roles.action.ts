import { api } from "@/api/client";
import { sleep } from "@/lib/utils";
import type { Role } from "@/interfaces/entites/role";
import type { PagedResponse } from "@/interfaces/responses/paged.response";

interface Options {
    query?: string;
    status?: boolean,
    page?: number;
    pageSize?: number;
}

export const getPagedRolesActionAsync = async ({ query = '', status = true, page = 1, pageSize = 1 }: Options): Promise<PagedResponse<Role>> => {
    await sleep();

    const { data } = await api.get<PagedResponse<Role>>('/roles/paged-roles.json', {
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