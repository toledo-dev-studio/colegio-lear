import { api } from "@/api/client";

import { sleep } from "@/lib/utils";
import type { Scholarship } from "@/interfaces/entites/scholarship";
import type { PagedResponse } from "@/interfaces/responses/paged.response";

interface Options {
    query?: string;
    status?: boolean,
    page?: number;
    pageSize?: number;
}

export const getPagedScholarshipsActionAsync = async ({ query = '', status = true, page = 1, pageSize = 1 }: Options): Promise<PagedResponse<Scholarship>> => {
    await sleep();

    const { data } = await api.get<PagedResponse<Scholarship>>('/scholarships/paged-scholarships.json', {
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
