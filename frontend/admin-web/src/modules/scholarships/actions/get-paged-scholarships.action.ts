import { api } from "@/api/client";

import { sleep } from "@/lib/utils";
import type { Scholarship } from "@/interfaces/entites/scholarship";
import type { PagedResponse } from "@/interfaces/responses/paged.response";

interface Options {
    query?: string;
    status?: boolean,
    discountPercentage?: number,
    page?: number;
    pageSize?: number;
}

export const getPagedScholarshipsActionAsync = async ({ query = '', status = true, discountPercentage = undefined, page = 1, pageSize = 1 }: Options): Promise<PagedResponse<Scholarship>> => {
    await sleep();

    const { data } = await api.get<PagedResponse<Scholarship>>('/scholarships/paged-scholarships.json', {
        params: {
            q: query,
            status,
            discountPercentage,
            page,
            pageSize,
        }
    });

    return {
        ...data
    };
}
